var open = false;

//some functions we'll need.
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
    file.onload = function() {
        callback(file.responseText);
    }
    file.send();
}

// Main logic, handle injection after window is ready
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
        
        function show(key) {
            document.getElementsByClassName("activeTab")[0].classList.remove("activeTab");
            var blocklist = document.getElementById("uek-main-body").children;
            //forEach / for in does not work for some reason idk. Should be the same in performance and readability so idc either.
            for (i = 0; i < blocklist.length; i++) {
               blocklist[i].classList.add("hidden");
            }
            document.getElementById("uek-main-link-"+key).classList.add("activeTab");
            document.getElementById("uek-main-block-"+key).classList.remove("hidden");
        }
        
        document.getElementById("uek-main-link-stories").onclick = function() {show("stories");};
        document.getElementById("uek-main-link-lists").onclick = function() {show("lists");};
        document.getElementById("uek-main-link-about").onclick = function() {show("about");};
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.id) {
        case "toggle-panel":
            changeVisibility();
            break;
        case "extract-image":
        
            var url, div;
            function parseURL(str){
                if (str.includes("https://am-a.akamaihd.net/image")) {
                   return str.substring(str.indexOf("https", 10), str.indexOf("&resize")).replace(/%3A/g, ":").replace(/%2F/g,"/");
                } else {
                    return str.substring(5, str.length-2);
                }
            };
            
            if (message.source == "page") {
                // possible page sources are the story, race, champion and region pages.
                if (message.pageURL.includes("race")) {
                    div = document.getElementById("Content").firstElementChild.firstElementChild.nextElementSibling
                    .firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                    url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                    
                } else if (message.pageURL.includes("region")) {
                    url = document.getElementById("Content").getElementsByTagName("video")[0].src;
                    
                } else if (message.pageURL.includes("comic")) {
                    div = document.getElementById("Content").firstElementChild.firstElementChild.firstElementChild;
                    url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                    
                } else if (message.pageURL.includes("champion")) {
                    //Champions can have a video background or image background. Simply check for the first video tag.
                    if (document.getElementsByTagName("video").length != 0) {
                        url = document.getElementsByTagName("video")[0].src;
                    } else {
                        div = document.getElementById("Content").firstElementChild.firstElementChild.nextElementSibling.nextElementSibling
                        .firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                        
                        url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                    }
                    
                } else if (message.pageURL.includes("story")) {
                    div = document.getElementById("Content").firstElementChild.firstElementChild.firstElementChild.nextElementSibling;
                    url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                }
                
            } else if (message.source == "link") {
                var list = document.getElementById("Content").getElementsByTagName("a");
                for (i = 0; i < list.length; i++) {
                    if (list[i].href == message.linkURL) {
                        
                        if (message.linkURL.includes("region")) {
                            if (message.pageURL.includes("regions/")) {
                                div = list[i].firstElementChild.firstElementChild.firstElementChild;
                            } else {
                                div = list[i].firstElementChild;
                            }
                            url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                            
                        } else if (message.linkURL.includes("comic")) {
                            if (message.pageURL.includes("newest/")) {
                                div = list[i].firstElementChild;
                            } else {
                                div = list[i].firstElementChild.firstElementChild.firstElementChild;
                            }
                            url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                            
                        } else if (message.linkURL.includes("story")) {
                            if (message.pageURL.includes("newest/")) {
                                div = list[i].firstElementChild;
                                url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                            } else {
                                div = list[i].parentElement.nextElementSibling;
                                // null check is required here because of biographies
                                if (div != null) {
                                    url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                                }
                            }
                            
                        } else if (message.linkURL.includes("champion")) {
                            if (message.pageURL.includes("champions/")) {
                                div = list[i].firstElementChild.firstElementChild;
                            } else {    
                                div = list[i].firstElementChild.firstElementChild.firstElementChild;
                            }
                            url = parseURL(window.getComputedStyle(div).getPropertyValue("background-image"));
                        }
                        
                    }
                }
            }
            
            sendResponse({
                id: "extract-image-response",
                sucess: (url != undefined),
                imageURL: url
            });
            break;
        default:
            console.log("Received unknown message with id " + message.id);
            console.log(message, sender);
            break;
    }
});
