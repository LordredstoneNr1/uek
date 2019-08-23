var open = false;
var storyList;
var width;

//read these from the options eventually
var widthFactor = 0.4;
var widthConst = 200;


//some functions we'll need.
function changeVisibility() {
    
    open = !open;
    //update context menu and riotbar entry
    if (!open) {
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: -"+ width +"px;");
    } else {
        document.getElementById("uek-base-wrapper").removeAttribute("style");
    }
    
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

/* Main logic, handle injection after window is ready 
this does need to be on load, even though the script SHOULD load after DOM is ready.
Seems like Riots scripts are too slow in constructing their website. 
*/
window.addEventListener("load", function() {
    readHtmlFile("html/inject.html", function (element) {
        
        function show(key) {
            document.getElementsByClassName("activeTab")[0].classList.remove("activeTab");
            var blocklist = document.getElementById("uek-main-body").children;
            //forEach / for in does not work for some reason idk. Should be the same in performance and readability so idc either.
            for (i = 0; i < blocklist.length; i++) {
               blocklist[i].classList.add("hidden");
            }
            //remove everything and add it back to the things we need.
            document.getElementById("uek-main-link-"+key).classList.add("activeTab");
            document.getElementById("uek-main-block-"+key).classList.remove("hidden");
        }
        
        function parseTR(index, story) {
            var html = [];
            html.push(
            "<td>" + (index+1) + "</td>",
            "<td>" + story.title + "</td>",
            "<td>" + story.words + "</td>",
            "<td>" + story.tags.champions.join(", ") + "</td>",
            "<td>" + story.tags.regions.join(", ") + "</td>",
            "<td>" + story.tags.authors.join(", ") + "</td>",
            "<td>" + new Date(story.timestamp).toLocaleDateString() + "</td>"
            );
            return html.join("\n");
        }
        
        //needs to be async because we need to wait for the response.
        async function generateStoryHTML(object) {
            if (storyList === undefined) {
                storyList = await new Promise ((resolve, reject) => {
                    chrome.runtime.sendMessage({id: "get-stories"}, 
                    function(response) {
                        if (response.id === "get-stories-response" && response.success == true) {
                            resolve(response.data);
                        } else {
                            reject("Could not get story data from background script");
                        }
                    });
                });
            }
            var currentSelection = storyList;
            //Apply filters and sort the list;
            /*
            if (filter1Active()) {
                currentSelection = currentSelection.filter();
            }
            if () {
                ...
            }
            currentSelection.sort();
            */
            for (i = 0; i < currentSelection.length; i++) {
                var row = document.createElement("tr");
                row.innerHTML = parseTR(i, currentSelection[i]);
                object.appendChild(row);
            }
        }
        
        var injectDoc = new DOMParser().parseFromString(element, "text/html");

        // Inject link in the menu
        document.getElementById("riotbar-navmenu").lastElementChild.firstElementChild.appendChild(injectDoc.getElementById("uek-link-element"));
        // Link in the Riot Menu
        document.getElementById("uek-link-open").onclick = function () { changeVisibility();};
        chrome.storage.sync.get("options", function(options) {
            document.getElementById("uek-link-open").firstElementChild.innerHTML = options.shortcut;
        });
        
        document.getElementsByTagName("body")[0].appendChild(injectDoc.getElementById("uek-base-wrapper"));
        width = widthConst + widthFactor * window.innerWidth;
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: -"+ width +"px;");
        document.getElementById("uek-main-page").setAttribute("style", "width: "+ width +"px;");
        var baseHeightStr = window.getComputedStyle(document.getElementById("uek-main-body")).getPropertyValue("height");
        var baseHeight = Number.parseInt(baseHeightStr.substring(0, baseHeightStr.length-2), 10);
        
        var filterHeightStr = window.getComputedStyle(document.getElementById("uek-stories-filter")).getPropertyValue("height");
        var filterHeight = Number.parseInt(filterHeightStr.substring(0, filterHeightStr.length-2), 10);
        
        var storyTableBodyHeight = baseHeight - filterHeight;
        document.getElementById("uek-stories-display").setAttribute("style", "height: " + storyTableBodyHeight + "px;");
        document.getElementById("uek-stories-table-body").setAttribute("style", "height: " + (storyTableBodyHeight-40) + "px;");
        
        // Link in the extension div
        document.getElementById("uek-toggle-link").onclick = function() { changeVisibility();};
        document.getElementById("uek-toggle-open").src = chrome.runtime.getURL("images/arrow-right.png");
        document.getElementById("uek-toggle-close").src = chrome.runtime.getURL("images/arrow-left.png");
        
        document.getElementById("uek-main-link-stories").onclick = function() {show("stories");};
        document.getElementById("uek-main-link-lists").onclick = function() {show("lists");};
        document.getElementById("uek-main-link-about").onclick = function() {show("about");};
        
        generateStoryHTML(document.getElementById("uek-stories-table-body"));

    });
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.id) {
        case "toggle-panel":
            // only after dom is ready, should put a quick check here.
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
                success: (url != undefined),
                imageURL: url
            });
            break;
        default:
            console.log("Received unknown message with id " + message.id);
            console.log(message, sender);
            break;
    }
});
