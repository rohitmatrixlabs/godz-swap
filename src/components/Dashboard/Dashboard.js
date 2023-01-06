import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./dashboard.css";
import symbol from "../../assets/icon__1.png";
import arrowDown from "../../assets/arrowDown.png";
import zigZag from "../../assets/zig-zag.png";
import SearchBox from "../SearchBox/SearchBox";

const Dashboard = (props) => {
  console.log(props);
  const [modal, setModal] = useState(false);
  const [search_value, setSearchValue] = useState();
  const [data, setData] = useState([]);
  const [currency1, setCurrency1] = useState({
    name: "",
    symbol: "",
    address: "",
  });

  const [currency2, setCurrency2] = useState({
    name: "",
    symbol: "",
    address: "",
  });

  useEffect(() => {
    setData(props.data);
  });



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
                  <img src={symbol} className="currency_img" />
                  <div className="font_base currency_name">USDT</div>
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
                  <img src={symbol} className="currency_img" />
                  <div className="font_base currency_name">USDT</div>
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
        <button className="swap_button font_base">Swap</button>
      </div>

      {modal && (
        <div className="modal" style={{ zIndex: "10" }}>
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            <SearchBox childToParent={childToParent} data={data} />
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

export default Dashboard;
