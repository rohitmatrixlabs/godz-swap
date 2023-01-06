let suggestions = [
  // ABC Normal Letters
  "Channel",
  "Google",
  "Google Fonts",
  "Google Plus",
  "Google Drive",
  "Github",
  "CSS HTML JS",
  "TEnLOcRAFT",
  "CodePen Website",
  "YouTube",
  "YouTuber",
  "YouTube Channel",
  "Blogger",
  "Bollywood",
  "Vlogger",
  "Vechiles",
  "Facebook",
  "Freelancer",
  "Facebook Page",
  "Israel Hyom?",
  "YNet",
  "MineCraft",
  "Fortnite",
  "GTA",
  "GTA 2",
  "GTA 3",
  "GTA 4",
  "GTA V",
  "GTA 6",
  "Search Bar With AutoComplete || Eitan &mdash; CodePen",
  "Designer",
  "Developer",
  "Web Designer",
  "Web Developer",
  "Login Form in HTML & CSS",
  "How to learn HTML & CSS",
  "How to learn JavaScript",
  "How to became Freelancer",
  "How to became Web Designer",
  "How to start Gaming Channel",
  "How to start YouTube Channel",
  "What does HTML stands for?",
  "What does CSS stands for?",
  "Python",
  "Udemy",
  // Symbols Codes
  "&--SymbolCode--;",
  "&copy;",
  "&reg;",
  "&euro;",
  "&trade;",
  "&larr;",
  "&uarr;",
  "&rarr;",
  "&darr;",
  "&spades;",
  "&clubs;",
  "&hearts;",
  "&diams;",
  "&Alpha;",
  "&Beta;",
  "&Gamma;",
  "&Delta;",
  "&Epsilon;",
  "&Zeta;",
  "&copysr;",
  "&#8513;",
  "&sect;",
  "&alefsym;",
  "&beth;",
  "&gimel;",
  "&daleth;",
];

// getting all required elements
const searchWrapper = document.querySelector(".search-input");
const inputBox = searchWrapper.querySelector("input");
const suggBox = searchWrapper.querySelector(".autocom-box");
const icon = searchWrapper.querySelector(".icon");
let linkTag = searchWrapper.querySelector("a");
let webLink;

// if user press any key and release
inputBox.onkeyup = (e) => {
  let userData = e.target.value; //user enetered data
  let emptyArray = [];
  if (userData) {
    icon.onclick = () => {
      webLink = "https://www.google.com/search?q=" + userData;
      linkTag.setAttribute("href", webLink);
      console.log(webLink);
      linkTag.click();
    };
    emptyArray = suggestions.filter((data) => {
      //filtering array value and user characters to lowercase and return only those words which are start with user enetered chars
      return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
    });
    emptyArray = emptyArray.map((data) => {
      // passing return data inside li tag
      return (data = "<li>" + data + "</li>");
    });
    searchWrapper.classList.add("active"); //show autocomplete box
    showSuggestions(emptyArray);
    let allList = suggBox.querySelectorAll("li");
    for (let i = 0; i < allList.length; i++) {
      //adding onclick attribute in all li tag
      allList[i].setAttribute("onclick", "select(this)");
    }
  } else {
    searchWrapper.classList.remove("active"); //hide autocomplete box
  }
};

function select(element, event) {
  let selectData = element.textContent;
  inputBox.value = selectData;
  icon.onclick = () => {
    webLink = "https://www.google.com/search?q=" + selectData;
    linkTag.setAttribute("href", webLink);
    linkTag.click();
  };
  searchWrapper.classList.remove("active");
}

function showSuggestions(list) {
  let listData;
  if (!list.length) {
    let userValue = inputBox.value;
    listData = "<li>" + userValue + "</li>";
  } else {
    listData = list.join("");
  }
  suggBox.innerHTML = listData;
}
