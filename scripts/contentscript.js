var open = false, showing = false;
var factorWidth = 0.4, factorHeight = 1;
var navNode, outerDiv;
var styleAttributes = " transform: opacity 1s !important; visibility: visible !important; transform: none !important;";
var prevAttributes = "";


function toggleSidebar() {
    open = !open;
    //update context menu
    if (open) {
        var w = "width: " + (document.documentElement.scrollWidth * factorWidth) + "px; ";
        var h = "height: " + (document.documentElement.scrollHeight * factorHeight - 50) + "px; ";
        //Somehow Riot extends the window every time I resize it, so we need to subtract 50 to keep it the same height
        prevAttributes = navNode.getAttribute("style");
        navNode.setAttribute("style", w + h + styleAttributes);
    } else {
        if (showing) {
            changeVisibility();
        }
        navNode.setAttribute("style", prevAttributes);
    }
    console.log(open?"Extended Sidebar":"Small Sidebar");
};

function changeVisibility() {
    showing = !showing;
    if (showing) {
        if (!open) {
            toggleSidebar();
        }
    }
    var toggleList = navNode.children;
    for (i = 0; i < toggleList.length; i++) {
        toggleList[i].classList.toggle("hidden");
    };
    console.log(showing?"Showing Extension Page":"Showing Riot Menu");
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
    readHtmlFile("html/inject.html", function (element) {
        var injectDoc = new DOMParser().parseFromString(element, "text/html");
        navNode.firstElementChild.appendChild(injectDoc.getElementById("uek-link-element"));
        navNode.appendChild(injectDoc.getElementById("uek-main"));
        //somehow injectDoc.getElementById returns null here, but document.getElementById works.
        document.getElementById("uek-link-open").onclick = function () { changeVisibility();};
        document.getElementById("uek-link-back").onclick = function () { changeVisibility();};
    });
    
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === "toggle-panel") {
        toggleSidebar();
    }
});
