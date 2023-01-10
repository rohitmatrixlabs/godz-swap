import "./App.css";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";

import ReactDOM from "react-dom";
import symbol from "./assets/icon__1.png";
import arrowDown from "./assets/arrowDown.png";
import zigZag from "./assets/zig-zag.png";
import SearchBox from "./components/SearchBox/SearchBox";
import ClipLoader from "react-spinners/ClipLoader";

import { ethers, FixedNumber } from "ethers";
import {
  BestRouteResponse,
  EvmTransaction,
  MetaResponse,
  RangoClient,
  TransactionStatus,
  TransactionStatusResponse,
  WalletRequiredAssets,
  WalletDetail,
  SwapFee,
  Token,
} from "rango-sdk";
import { Notyf } from "notyf";
import {
  checkApprovalSync,
  prepareEvmTransaction,
  prettyAmount,
  sleep,
} from "./utils";
var chains = require("./chainMap.json");
// import { chains } from "./chainMap";

declare let window: any;
type WalletAddresses = { blockchain: string; address: string }[];

export const App = () => {
  const notyf = new Notyf({
    duration: 3000,
    position: { x: "right", y: "top" },
    dismissible: true,
  });
  const m: Map<string, string> = new Map([["1", "ETH"]]);
  console.log(m.get("13"));

  const RANGO_API_KEY = "3d58b20a-11a4-4d6f-9a09-a2807f0f0812"; // put your RANGO-API-KEY here
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const [currentChain, setCurrentChain] = useState<any>();
  const rangoClient = useMemo(() => new RangoClient(RANGO_API_KEY), []);
  const [wallet, setWallet] = useState<WalletDetail>();
  const [tokensMeta, setTokenMeta] = useState<MetaResponse | null>();
  const [inputAmount, setInputAmount] = useState<string>("0.01");
  const [bestRoute, setBestRoute] = useState<BestRouteResponse | null>();
  const [txStatus, setTxStatus] = useState<TransactionStatusResponse | null>(
    null
  );
  let t: SwapFee[] = [];
  let t1: Number[] = [];
  const [details, setDetails] = useState({
    fee: t,
    estimatedTimeInSeconds: t1,
    swapChainType: "",
    usdTransfer: 0,
    convertLeftRate: 0,
    convertRightRate: 0,
    availableAmount: 0,
    totalFee: 0,
    avgTime: 0,
    maxTime: 0,
    minTime: 0,
    totalTime: 0,
  });
  const [currId, setCurrId] = useState(1);
  const [readyToExeccute, setReadyToExecute] = useState<boolean>(false);
  const [requiredAssets, setRequiredAssets] = useState<WalletRequiredAssets[]>(
    []
  );
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);

  const [search_value, setSearchValue] = useState<any>();
  const emptyToken = {
    name: "select",
    symbol: "select",
    address: "",
    usdPrice: 0,
  };
  const [currency1, setCurrency1] = useState<any>(emptyToken);

  const [currency2, setCurrency2] = useState<any>(emptyToken);

  const [loadingMeta, setLoadingMeta] = useState<boolean>(true);
  const [loadingSwap, setLoadingSwap] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<any>([]);
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [search_styles, setSearch_style] = useState("search-input");
  const [search_styles2, setSearch_style2] = useState("search-input");
  const [search, setSearch] = useState<any>();
  const [currCurrency, setCurrCurrency] = useState<any>({});
  const [loadingCurrency, setLoadingCurrency] = useState<boolean>();
  const [ConversionRate, setConversionRate] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [signer, setSigner] = useState<any>();

  const onChange = (event: any) => {
    setValue(event.target.value);
    if (event.target.value === "") {
      setSearch_style("search-input");
    } else {
      setSearch_style("search-input active");
    }
  };

  const onNetworkSelect = (event: any) => {
    setValue2(event.target.value);
    if (event.target.value === "") {
      setSearch_style2("search-input");
    } else {
      setSearch_style2("search-input active");
    }
  };

  const onSearch = (searchTerm: any) => {
    setValue("");
    setSearch_style("search-input");
    console.log(searchTerm);
    toggleModal();
    setLoadingCurrency(false);
    if (currId == 1) {
      setCurrency1(searchTerm);
    } else {
      setCurrency2(searchTerm);
    }
    // props.childToParent(searchTerm);
    // our api to fetch the search result
  };

  const notFound = () => {
    return <li>{"Token Not Found"}</li>;
  };

  useEffect(() => {
    getUserWallet().then((user) => {
      setSigner(user);
    });
    provider.getNetwork().then((network) => {
      var temp = chains[network.chainId];
      if (temp !== undefined) setCurrentChain(temp);
      else {
        notyf.error("please change the chain");
      }
    });
  }, []);
  useEffect(() => {
    setLoadingMeta(true);
    // Meta provides all blockchains, tokens and swappers information supported by Rango
    rangoClient.getAllMetadata().then((meta) => {
      setTokenMeta(meta);

      setLoadingMeta(false);
    });
  }, [rangoClient]);

  useEffect(() => {
    if (tokensMeta === undefined || currentChain === undefined) {
      return;
    }
    let temp = tokensMeta?.tokens
      .filter((item) => {
        const searchTerm = value.toLowerCase();
        var fullName = "";
        var blockchain = "";
        if (item.name !== null) {
          fullName = item.name.toLowerCase();
          blockchain = item.blockchain.toLowerCase();
        } else {
          return false;
        }
        return (
          searchTerm &&
          currentChain &&
          fullName.startsWith(searchTerm) &&
          fullName !== searchTerm &&
          blockchain === currentChain.toLowerCase()
        );
      })
      .map((item) => (
        <li onClick={() => onSearch(item)} key={item.address}>
          {item.name}
        </li>
      ));
    setSearch(temp);
  }, [value]);

  useEffect(() => {
    if (tokensMeta === undefined) {
      return;
    }

    let temp = Array.from(m)
      .filter(([key, value]) => {
        var fullName = value.toLowerCase();
        var term = value2.toLowerCase();
        console.log(key, value);
        return value2 && fullName.startsWith(term) && fullName !== term;
      })
      .map(([key, value]: any) => {
        console.log(key);

        if (true) {
          let temp = toHex(key);
          return (
            <li
              onClick={() => {
                toggleModal2();
                switchNetwork(temp);
              }}
              key={key}
            >
              {value}
            </li>
          );
        }
      });
    setSearch(temp);
  }, [value2]);

  const usdtAddressInPolygon = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
  // window.ethereum.on("accountsChanged", function (accounts: any) {
  //   provider.getNetwork().then((network) => {
  //     var temp = chains[network.chainId];
  //     setCurrentChain(temp);
  //   });

  //   // Time to reload your interface with accounts[0]!
  // });

  window.ethereum.on("networkChanged", function (networkId: any) {
    var temp = chains[networkId];
    if (temp !== undefined) setCurrentChain(temp);
    else {
      setCurrentChain(temp);
      notyf.error("please change the chain to binance");
    }

    // Time to reload your interface with networks[0]!);

    // Time to reload your interface with the new networkId
  });
  // tokensMeta?.tokens.find((t) => {
  //   if (t.name === "BNB") {
  //     console.log(t);
  //   }
  // });

  var maticToken = tokensMeta?.tokens.find(
    (t) => t.blockchain === "POLYGON" && t.address === usdtAddressInPolygon
  );
  var usdtToken = tokensMeta?.tokens.find(
    (t) => t.blockchain === "POLYGON" && t.address === null
  );

  const getUserWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    return await provider.getSigner().getAddress();
  };

  const swap = async () => {
    setReadyToExecute(false);
    setError("");
    setBestRoute(null);
    setTxStatus(null);
    setRequiredAssets([]);
    let userAddress = "";
    try {
      userAddress = await getUserWallet();
    } catch (err) {
      setError(
        "Error connecting to MetMask. Please check Metamask and try again."
      );
      notyf.error(
        "Error connecting to MetMask. Please check Metamask and try again."
      );

      return;
    }

    if (!window.ethereum.isConnected()) {
      notyf.error(
        "Error connecting to MetMask. Please check Metamask and try again."
      );

      setError(
        "Error connecting to MetMask. Please check Metamask and try again."
      );
      return;
    }

    // it multi swap example, you should check chain id before each evm swap
    // if (window.ethereum.chainId && parseInt(window.ethereum.chainId) !== 137) {
    //   setError(`Change meta mask network to 'Polygon'.`);
    //   return;
    // }

    if (!userAddress) {
      setError(`Could not get wallet address.`);
      notyf.error("Could not get wallet address.");

      return;
    }
    if (!inputAmount) {
      notyf.error("Set input amount");

      setError(`Set input amount`);
      return;
    }
    if (!currency1 || !currency2) return;

    setLoadingSwap(true);
    const connectedWallets = [
      { blockchain: currentChain, addresses: [userAddress] },
    ];
    const selectedWallets = { [currentChain]: userAddress };
    const from = {
      blockchain: currency1?.blockchain,
      symbol: currency1?.symbol,
      address: currency1.address,
    };
    const to = {
      blockchain: currency2?.blockchain,
      symbol: currency2?.symbol,
      address: currency2.address,
    };
    const data = tokensMeta?.tokens;

    // If you just want to show route to user, set checkPrerequisites: false.
    // Also for multi steps swap, it is faster to get route first with {checkPrerequisites: false} and if users confirms.
    // check his balance with {checkPrerequisites: true} in another get best route request
    console.log({
      amount: inputAmount,
      affiliateRef: null,
      checkPrerequisites: true,
      connectedWallets,
      from,
      selectedWallets,
      to,
    });

    const bestRoute = await rangoClient.getBestRoute({
      amount: inputAmount,
      affiliateRef: null,
      checkPrerequisites: true,
      connectedWallets,
      from,
      selectedWallets,
      to,
    });
    setBestRoute(bestRoute);

    console.log({ bestRoute });
    if (
      !bestRoute ||
      !bestRoute?.result ||
      !bestRoute?.result?.swaps ||
      bestRoute.result?.swaps?.length === 0
    ) {
      notyf.error("Invalid route response from server, please try again.");
      setError(`Invalid route response from server, please try again.`);
      setLoadingSwap(false);
      return;
    }

    const requiredCoins =
      bestRoute.validationStatus?.flatMap((v) =>
        v.wallets.flatMap((w) => w.requiredAssets)
      ) || [];
    setRequiredAssets(requiredCoins);
    const hasEnoughBalance = requiredCoins
      ?.map((it) => it.ok)
      .reduce((a, b) => a && b);

    if (!hasEnoughBalance) {
      notyf.error("Not enough balance or fee!");
      setError(`Not enough balance or fee!`);
      setLoadingSwap(false);
      return;
    } else if (bestRoute) {
      setReadyToExecute(true);
      setLoadingSwap(false);
      // await executeRoute(bestRoute);
    }
  };

  const executeRoute = async (routeResponse: BestRouteResponse) => {
    setLoadingSwap(true);
    const provider = await new ethers.providers.Web3Provider(
      window.ethereum as any
    );
    const signer = provider.getSigner();

    // In multi step swaps, you should loop over routeResponse.route array and create transaction per each item
    let evmTransaction;
    try {
      // A transaction might needs multiple approval txs (e.g. in harmony bridge),
      // you should create transaction and check approval again and again until `isApprovalTx` field turns to false
      while (true) {
        const transactionResponse = await rangoClient.createTransaction({
          requestId: routeResponse.requestId,
          step: 1, // In this example, we assumed that route has only one step
          userSettings: { slippage: "1" },
          validations: { balance: true, fee: true },
        });

        // in general case, you should check transaction type and call related provider to sign and send tx
        evmTransaction = transactionResponse.transaction as EvmTransaction;
        if (evmTransaction.isApprovalTx) {
          const finalTx = prepareEvmTransaction(evmTransaction);
          await signer.sendTransaction(finalTx);
          await checkApprovalSync(routeResponse, rangoClient);
          console.log("transaction approved successfully");
          notyf.success("transaction approved successfully");
        } else {
          break;
        }
      }

      const finalTx = prepareEvmTransaction(evmTransaction);
      const txHash = (await signer.sendTransaction(finalTx)).hash;
      const txStatus = await checkTransactionStatusSync(
        txHash,
        routeResponse,
        rangoClient
      );
      console.log("transaction finished", { txStatus });
      notyf.success("transaction finished successfully");
      setLoadingSwap(false);
    } catch (e) {
      const rawMessage = JSON.stringify(e).substring(0, 90) + "...";
      setLoadingSwap(false);
      setError(rawMessage);
      // report transaction failure to server if something went wrong in client for signing and sending the transaction
      await rangoClient.reportFailure({
        data: { message: rawMessage },
        eventType: "TX_FAIL",
        requestId: routeResponse.requestId,
      });
    }
  };

  const checkTransactionStatusSync = async (
    txHash: string,
    bestRoute: BestRouteResponse,
    rangoClient: RangoClient
  ) => {
    while (true) {
      const txStatus = await rangoClient.checkStatus({
        requestId: bestRoute.requestId,
        step: 1,
        txId: txHash,
      });
      setTxStatus(txStatus);
      console.log({ txStatus });
      if (
        !!txStatus.status &&
        [TransactionStatus.FAILED, TransactionStatus.SUCCESS].includes(
          txStatus.status
        )
      ) {
        // for some swappers (e.g. harmony bridge), it needs more than one transaction to be signed for one single step
        // swap. In these cases, you need to check txStatus.newTx and make sure it's null before going to the next step.
        // If it's not null, you need to use that to create next transaction of this step.
        return txStatus;
      }
      await sleep(3000);
    }
  };

  const swapperLogo = tokensMeta?.swappers.find(
    (sw) => sw.id === bestRoute?.result?.swaps[0].swapperId
  )?.logo;

  const childToParent = (val: string) => {
    // setSearchValue(val);
    console.log(data);
  };

  const handleCurrency__1 = () => {
    setCurrId(1);

    toggleModal();
    console.log(currCurrency);
  };

  const handleCurrency__2 = () => {
    setCurrId(2);
    toggleModal();
    console.log(currCurrency);
  };
  const toggleModal = () => {
    setModal(!modal);
    setValue("");
  };

  const toggleModal2 = () => {
    setModal2(!modal2);
    setValue2("");
    if (!modal2) {
      setSearch_style2("search-input");
    }
  };

  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }

  useEffect(() => {
    setCurrency1(emptyToken);
    setCurrency2(emptyToken);
    console.log(currentChain, "useeffect");
  }, [currentChain]);

  useEffect(() => {
    setLoadingCurrency(true);
    if (currency1.name !== "select") {
      const fn = async () => {
        var user = await getUserWallet();
        var w: WalletAddresses = [
          {
            address: user,
            blockchain: currentChain,
          },
        ];
        let temp = await rangoClient.getWalletsDetails(w);
        let all = temp.wallets[0].balances?.filter((item) => {
          return item.asset.address === currency1.address;
        });
        if (all?.length === 1) {
          // console.log(all[0].amount.amount);

          details.availableAmount =
            parseFloat(all[0].amount.amount) /
            Math.pow(10, all[0].amount.decimals);
          console.log(details);
        }
      };

      fn();
      setLoadingCurrency(false);
    }
    // const checkFlag = () => {
    //   currCurrency.map((item: any) => {
    //     if (item.value === null) {
    //       window.setTimeout(
    //         checkFlag,
    //         150
    //       ); /* this checks the flag every 100 milliseconds*/
    //     }
    //   });
    // };
    // checkFlag();
    // console.log(currCurrency);
  }, [currency1]);

  useEffect(() => {
    if (
      currency1.name !== "select" &&
      currency2.name !== "select" &&
      inputAmount !== "0"
    ) {
      const fn = async () => {
        await currency1?.image;
        await currency2?.image;
      };
      fn()
        .then(() => {
          var temp = currency1.usdPrice / currency2.usdPrice;
          setConversionRate(Math.floor(temp * 100) / 100);

          swap();
        })
        .catch(() => {
          fn();
        });
    }
  }, [currency1, currency2, inputAmount]);

  useEffect(() => {
    details.fee = t;
    details.estimatedTimeInSeconds = [];
    details.totalFee = 0;
    details.totalTime = 0;

    bestRoute?.result?.swaps.map((item) => {
      item.fee.map((single_fee) => {
        details.fee.push(single_fee);
        details.totalFee += parseFloat(single_fee.amount);
      });
      details.estimatedTimeInSeconds.push(item.estimatedTimeInSeconds);
      details.totalTime += item.estimatedTimeInSeconds;
    });
    console.log(details.estimatedTimeInSeconds);
  }, [bestRoute]);

  const interChange = () => {
    var temp = currency1;
    setCurrency1(currency2);
    setCurrency2(temp);
  };

  const handleExecution = async () => {
    setLoadingSwap(true);
    if (readyToExeccute && bestRoute !== undefined && bestRoute !== null) {
      await executeRoute(bestRoute);
    }
  };
  const roundOff = (val: number, decimal: number) => {
    let p = Math.pow(10, decimal);
    return Math.floor(val * p) / p;
  };

  const takMax = () => {
    setInputAmount(details.availableAmount.toString());
  };
  var text = "Connect";
  window.ethereum.on("connect", (connectInfo: any) => {
    text = "Swap";
  });

  const handleConnect = () => {
    // setTicker(!ticker);
    const fn = async () => {
      var user = await getUserWallet();
      var w: WalletAddresses = [
        {
          address: user,
          blockchain: currentChain,
        },
      ];
      let temp = await rangoClient.getWalletsDetails(w);
    };

    fn();
  };
  function toHex(d: any) {
    var i = parseInt(d);
    console.log(
      "0x" + Number(d).toString(16).slice(-2).toUpperCase().toString()
    );

    return "0x" + Number(d).toString(16).slice(-2).toUpperCase().toString();
  }

  function switchNetwork(val: string) {
    window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1" }], // chainId must be in HEX with 0x in front
    });
  }

  return (
    <div className="dashboard-root" style={{ width: "100%" }}>
      {loadingMeta && loadingCurrency ? (
        <>
          <ClipLoader
            color={"#fff"}
            loading={loadingMeta}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <div className="font_base rate">Loading Meta Data...</div>
        </>
      ) : (
        <div className="dashboard-root ">
          <div className="title">Coin Swap</div>
          <div className="swap__box">
            <div className="modal__style box1__container">
              <div className="header__1">
                <div className="title__1">You Pay</div>
                <div
                  style={{
                    flexDirection: "row",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    className="details__heading"
                    style={{ marginRight: "4px" }}
                  >
                    Available:
                  </div>
                  <div className="details__description">
                    {roundOff(details.availableAmount, 2)}
                  </div>
                  <button
                    className="max_button_style__style max_button_style__text"
                    onClick={takMax}
                  >
                    MAX
                  </button>
                </div>
              </div>
              <div className="core__details">
                <div className="currency" onClick={handleCurrency__1}>
                  <div className="currency__option">
                    <img src={currency1?.image} className="currency_img" />
                    <div className="font_base currency_name">
                      {currency1?.symbol}
                    </div>
                  </div>
                  <img src={arrowDown} className="toggleArrow"></img>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "end",
                    alignItems: "end",
                  }}
                >
                  <input
                    value={inputAmount}
                    className="amount font_base"
                    placeholder="0.01"
                    onChange={(event) => {
                      setInputAmount(event.target.value.toString());
                    }}
                  />
                  <div className="amount_deduction font_base">
                    -{roundOff(parseFloat(inputAmount) * currency1.usdPrice, 2)}
                    $
                  </div>
                </div>
              </div>
              <div className="font_base wallet">ERC20</div>
            </div>
            <div className="position_setter" onClick={interChange}>
              <img
                src={
                  bestRoute?.result === null || bestRoute === undefined
                    ? zigZag
                    : swapperLogo
                }
                className="zigzag"
              />
            </div>
            <div className="modal__style box1__container">
              <div className="header__1">
                <div className="title__1 ">You recieve</div>
                <div
                  className="font_base converted__amount"
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  = ${roundOff(currency1.usdPrice * parseFloat(inputAmount), 4)}{" "}
                </div>
              </div>
              <div className="core__details">
                <div className="currency" onClick={handleCurrency__2}>
                  <div className="currency__option">
                    <img src={currency2?.image} className="currency_img" />
                    <div className="font_base currency_name">
                      {currency2?.symbol}
                    </div>
                  </div>
                  <img src={arrowDown} className="toggleArrow"></img>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "end",
                  }}
                >
                  <div className="amount2 font_base">
                    {roundOff(ConversionRate * parseFloat(inputAmount), 2)}
                  </div>
                  <div className="amount_deduction font_base token">
                    {currency2.symbol}
                  </div>
                </div>
              </div>
              <div className="font_base wallet">ERC20</div>
            </div>
          </div>
          <div className="modal__style box2__container">
            <div className="info__1">
              <div>
                <div className="font_base rate">Rate</div>
                <div
                  className="font_base conversion_rates"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "6px",
                  }}
                >
                  <div className="font_base rate__values">
                    1 {currency1.symbol} = {ConversionRate} {currency2.symbol}
                  </div>
                  <div className="font_base rate__values">
                    1 {currency2.symbol} = {roundOff(1 / ConversionRate, 4)}{" "}
                    {currency1.symbol}
                  </div>
                </div>
              </div>
              <div className="discription_box">
                <div className="font_base discription">
                  Multi-chain Dex Aggregator
                </div>
                <div className="font_base discription">
                  Swap in 50+ blockchain amongst 10,000+ assets
                </div>
              </div>
            </div>
            <div className="info__2">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "50%",
                }}
              >
                <div className="font_base headings">Swap fee</div>
                <div
                  className="font_base conversion_rates"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "6px",
                  }}
                >
                  {details.fee.map((item, index) => {
                    console.log(item.amount);

                    return (
                      <div className="font_base rate__values">
                        {" "}
                        {roundOff(parseFloat(item.amount), 4)}{" "}
                        {item.asset.symbol}{" "}
                      </div>
                    );
                  })}
                </div>
                <div className="font_base total_1">
                  Total = ${roundOff(details.totalFee, 4)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "50%",
                }}
              >
                <div className="font_base headings">
                  {" "}
                  Estimated arrival time
                </div>
                <div
                  className="font_base conversion_rates"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    rowGap: "6px",
                  }}
                >
                  {details.estimatedTimeInSeconds.map((item, index) => {
                    console.log(item);
                    let count = index + 1;
                    return (
                      <div className="font_base rate__values">
                        {"Swap " + count + ": " + item}
                      </div>
                    );
                  })}
                </div>
                <div className="font_base total_1">
                  {" "}
                  Total = {roundOff(details.totalTime, 4)}{" "}
                </div>
              </div>
            </div>
          </div>

          {!currentChain ? (
            <button className="swap_button font_base" onClick={toggleModal2}>
              Change Network
            </button>
          ) : signer === undefined || signer === null ? (
            <button className="swap_button font_base" onClick={handleConnect}>
              Connect
            </button>
          ) : (
            <button
              className="swap_button font_base"
              disabled={loadingSwap || !readyToExeccute}
              onClick={handleExecution}
            >
              Swap
            </button>
          )}
        </div>
      )}
      {modal && (
        <div className="modal" style={{ zIndex: "10" }}>
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <div className="wrapper">
              <div className="font_base popup_heading "> Select a Token</div>

              <div className={search_styles}>
                <div style={{ alignItems: "center", display: "flex" }}>
                  <input
                    type="text"
                    placeholder="Type to search.."
                    value={value}
                    onChange={onChange}
                  />
                  {/* <div className="icon" onClick={() => onSearch(value)}>
                    <i className="fas fa-search"></i>
                  </div> */}
                </div>
                <div
                  className="autocom-box font_base"
                  style={{ color: "black" }}
                >
                  {search}
                </div>
              </div>
            </div>
            <button
              className="close-modal font_base swap_button"
              onClick={toggleModal}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
      {modal2 && (
        <div className="modal" style={{ zIndex: "10" }}>
          <div onClick={toggleModal2} className="overlay"></div>
          <div className="modal-content">
            <div className="wrapper">
              <div className="font_base popup_heading "> Select a Chain</div>

              <div className={search_styles2}>
                <div style={{ alignItems: "center", display: "flex" }}>
                  <input
                    type="text"
                    placeholder="Type to search.."
                    value={value2}
                    onChange={onNetworkSelect}
                  />
                  {/* <div className="icon" onClick={() => onSearch(value)}>
                    <i className="fas fa-search"></i>
                  </div> */}
                </div>
                <div
                  className="autocom-box font_base"
                  style={{ color: "black" }}
                >
                  {search}
                </div>
              </div>
            </div>
            <button
              className="close-modal font_base swap_button"
              onClick={toggleModal2}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
