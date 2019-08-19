var open = false;
function changeVisibility() {
    open = !open;
    //update context menu and riotbar entry
    document.getElementById("uek-base-wrapper").classList.toggle("open");
    
    document.getElementById("uek-toggle-open").classList.toggle("hidden");
    document.getElementById("uek-toggle-close").classList.toggle("hidden");
    console.log((open?"Showing":"Hiding") + " UEK Extension page");
};

function readHtmlFile(path, callback) {
    var file = new XMLHttpRequest();
    file.overrideMimeType("text/html");
    file.open("GET", chrome.runtime.getURL(path), true);
    file.onreadystatechange = function() {
        if (file.readyState === 4 && file.status == "200") {
            callback(file.responseText);
        }
    }
    file.send(null);
}

window.addEventListener("load", function() {
    readHtmlFile("html/inject.html", function (element) {
        var injectDoc = new DOMParser().parseFromString(element, "text/html");
        
        // Inject link in the menu
        document.getElementById("riotbar-navmenu").lastElementChild.firstElementChild.appendChild(injectDoc.getElementById("uek-link-element"));
        // Link in the Riot Menu
        document.getElementById("uek-link-open").onclick = function () { changeVisibility();};
        chrome.storage.sync.get("shortcut", function(item) {
            document.getElementById("uek-link-open").firstElementChild.innerHTML = item.shortcut;
        });
        
        // Inject Main Extension div
        document.getElementsByTagName("body")[0].appendChild(injectDoc.getElementById("uek-base-wrapper"));
        // Link in the extension div
        document.getElementById("uek-toggle-link").onclick = function() { changeVisibility();};
        document.getElementById("uek-toggle-open").src = chrome.runtime.getURL("images/arrow-right.png");
        document.getElementById("uek-toggle-close").src = chrome.runtime.getURL("images/arrow-left.png");
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.id === "toggle-panel") {
        changeVisibility();
    } else {
        console.log("Received unknown message with id " + message.id);
        console.log(message, sender);
        
    }
});
