import React, { useEffect, useMemo, useState } from 'react'
import refreshIcon from "../../assets/images/refresh.svg";
import closeIcon from "../../assets/images/close.svg";
import networkIcon from "../../assets/images/polygon.svg";
import copyIcon from "../../assets/images/copy.svg";
import linkIcon from "../../assets/images/link.svg";
import tokenImg from "../../assets/images/token-img.svg";
import swapIcon from "../../assets/images/swap.svg"; 
import "./style.css";
import { RangoClient } from 'rango-sdk/lib';
import { ethers, FixedNumber  } from 'ethers';

export default function WalletBalance(props)
{
    console.log(props.tokensMeta);
    // Refresh btn
    const [isRotating, setIsRotating] = useState(false);
    


      const RANGO_API_KEY = "3d58b20a-11a4-4d6f-9a09-a2807f0f0812";
      const rangoClient = useMemo(() => new RangoClient(RANGO_API_KEY), []);
      const [signer, setSigner] = useState()
      const [wallets, setWallets] = useState();
      const [tokensMeta, setTokenMeta] = useState();
      const [loadingMeta, setLoadingMeta] = useState(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const address = provider.getSigner().getAddress();
      const chains = [
      "BSC",
      "ARBITRUM",
      "AURORA",
      "POLYGON",
  ]
  const handleRefreshClick = () => {
    setIsRotating(true);
    
    setTimeout(() => setIsRotating(false), 500); // rotate for 5 milliseconds
  };
    function findCostInUsd(element){
        let ret = 0;
        props.tokensMeta.tokens.filter((item) => {
            return element.asset.address && item.address === element.asset.address
        }).map((item) =>{ 
            console.log("item ", ret);
            ret = item.usdPrice})
        if(ret){
            return <div>${(ret*parseFloat(ethers.utils.formatUnits(element.amount.amount, element.amount.decimals))).toFixed(5)}</div>
        }
        return <div>Not found</div>
    }

    function findNetworkSymbol(element)
    {
        let url = "";
        // console.log("yes", element)
        props.tokensMeta.blockchains.filter((item) => {
            return item.name === element.blockChain;
        }).map((item) =>{ 
            url = item.logo})
        return url;
    }

    function findTokenSymbol(element)
    {
        let url = "";
        
        props.tokensMeta.tokens.filter((item) => {
            return item.blockChain === element.asset.blockChain && item.symbol === element.asset.symbol;
        }).map((item) =>{ 
            url = item.image})
        return url;
    }

      const walletConnectCall = async () => {
          var user = props.signerAddress;
          if (user) {
  
              var w = []
              chains.forEach((c) => {
                  w.push({ address: user, blockchain: c })
              })
              let temp = await rangoClient.getWalletsDetails(w);
              setWallets(temp.wallets);
              console.log("wallets", wallets)
              setLoadingMeta(false)
          };
      }
      function changeSeeWallet(){
          props.setSeeWallet(false)
      }

      useEffect(() => {
          setWallets([]);
          walletConnectCall();
          setLoadingMeta(true);
          return () => {
  
          }
      }, [isRotating]);

      function comp(){
        console.log("ww",wallets[0].blockChain);
        return (
            <>        
                {
                    (wallets).map((e)=>{
                        return (
                            <>
                                <div className='wallet-id-div'>
                                    <div className='wallet-id-desc'>
                                        <img className="token-img" src={findNetworkSymbol(e)} alt="network-icon"/>
                                        <div className='wallet-name'>{e.blockChain}</div>
                                    </div>
                                    <div className='wallet-id-options'>
                                        <div className='wallet-id ellipsis'>{e.address}</div>
                                        <div className='icon-wrapper'>
                                            <img className='copy-icon' src={copyIcon} alt="copy-icon"/>
                                        </div>
                                    </div>
                                </div>
                                {tokens(e)}
                            </>
                        )
                    })
                }
            </>
                
        )
      };

      function tokens(wallet)
      {
        if(wallet.balances.length < 1)
        {
            return (
                <div className='no-token-txt'>No tokens found</div>
            )
        }
        console.log(wallet, "jay raam jji ki")
        return (
            <>        
                {
                    (wallet.balances).map((e)=>{
                        return (
                            <>
                                    <div className='transfer-div'>
                                            <div className='network-div'>
                                                <img className='token-img' src={findTokenSymbol(e)} alt="token-img"/>
                                                <div>
                                                    <div className='token-symbol'>{e.asset.symbol}</div>
                                                    <div className='token-blockChain'>{wallet.blockChain}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div>{parseFloat(ethers.utils.formatUnits(e.amount.amount, e.amount.decimals)).toFixed(5)}</div>
                                                <div>
                                                {findCostInUsd(e)}
                                                </div>
                                            </div>
                                            <div className='swap-icon-wrapper'>
                                            </div>
                                    </div>
                                <div className='separator'></div>
                            </>
                        )
                    })
                }
            </>
                
        )
      }


        return (
            <div className="sidebar-container">
                {loadingMeta ? <div style={{color: "white", fontSize: "32px"}}>Loading</div> :
                (<nav className="sidebar show">
                    <div className='sidebar-heading'>
                        <div className='header'>          
                            <div className='heading-txt'>Your&nbsp;&nbsp;Wallets</div>
                            <div className='sidebar-options'>
                                <div className='icon-wrapper' onClick={handleRefreshClick}>
                                    <img className={`refresh-icon ${isRotating ? "rotating" : ""}`} src={refreshIcon} alt="refresh-icon"/>
                                </div>
                                <div className='icon-wrapper'>
                                    <img className='close-icon' onClick={changeSeeWallet} src={closeIcon} alt="close-icon"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    {loadingMeta ?  <></> : comp()}
                </nav>)}
            </div>
        );
};