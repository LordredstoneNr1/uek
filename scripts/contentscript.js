var open = false, showing = false;
var navNode, outerDiv;
var restoreStyle;

function toggleSidebar() {
    open = !open;
    //update context menu
    if (open) {
        restoreStyle = navNode.getAttribute("style");
        var size = "width: 1000px; height: 2000px;";
        navNode.setAttribute("style",size + " transform: opacity 1s !important; visibility: visible !important;transform: none !important;");
        
    } else {
        navNode.setAttribute("style", restoreStyle);
        showing = false;
    }
};

function changeVisibility() {
    showing = !showing;
    open = true;
    var toggleList = navNode.children;
    for (i = 0; i < toggleList.length; i++) {
        toggleList[i].classList.toggle("hidden");
    };
}

function readHtmlFile(path, callback) {
    var file = new XMLHttpRequest();
    file.overrideMimeType("text/html");
    file.open("GET", chrome.extension.getURL(path), true);
    file.onreadystatechange = function() {
        if (file.readyState === 4 && file.status == "200") {
            callback(file.responseText);
        }
    }
    file.send(null);
}

window.addEventListener("load", function() {
    navNode = document.getElementById("riotbar-navmenu").lastElementChild;
    var outerDiv;
    readHtmlFile("html/inject.html", function (element) {
        navNode.appendChild(new DOMParser().parseFromString(element, "text/html").getElementById("uek-link-element"));
    });
    
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === "toggle-panel") {
        toggleSidebar();
    }
});
