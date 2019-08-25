var open = false;
var storyList, championList, authorList, regionList;
var width;

//read these from the options eventually
var widthFactor = 0.4;
var widthConst = 200;

var sortKey = "title";

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
        
        function compareStories(a, b, key) {
            switch (key) {
                // Use title instead of slug because slugs are x-color-story: Unexpected results while sorting
                case "title": 
                    return a.title.localeCompare(b.title);
                    break;
                    
                case "words":
                    //Default from high to low here
                    return b.words - a.words;
                    break;
                    
                case "release":
                    return b.timestamp - a.timestamp;
                    break;
                
                case "authors":
                    var maxIndex = Math.min(a.tags.authors.length, b.tags.authors.length);
                    for (i = 0; i < maxIndex; i++) {
                        if (a.authors[i].localeCompare(b.authors[i]) != 0) {
                            return a.authors[i].localeCompare(b.authors[i]);
                            break;
                        }
                    }
                    return a.authors.length - b.authors.length;
                    break;
                
                case "champions":
                    var maxIndex = Math.min(a.tags.champions.length, b.tags.champions.length);
                    for (i = 0; i < maxIndex; i++) {
                        if (a.tags.champions[i].localeCompare(b.tags.champions[i]) != 0) {
                            return a.tags.champions[i].localeCompare(b.tags.champions[i]);
                            break;
                        }
                    }
                    return a.tags.champions.length - b.tags.champions.length;
                    break;
                
                case "regions":
                    var maxIndex = Math.min(a.tags.regions.length, b.tags.regions.length);
                    for (i = 0; i < maxIndex; i++) {
                        if (a.tags.regions[i].localeCompare(b.tags.regions[i]) != 0) {
                            return a.regions[i].localeCompare(b.tags.regions[i]);
                            break;
                        }
                    }
                    return a.tags.regions.length - b.tags.regions.length;
                    break;
                    
                default: 
                    return 0;
                    break;
            }
        }
        
        //needs to be async because we need to wait for the response.
        async function generateStoryHTML(object) {
            object.innerHTML = "";
            if (storyList === undefined) {
                console.log(await new Promise ((resolve, reject) => {
                    chrome.runtime.sendMessage({id: "get-stories"}, 
                    function(response) {
                        if (response.id === "get-stories-response" && response.success == true) {
                            
                            storyList = response.stories;
                            
                            regionsList = Object.values(response.champions).filter((v, i, s) => s.indexOf(v) === i); //fast filter for duplicates.
                            regionsList.forEach(function (region) {
                                const element = document.createElement("option");
                                element.value = region;
                                element.innerHTML = region;
                                document.getElementById("uek-filter-regions-dropdown").appendChild(element);
                            });
                            
                            authorList = response.authors;
                            authorList.forEach(function (region) {
                                const element = document.createElement("option");
                                element.value = region;
                                element.innerHTML = region;
                                document.getElementById("uek-filter-authors-dropdown").appendChild(element);
                            });
                            resolve("Data parsed successfully");
                        } else {
                            reject("Could not get story data from background script");
                        }
                    });
                }));
            }
            var currentSelection = Array.from(storyList);
            //Apply filters and sort the list;
            if (document.getElementById("uek-filter-title").checked) {
                const title = document.getElementById("uek-filter-title-text").value;
                currentSelection = currentSelection.filter(a => new RegExp(title, "i").test(a.title));
            }
            if (document.getElementById("uek-filter-champions").checked) {
                currentSelection = currentSelection.filter(function (story) {
                    const championSlugs = document.getElementById("uek-filter-champions-text").value.split(",");
                    const championString = story.tags.champions.join(", ");
                    for (i = 0; i < championSlugs.length; i++) {
                        if (!new RegExp(championSlugs[i].trim(), "i").test(championString)) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            if (document.getElementById("uek-filter-regions").checked) {
                const region = document.getElementById("uek-filter-regions-dropdown").value;
                if (region != "") {
                    currentSelection = currentSelection.filter(a => a.tags.regions.includes(region));
                }
            }
            if (document.getElementById("uek-filter-authors").checked) {
                const author = document.getElementById("uek-filter-authors-dropdown").value;
                if (author != "") {
                    currentSelection = currentSelection.filter(a => a.tags.authors.includes(author));
                }
            }
            if (document.getElementById("uek-filter-type").checked) {
                const universe = document.getElementById("uek-filter-type-universe-dropdown").value;
                const type = document.getElementById("uek-filter-type-type-dropdown").value;
                if (universe === "main-universe") {
                    currentSelection = currentSelection.filter(a=> a.tags.regions.length > 0);
                } else if (universe === "alternate-universes")  {
                    currentSelection = currentSelection.filter(a=> a.tags.regions.length == 0);
                }
                
                const excludes = ["nami-first-steps", "rengar-prey"];
                
                if (type === "color-stories") {
                    currentSelection = currentSelection.filter(a=> a.slug.includes("color") || excludes.includes(a.slug));
                } else if (type === "long-stories") {
                    currentSelection = currentSelection.filter(a=> !(a.slug.includes("color") || excludes.includes(a.slug)));
                }
            }
            if (document.getElementById("uek-filter-words").checked) {
                const min = document.getElementById("uek-filter-words-min").value;
                const max = document.getElementById("uek-filter-words-max").value;
                if (min !== "") {currentSelection = currentSelection.filter(a=> a.words >= min);}
                if (max !== "") {currentSelection = currentSelection.filter(a=> a.words <= max);}
            }
            if (document.getElementById("uek-filter-date").checked) {
                const min = document.getElementById("uek-filter-date-min").value;
                const max = document.getElementById("uek-filter-date-max").value;
                if (min !== "") {currentSelection = currentSelection.filter(a => a.timestamp >= min);}
                if (max !== "") {currentSelection = currentSelection.filter(a => a.timestamp <= max);}
            }
            //slice returns a copy because split would modify it, this only modifies the copy.
            currentSelection.sort((a,b) => compareStories(a,b, sortKey.slice().split("-")[0]));
            if (sortKey.endsWith("reverse")) {
                currentSelection.reverse();
            }
            console.log("Displaying current selection, sorted by: ", sortKey, currentSelection);
            
            for (i = 0; i < currentSelection.length; i++) {
                const row = document.createElement("tr");
                row.innerHTML = parseTR(i, currentSelection[i]);
                object.appendChild(row);
            }
        }
        
        const injectDoc = new DOMParser().parseFromString(element, "text/html");

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
        const baseHeightStr = window.getComputedStyle(document.getElementById("uek-main-body")).getPropertyValue("height");
        const baseHeight = Number.parseInt(baseHeightStr.substring(0, baseHeightStr.length-2), 10);
        
        const filterHeightStr = window.getComputedStyle(document.getElementById("uek-stories-filter")).getPropertyValue("height");
        const filterHeight = Number.parseInt(filterHeightStr.substring(0, filterHeightStr.length-2), 10);
        
        const storyTableBodyHeight = baseHeight - filterHeight;
        document.getElementById("uek-stories-display").setAttribute("style", "height: " + storyTableBodyHeight + "px;");
        document.getElementById("uek-stories-table-body").setAttribute("style", "height: " + (storyTableBodyHeight-40) + "px;");
        
        
        // Link in the extension div
        document.getElementById("uek-toggle-link").onclick = function() { changeVisibility();};
        document.getElementById("uek-toggle-open").src = chrome.runtime.getURL("images/arrow-right.png");
        document.getElementById("uek-toggle-close").src = chrome.runtime.getURL("images/arrow-left.png");
        
        document.getElementById("uek-main-link-stories").onclick = function() {show("stories");};
        document.getElementById("uek-main-link-lists").onclick = function() {show("lists");};
        document.getElementById("uek-main-link-about").onclick = function() {show("about");};
        
        
        //Story filter
        generateStoryHTML(document.getElementById("uek-stories-table-body"));
        document.getElementById("uek-filter-apply").onclick = function() {generateStoryHTML(document.getElementById("uek-stories-table-body"))};
        document.getElementById("uek-filter-save").onclick = function() {alert("Doesn't work yet: There are no stories to save this selection to.")};
    
        //short version to assign the correct keyword to the table heading
        ["", "title", "words", "champions", "regions", "authors", "release" ].forEach(function(key, i) {
            document.getElementById("uek-stories-table-heading").firstElementChild.children[i].onclick = function() {
                if (sortKey === key && key != "") {
                    sortKey = key + "-reverse";
                } else {
                    // no extra check if it was reversed before: this returns it to its original state!
                    sortKey = key;
                }
                
                generateStoryHTML(document.getElementById("uek-stories-table-body"));
            }
        });
        
        
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
