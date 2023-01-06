import { useState, useEffect } from "react";
// import "./styles.css";
import styles from "./searchBox.css";
// var data = require("./mockData.json");

export default function App(props) {
  console.log(props);
  const [data, setData] = useState(props.data);
  const [value, setValue] = useState("");
  const [search_styles, setSearch_style] = useState("search-input");
  const [search, setSearch] = useState();

  const onChange = (event) => {
    setValue(event.target.value);
    if (event.target.value === "") {
      setSearch_style("search-input");
    } else {
      setSearch_style("search-input active");
    }
  };

  const onSearch = (searchTerm) => {
    setValue(searchTerm);
    props.childToParent(searchTerm);
    // our api to fetch the search result
  };

  const notFound = () => {
    return <li>{"Token Not Found"}</li>;
  };

  useEffect(() => {
    if (data !== undefined || data.length !== 0 || data !== null) {
      console.log(data[0]);
    }
    let temp = data
      .filter((item) => {
        const searchTerm = value.toLowerCase();
        const fullName = item.name.toLowerCase();
        return (
          searchTerm &&
          fullName.startsWith(searchTerm) &&
          fullName !== searchTerm
        );
      })
      .slice(0, 10)
      .map((item) => (
        <li onClick={() => onSearch(item.name)} key={item.name}>
          {item.name}
        </li>
      ));

    if (temp.length == 0) temp = notFound();
    console.log(temp);

    setSearch(temp);
  }, [value]);

  return (
    <div class="wrapper">
      <div class={search_styles}>
        <div style={{ alignItems: "center", display: "flex" }}>
          <input
            type="text"
            placeholder="Type to search.."
            value={value}
            onChange={onChange}
          />
          <div class="icon" onClick={() => onSearch(value)}>
            <i class="fas fa-search"></i>
          </div>
        </div>
        <div className="autocom-box">{search}</div>
      </div>
    </div>
  );
}
