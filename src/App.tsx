import "./App.css";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "./components/Dashboard/Dashboard";

import ReactDOM from "react-dom";
import symbol from "./assets/icon__1.png";
import arrowDown from "./assets/arrowDown.png";
import zigZag from "./assets/zig-zag.png";
import SearchBox from "./components/SearchBox/SearchBox";

import { ethers } from "ethers";
import {
  BestRouteResponse,
  EvmTransaction,
  MetaResponse,
  RangoClient,
  TransactionStatus,
  TransactionStatusResponse,
  WalletRequiredAssets,
  Token,
} from "rango-sdk";
import {
  checkApprovalSync,
  prepareEvmTransaction,
  prettyAmount,
  sleep,
} from "./utils";

declare let window: any;

export const App = () => {
  const RANGO_API_KEY = "3d58b20a-11a4-4d6f-9a09-a2807f0f0812"; // put your RANGO-API-KEY here

  const rangoClient = useMemo(() => new RangoClient(RANGO_API_KEY), []);
  const [tokensMeta, setTokenMeta] = useState<MetaResponse | null>();
  const [inputAmount, setInputAmount] = useState<string>("0.1");
  const [bestRoute, setBestRoute] = useState<BestRouteResponse | null>();
  const [txStatus, setTxStatus] = useState<TransactionStatusResponse | null>(
    null
  );
  const [currId, setCurrId] = useState(1);
  const [requiredAssets, setRequiredAssets] = useState<WalletRequiredAssets[]>(
    []
  );
  const [modal, setModal] = useState(false);
  const [search_value, setSearchValue] = useState<any>();
  const [currency1, setCurrency1] = useState<any>({
    name: "select",
    symbol: "select",
    address: "",
  });

  const [currency2, setCurrency2] = useState<any>({
    name: "select",
    symbol: "select",
    address: "",
  });

  const [loadingMeta, setLoadingMeta] = useState<boolean>(true);
  const [loadingSwap, setLoadingSwap] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<any>([]);
  const [value, setValue] = useState("");
  const [search_styles, setSearch_style] = useState("search-input");
  const [search, setSearch] = useState<any>();
  const [currCurrency, setCurrCurrency] = useState<any>();
  const [loadingCurrency, setLoadingCurrency] = useState<boolean>();

  const onChange = (event: any) => {
    setValue(event.target.value);
    if (event.target.value === "") {
      setSearch_style("search-input");
    } else {
      setSearch_style("search-input active");
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
    setLoadingMeta(true);
    // Meta provides all blockchains, tokens and swappers information supported by Rango
    rangoClient.getAllMetadata().then((meta) => {
      setTokenMeta(meta);

      setLoadingMeta(false);
    });
  }, [rangoClient]);

  useEffect(() => {
    if (tokensMeta === undefined) {
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
          fullName.startsWith(searchTerm) &&
          fullName !== searchTerm &&
          blockchain === "polygon"
        );
      })
      .slice(0, 10)
      .map((item) => (
        <li onClick={() => onSearch(item)} key={item.name}>
          {item.name}
        </li>
      ));
    setSearch(temp);
  }, [value]);

  const usdtAddressInPolygon = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f";
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
      return;
    }

    if (!window.ethereum.isConnected()) {
      setError(
        "Error connecting to MetMask. Please check Metamask and try again."
      );
      return;
    }

    // it multi swap example, you should check chain id before each evm swap
    if (window.ethereum.chainId && parseInt(window.ethereum.chainId) !== 137) {
      setError(`Change meta mask network to 'Polygon'.`);
      return;
    }

    if (!userAddress) {
      setError(`Could not get wallet address.`);
      return;
    }
    if (!inputAmount) {
      setError(`Set input amount`);
      return;
    }
    if (!currency1 || !currency2) return;

    setLoadingSwap(true);
    const connectedWallets = [
      { blockchain: "POLYGON", addresses: [userAddress] },
    ];
    const selectedWallets = { POLYGON: userAddress };
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
      setError(`Not enough balance or fee!`);
      setLoadingSwap(false);
      return;
    } else if (bestRoute) {
      // await executeRoute(bestRoute);
    }
  };

  const executeRoute = async (routeResponse: BestRouteResponse) => {
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
  };

  if (modal) {
    document.body.classList.add("active-modal");
  } else {
    document.body.classList.remove("active-modal");
  }

  useEffect(() => {
    usdtToken = currency1;
    maticToken = currency2;
    console.log(maticToken, usdtToken);
  }, [currency1, currency2]);

  return (
    <div className="dashboard-root" style={{ width: "100%" }}>
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
                <div className="details__description">78.79 USDT</div>
                <button className="max_button_style__style max_button_style__text">
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="amount font_base">10</div>
                <div className="amount_deduction font_base">-9.97$</div>
              </div>
            </div>
            <div className="font_base wallet">BEP20</div>
          </div>
          <div className="position_setter">
            <img src={zigZag} className="zigzag" />
          </div>
          <div className="modal__style box1__container">
            <div className="header__1">
              <div className="title__1 ">You recieve</div>
              <div
                className="font_base converted__amount"
                style={{ display: "flex", flexDirection: "row" }}
              >
                = $9.89 <div style={{ color: "red" }}> (-0.82%)</div>
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
                <div className="amount font_base">4.78</div>
                <div className="amount_deduction font_base token">ANC</div>
              </div>
            </div>
            <div className="font_base wallet">BEP20</div>
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
                  1 USDT = 0.4784 ANC
                </div>
                <div className="font_base rate__values">
                  1 USDT = 0.4784 ANC
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
                <div className="font_base rate__values">
                  {" "}
                  0.0847739 BSC.BNB{" "}
                </div>
                <div className="font_base rate__values">
                  {" "}
                  0.00000034 BSC.UST{" "}
                </div>
                <div className="font_base rate__values">
                  0.08993849 TERRA.Luna{" "}
                </div>
                <div className="font_base rate__values">
                  {" "}
                  0.08993849 TERRA.UST{" "}
                </div>
              </div>
              <div className="font_base total_1">Total = $0.73</div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "50%",
              }}
            >
              <div className="font_base headings"> Estimated arrival time</div>
              <div
                className="font_base conversion_rates"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "6px",
                }}
              >
                <div className="font_base rate__values"> 1inch: 00:24 </div>
                <div className="font_base rate__values">
                  Terra bridge: 05:30{" "}
                </div>
                <div className="font_base rate__values">TerraSwap: 00:30</div>
              </div>
              <div className="font_base total_1"> Total = 06:15 </div>
            </div>
          </div>
        </div>
        <button className="swap_button font_base" onClick={swap}>
          Swap
        </button>
      </div>

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
                  <div className="icon" onClick={() => onSearch(value)}>
                    <i className="fas fa-search"></i>
                  </div>
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
    </div>
  );
};

export default App;
