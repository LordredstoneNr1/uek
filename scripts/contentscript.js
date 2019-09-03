const universeLanguages = ["cs-CZ", "de-DE", "el-GR", "en-AU", "en-GB", "en-PH", "en-PL", "en-SG", "en-US", 
    "es-AR", "es-ES", "es-MX", "fr-FR", "hu-HU", "id-ID", "it-IT", "ja-JP", "ko-KR", "ms-MY", 
    "pl-PL", "pt-BR", "ro-RO", "ru-RU", "th-TH", "tr-TR", "vn-VN", "zh_cn", "zh_tw"];
    
var open = false;
var championList = [], authorList = [], regionList = [];
var height, width, posLeft, posTop;
var storyList; 
var stories_sortKey = "title";

//some functions we'll need. These need to be acessible outside of main
function changeVisibility() {
    
    open = !open;
    //update context menu and riotbar entry
    if (!open) {
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: -" + width + "px; top: " + posTop + "px; height: " + height + "px;");
    } else {
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: " + posLeft + "px; top: " + posTop + "px; height: " + height + "px;");
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

function main(inject) {
    // Some function definitions, I'd rather have them here if possible. only changeVisibility and readHtmlFile need to be outside.
    
    function show(key) {
        document.getElementsByClassName("activeTab")[0].classList.remove("activeTab");
        var blocklist = document.getElementById("uek-main-body").children;
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
        "<td> <a href=\"" + story.url + "\">" + story.title + "</a></td>",
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
                if (b.title == null) return -1;
                if (a.title == null) return 1;
                return a.title.localeCompare(b.title);
                break;
                
            case "words":
                //Default from high to low here
                return b.words - a.words;
                break;
                
            case "release":
                if (b.timestamp == null) return -1;
                if (a.timestamp == null) return 1;
                return b.timestamp.localeCompare(a.timestamp);
                break;
            
            case "authors":
                var maxIndex = Math.min(a.tags.authors.length, b.tags.authors.length);
                for (i = 0; i < maxIndex; i++) {
                    if (a.tags.authors[i].localeCompare(b.tags.authors[i]) != 0) {
                        return a.tags.authors[i].localeCompare(b.tags.authors[i]);
                        break;
                    }
                }
                return a.tags.authors.length - b.tags.authors.length;
                break;
            
            case "champions":
                if (b.tags.champions.length == 0) return -1;
                if (a.tags.champions.length == 0) return 1;
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
                if (b.tags.regions.length == 0) return -1;
                if (a.tags.regions.length == 0) return 1;
                var maxIndex = Math.min(a.tags.regions.length, b.tags.regions.length);
                for (i = 0; i < maxIndex; i++) {
                    if (a.tags.regions[i].localeCompare(b.tags.regions[i]) != 0) {
                        return a.tags.regions[i].localeCompare(b.tags.regions[i]);
                    }
                }
                return a.tags.regions.length - b.tags.regions.length;
                break;
                
            default: 
                return 0;
                break;
        }
    }
    
    function parseData() {
        
        championList = [], authorList = [], regionList = [];
        storyList.forEach(function (story) {
            championList.push(story.tags.champions);
            authorList.push(story.tags.authors);
            regionList.push(story.tags.regions);
        });
        
        //remove duplicates & sort
        championList = [...new Set(championList.flat())].sort();
        
        regionList = regionList.flat().reduce(function (cumultativeRegions, newRegion) {
            const index = cumultativeRegions.findIndex(a => a.name === newRegion);
            if (index === -1) {
                cumultativeRegions.push({"name": newRegion, "nr":1});
            } else {
                cumultativeRegions[index].nr++;
            }
            return cumultativeRegions;
        }, []).sort((a,b) => b.nr - a.nr).map(a => a.name);
        
        //removes duplicates & sort by number of times they appear (=> number of stories)
        authorList = authorList.flat().reduce(function (cumultativeAuthors, newAuthor) {
            const index = cumultativeAuthors.findIndex(a => a.name === newAuthor);
            if (index === -1) {
                cumultativeAuthors.push({"name": newAuthor, "nr":1});
            } else {
                cumultativeAuthors[index].nr++;
            }
            return cumultativeAuthors;
        }, []).sort((a,b) => b.nr - a.nr).map(a => a.name);
        
        regionList.forEach(function (region) {
            const element = document.createElement("option");
            element.value = region;
            element.innerHTML = region;
            document.getElementById("uek-filter-regions-dropdown").appendChild(element);
        });
        
        authorList.forEach(function (author) {
            const element = document.createElement("option");
            element.value = author;
            element.innerHTML = author;
            document.getElementById("uek-filter-authors-dropdown").appendChild(element);
        });
        
    }
    
    //needs to be async because we need to wait for the response.
    async function generateStoryHTML() {
        const target = document.getElementById("uek-stories-table-body");
        target.innerHTML = "";
        if (storyList === undefined) {
            console.log(await new Promise ((resolve, reject) => {
                chrome.runtime.sendMessage({id: "get-stories"}, 
                function(response) {
                    if (response.id === "get-stories-response" && response.success == true) {
                        
                        storyList = response.stories;
                        parseData();
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
        if (stories_sortKey.endsWith("reverse")) {
            storyList.forEach(function (story) {
                story.tags.champions.sort().reverse();
                story.tags.regions.sort().reverse();
                story.tags.authors.sort().reverse();
            });
            
            currentSelection.sort((a,b) => compareStories(a,b, stories_sortKey.substring(0, stories_sortKey.indexOf("-reverse")))).reverse();
        } else {
            storyList.forEach(function (story) {
                story.tags.champions.sort();
                story.tags.regions.sort();
                story.tags.authors.sort();
            });
            currentSelection.sort((a,b) => compareStories(a,b, stories_sortKey));
        }
        console.log("Displaying current selection, sorted by: ", stories_sortKey, currentSelection);
        
        for (i = 0; i < currentSelection.length; i++) {
            const row = document.createElement("tr");
            row.innerHTML = parseTR(i, currentSelection[i]);
            target.appendChild(row);
        }
    }
    
    function calculateHeight() {
        const heightConst = document.getElementById("uek-options-heightconst").value;
        const heightFactor = document.getElementById("uek-options-heightfactor").value;
        document.getElementById("uek-options-height").value = Math.round(heightFactor / 100 * window.innerHeight + heightConst * 1) + "px";
    }
    
    function calculateWidth() {
        const widthConst = document.getElementById("uek-options-widthconst").value;
        const widthFactor = document.getElementById("uek-options-widthfactor").value;
        document.getElementById("uek-options-width").value = Math.round((widthFactor / 100 * window.innerWidth) + widthConst * 1) + "px";
    }
    
    function calculatePosition() {
        const posLeft = document.getElementById("uek-options-left").value;
        const posTop = document.getElementById("uek-options-top").value;
        document.getElementById("uek-options-position").value = "" + posLeft + " / " + posTop;
    }
    
    // Injection and logic
    const injectDoc = new DOMParser().parseFromString(inject, "text/html");
            
    document.getElementById("riotbar-navmenu").lastElementChild.firstElementChild.appendChild(injectDoc.getElementById("uek-link-element"));
    document.getElementById("uek-link-open").onclick = function () { changeVisibility();};
    
    document.body.appendChild(injectDoc.getElementById("uek-base-wrapper"));
    translate();
    
    //Window layout & options callback
    chrome.storage.sync.get("options", function(items) {
        width = items.options.widthConst + (items.options.widthFactor / 100 * window.innerWidth);
        height = items.options.heightConst + (items.options.heightFactor / 100 * window.innerHeight);
        posLeft = items.options.posLeft;
        posTop = items.options.posTop;
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: -"+ width +"px; top: " + posTop + "px; height: " + height + "px;");
        document.getElementById("uek-main-page").setAttribute("style", "width: "+ width +"px;");
        document.getElementById("uek-base-wrapper").classList.remove("hidden");
        
        document.getElementById("uek-options-heightfactor").value = items.options.heightFactor;
        document.getElementById("uek-options-heightconst").value = items.options.heightConst;
        document.getElementById("uek-options-widthfactor").value = items.options.widthFactor;
        document.getElementById("uek-options-widthconst").value = items.options.widthConst;
        document.getElementById("uek-options-left").value = posLeft;
        document.getElementById("uek-options-top").value = posTop;
                        
        document.getElementById("uek-stories-table-body").setAttribute("style", "height: " + (document.getElementById("uek-main-block-stories").offsetHeight - document.getElementById("uek-stories-filter").offsetHeight- 40) + "px;");
        
    });
      
    { // Header and link
        document.getElementById("uek-toggle-link").onclick = function() { changeVisibility();};
        document.getElementById("uek-toggle-open").src = chrome.runtime.getURL("images/arrow-right.png");
        document.getElementById("uek-toggle-close").src = chrome.runtime.getURL("images/arrow-left.png");
        
        document.getElementById("uek-main-link-stories").onclick = function() {show("stories");};
        document.getElementById("uek-main-link-lists").onclick = function() {show("lists");};
        document.getElementById("uek-main-link-options").onclick = function() {show("options");};
        document.getElementById("uek-main-link-about").onclick = function() {show("about");};
    }
   
    { //Story tab
    
        document.getElementById("uek-filter-apply").onclick = function() {
            generateStoryHTML(document.getElementById("uek-stories-table-body"));
        };
        
        document.getElementById("uek-filter-save").onclick = function() {
            
        };
    
        //No need to set onclick for reset because that will reset the form by default
        
        //Same, resetting is default, but we also need to ask the background script to reload the stories
        document.getElementById("uek-filter-reload").onclick = function() {
            chrome.runtime.sendMessage({id: "query-stories"}, 
                function(response) {
                    if (response.id === "get-stories-response" && response.success == true) {
                        storyList = response.stories;
                        stories_sortKey = "title";
                        parseData();
                        generateStoryHTML();
                    }
                }
            );
        };
        
        //short version to assign the correct keyword to the table heading
        ["", "title", "words", "champions", "regions", "authors", "release" ].forEach(function(key, i) {
            document.getElementById("uek-stories-table-heading").firstElementChild.children[i].onclick = function() {
                if (stories_sortKey === key && key != "") {
                    stories_sortKey = key + "-reverse";
                } else {
                    // no extra check if it was reversed before: this returns it to its original state!
                    stories_sortKey = key;
                }
                document.getElementsByClassName("activeSort")[0].classList.remove("activeSort");
                document.getElementById("uek-stories-table-heading").firstElementChild.children[i].classList.add("activeSort");
                generateStoryHTML(document.getElementById("uek-stories-table-body"));
            }
        });
        
        generateStoryHTML();
    }

    { // Lists tab
        
    }

    { // Options tab
        document.getElementById("uek-options-heightfactor").oninput = calculateHeight;
        document.getElementById("uek-options-heightconst").oninput = calculateHeight;
        
        document.getElementById("uek-options-widthfactor").oninput = calculateWidth;
        document.getElementById("uek-options-widthconst").oninput = calculateWidth;
        
        document.getElementById("uek-options-left").oninput = calculatePosition;
        document.getElementById("uek-options-top").oninput = calculatePosition;
        
        document.getElementById("uek-options-confirm").onclick = function () {
            chrome.storage.sync.get("options", function (items) {
                const options = items.options;
                options.heightfactor = document.getElementById("uek-options-heightfactor").value;
                options.heightConst = document.getElementById("uek-options-heightconst").value;
                options.widthFactor = document.getElementById("uek-options-widthfactor").value;
                options.widthConst = document.getElementById("uek-options-widthconst").value;
                options.posLeft = document.getElementById("uek-options-left").value;
                options.posTop = document.getElementById("uek-options-top").value;
                chrome.storage.sync.set({"options": options});
            });
        }; 
        document.getElementById("uek-options-reload").onclick = function () {
            chrome.storage.sync.get("options", function (items) {
                const options = items.options;
                options.heightfactor = document.getElementById("uek-options-heightfactor").value;
                options.heightConst = document.getElementById("uek-options-heightconst").value;
                options.widthFactor = document.getElementById("uek-options-widthfactor").value;
                options.widthConst = document.getElementById("uek-options-widthconst").value;
                options.posLeft = document.getElementById("uek-options-left").value;
                options.posTop = document.getElementById("uek-options-top").value;
                chrome.storage.sync.set({"options": options}, function () {
                    console.log("Restarting UEK");
                    document.getElementById("uek-base-wrapper").parentElement.removeChild(document.getElementById("uek-base-wrapper"));
                    open = false;
                    championList = [];
                    authorList = [];
                    regionList = [];
                    height = undefined;
                    width = undefined; 
                    storyList = undefined; 
                    stories_sortKey = "title";
                    main(inject);
                });
            });
        };
        document.getElementById("uek-options-delete").onclick = function() {
            document.getElementById("uek-options-delete-text").classList.toggle("hidden");
            document.getElementById("uek-options-delete-confirm").classList.toggle("hidden");
        };
        document.getElementById("uek-options-delete-confirm").onchange = function(e) {
            if (e.srcElement.value === "delete") {
                chrome.storage.sync.clear();
                alert("Storage cleared.");
                chrome.storage.sync.set({"options": {
                    widthFactor: 40, // 40% = 0.4
                    widthConst: 200,
                    heightFactor: 70, // 70% = 0.7
                    heightConst: 200,
                    posTop: 150,
                    posLeft: 15,
                    universeOverride: chrome.i18n.getMessage("info_universecode")
                }});
            }
        }
    }
    
    { // About Tab
        
    }

}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (document.readyState == "complete") {
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
                    success: (url != undefined),
                    imageURL: url
                });
                break;
            default:
                console.log("Received unknown message with id " + message.id);
                console.log(message, sender);
                break;
        }
    }
});

// Execute main logic after Riot set up the window
new MutationObserver(function(mutationsList, observer) {
    if (mutationsList.find(a => a.target.id === "riotbar-navmenu") != undefined) {
        observer.disconnect();
        readHtmlFile("html/inject.html", main);
    }
}).observe(document.body, {childList: true, subtree: true});
