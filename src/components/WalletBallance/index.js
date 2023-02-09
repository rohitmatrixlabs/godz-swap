import React, { useMemo, useState, useEffect } from 'react'
import { RangoClient, WalletDetail, MetaResponse } from 'rango-sdk'
import { ethers, FixedNumber } from "ethers";
import {ReactComponent as IconClose} from '../../assets/icon-close.svg'
import './style.css'
export default function WalletBalance(props) {
    const RANGO_API_KEY = "3d58b20a-11a4-4d6f-9a09-a2807f0f0812";
    const rangoClient = useMemo(() => new RangoClient(RANGO_API_KEY), []);
    const [signer, setSigner] = useState()
    const [wallets, setWallets] = useState();
    const [tokensMeta, setTokenMeta] = useState();
    const [loadingMeta, setLoadingMeta] = useState(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const address = provider.getSigner().getAddress();
    const chains = ["ARBITRUM",
    "AURORA",
    "BSC",
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
            console.log("tt", wallets)
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

    return (
        <>
            <div className="position-fixed">
                <button className="icon-close" onClick={changeSeeWallet}><IconClose/></button>
                {loadingMeta ? <div style={{color: "white", fontSize: "32px"}}>Loading</div> :
                    <div style={{overflowY: "scroll"}}>
                        {
                            (wallets).map((e) => {
                                return (
                                    <>
                                        <p style={{color: "white", fontSize: "32px"}}>{e.blockChain}</p>
                                        {e.balances.length >= 1 ?
                                            <div className="tokens">
                                                {e.balances.map((ee) => {
                                                    return (

                                                        <>
                                                            <div 
                                                            className="token" style={{color: "white", fontSize: "32px"}}>
                                                            {ee.asset.symbol}  
                                                            </div>
                                                            <div style={{color: "white", fontSize: "32px"}}>
                                                            {ee.amount.amount}  
                                                            </div>
                                                        </>
                                                    )

                                                })}
                                            </div> : <div style={{color: "white", fontSize: "32px"}}>No tokens available</div>}
                                    </>
                                )

                            })
                        }
                    </div>
                }
            </div>
        </>
    )
}
