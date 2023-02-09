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
    // Refresh btn
    const [isRotating, setIsRotating] = useState(false);
    const handleRefreshClick = () => {
        setIsRotating(true);
        setTimeout(() => setIsRotating(false), 500); // rotate for 5 milliseconds
      };


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
      const walletConnectCall = async () => {
          var user = props.signerAddress;
          if (user) {
  
              var w = []
              chains.forEach((c) => {
                  w.push({ address: user, blockchain: c })
              })
              console.log(w)
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
      }, []);

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
                                        <img className="token-img" src={networkIcon} alt="network-icon"/>
                                        <div className='wallet-name'>{e.blockChain}</div>
                                    </div>
                                    <div className='wallet-id-options'>
                                        <div className='wallet-id ellipsis'>{e.address}</div>
                                        <div className='icon-wrapper'>
                                            <img className='copy-icon' src={copyIcon} alt="copy-icon"/>
                                        </div>
                                        <div className='icon-wrapper'>
                                            <img className='link-icon' src={linkIcon} alt="link-icon"/>
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
        console.log("hmmm",wallet);
        if(wallet.balances.length < 1)
        {
            return (
                <div className='no-token-txt'>No tokens found</div>
            )
        }
        return (
            <>        
                {
                    (wallet.balances).map((e)=>{
                        return (
                            <>
                                    <div className='transfer-div'>
                                            <div className='network-div'>
                                                <img className='token-img' src={tokenImg} alt="token-img"/>
                                                <div>
                                                    <div className='token-symbol'>{e.asset.symbol}</div>
                                                    <div className='token-blockChain'>{wallet.blockChain}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div>{e.amount.amount}</div>
                                                <div>$0.3876</div>
                                            </div>
                                            <div className='swap-icon-wrapper'>
                                                <img src={swapIcon} alt="swap-icon" />
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
                          <div className='wallet-balance'> $ 757.89</div>
                    </div>
                    {loadingMeta ?  <></> : comp()}
                </nav>)}
            </div>
        );
};