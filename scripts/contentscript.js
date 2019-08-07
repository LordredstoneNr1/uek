var open = false;

function changeVisibility() {
    open = !open;
    console.log(open);
};

window.addEventListener("load", function() {
    var navNode = document.getElementById("riotbar-navmenu").lastElementChild;
    var outerDiv = document.createElement("div");
    outerDiv.setAttribute("id", "uek-link-element");
    outerDiv.setAttribute("class", "riotbar-navmenu-category");
    var innerDiv = document.createElement("div");
    innerDiv.setAttribute("class", "riotbar-category-name");
    innerDiv.innerHTML = "Universe Enhancement Kit";
    outerDiv.appendChild(innerDiv);
    innerDiv = document.createElement("div");
    var link = document.createElement("a");
    link.setAttribute("class", "riotbar-navmenu-link");
    link.setAttribute("href", "#");
    link.onclick = function() {changeVisibility()};
    link.innerHTML = "Open sidebar view";
    innerDiv.appendChild(link);
    outerDiv.appendChild(innerDiv);
    navNode.firstElementChild.appendChild(outerDiv);
    
    outerDiv = document.createElement("div");
    outerDiv.setAttribute("id", "uek-main-panel");
    // add some HTML here depending on the lists
    
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === "toggle-panel") {
        changeVisibility();
    }
});
