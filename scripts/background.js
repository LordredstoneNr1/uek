console.debug("Background script loaded");

//Setting up data
function update() {
    console.debug("Started update");
    var temp = null;
    
    //Clear for Debug purposes, do not ship with this :D
    //chrome.storage.sync.clear();
    
    
    // this sequence is deliberately chosen: requesting universe needs the locale found in options, and unpacking the lists needs the stories from universe.
    getAsPromise().then(
        function(items) {
            console.debug(items);
            
            // No options: fresh install
            if (!items.options) {
                console.log("%c Startup ", "color: red; font-weight: bold;", "UEK: First Startup");
                
                chrome.commands.getAll(function (commands) {
                    options.shortcut = commands[1].shortcut;
                    chrome.storage.sync.set({"options": options, "read": new Array()});
                });
            } else {
                for (entry in items) {
                    if (entry.startsWith("list: ")) {
                        chrome.contextMenus.create({
                            "id": entry,
                            "parentId": "listsRoot",
                            "title": entry.substring(6),
                            "targetUrlPatterns": ["*://universe.leagueoflegends.com/*/story/*"],
                            "contexts": ["link"]
                        }, function() {
                            if (chrome.runtime.lastError) {
                                console.debug("%c Expected ", "background: lime; color: black; border-radius: 5px;", "Error while creating context menu item " + entry + ": ", chrome.runtime.lastError.message);
                            }
                        });
                    } 
                };
                options = items.options;
                temp = items;
            }
            console.log("%c Data ", "background: green; border-radius: 5px;", "Options: ", options);
            return request("https://universe-meeps.leagueoflegends.com/v1/" + options.universeOverride.toLowerCase().replace("-", "_") + "/explore2/index.json");
        }, 
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to load synchronized storage.", errorMsg);
        }
    ).then(
        function (requestData) {
            JSON.parse(requestData).modules.forEach(function (module) {
                if (module.type === "story-preview") {
                    new UnpackedStory(module);
                }
            });
            return temp;
        },
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to fetch story modules from Universe.", errorMsg);
        }
    ).then(
        function (listData) {
            for (entry in listData) {
                if (entry.startsWith("list: ")) {
                    new StoryList(listData[entry].data, [entry.substring(6), listData[entry].deleteAfterRead, listData[entry].suggest]);
                }                    
            }
            console.log("%c Startup ", "color: red; font-weight: bold;", "Initializing UEK");
        },
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to parse list input.", errorMsg);
        }
    );  
};

// Run only once on startup / update
chrome.runtime.onInstalled.addListener(function() {
    
    //Creating Context Menu
    chrome.contextMenus.removeAll();   
    chrome.contextMenus.create({
        "id": "root",
        "title": "Universe Enhancement Kit",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "id": "open",
        "parentId": "root",
        "title": "Open side-bar",
        "contexts": ["page"],
        "visible": true,
        "documentUrlPatterns": ["*://universe.leagueoflegends.com/*"]
    });
    chrome.contextMenus.create({
        "id": "listsRoot",
        "parentId": "root",
        "title": "Add to list...",
        "targetUrlPatterns": ["*://universe.leagueoflegends.com/*/story/*"],
        "contexts": ["link"]
    });
    chrome.contextMenus.create({
        "id": "listsNew",
        "parentId": "listsRoot",
        "title": "New List...",
        "targetUrlPatterns": ["*://universe.leagueoflegends.com/*/story/*"],
        "contexts": ["link"]
    });
    chrome.contextMenus.create({
        "id": "extractImageLink",
        "parentId": "root",
        "title": "Extract image",
        "contexts": ["link"],
        "visible": true,
        "documentUrlPatterns": ["*://universe.leagueoflegends.com/*"],
        "targetUrlPatterns": [
            "*://universe.leagueoflegends.com/*/story/*", 
            "*://universe.leagueoflegends.com/*/region/*",
            "*://universe.leagueoflegends.com/*/comic/*", 
            "*://universe.leagueoflegends.com/*/champion/*" 
        ]
    });
    chrome.contextMenus.create({
        "id": "extractImagePage",
        "parentId": "root",
        "title": "Extract image",
        "contexts": ["page"],
        "visible": true,
        "documentUrlPatterns": [
            "*://universe.leagueoflegends.com/*/story/*",
            "*://universe.leagueoflegends.com/*/region/*",
            "*://universe.leagueoflegends.com/*/comic/*", 
            "*://universe.leagueoflegends.com/*/champion/*",
            "*://universe.leagueoflegends.com/*/race/*" 
        ]
    });
    chrome.contextMenus.create({
        "id": "openSourceLink",
        "parentId": "root",
        "title": "Open link source page",
        "contexts": ["link"],
        "visible": true,
        "documentUrlPatterns": ["*://universe.leagueoflegends.com/*"],
        "targetUrlPatterns": [
            "*://universe.leagueoflegends.com/*/story/*", 
            "*://universe.leagueoflegends.com/*/region/*",
            "*://universe.leagueoflegends.com/*/comic/*", 
            "*://universe.leagueoflegends.com/*/champion/*",
            "*://universe.leagueoflegends.com/*/race/*" 
        ]
    });
    chrome.contextMenus.create({
        "id": "openSourcePage",
        "parentId": "root",
        "title": "Open page source",
        "contexts": ["page"],
        "visible": true,
        "documentUrlPatterns": [
            "*://universe.leagueoflegends.com/*/story/*",
            "*://universe.leagueoflegends.com/*/region/*",
            "*://universe.leagueoflegends.com/*/comic/*", 
            "*://universe.leagueoflegends.com/*/champion/*",
            "*://universe.leagueoflegends.com/*/race/*" 
        ]
    });
    chrome.contextMenus.create({
        "id": "details",
        "parentId": "root",
        "title": "To GitHub Repository",
        "contexts": ["page", "browser_action"]
    });
    chrome.contextMenus.create({
        "id": "about",
        "parentId": "root",
        "title": "About...",
        "contexts": ["page", "browser_action"]
    });
    
    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        console.debug("Context menu: ", info);
        switch (info.menuItemId)  {
            case "root":
                chrome.tabs.create({
                    "url": "https://universe.leagueoflegends.com/" + options.universeOverride.replace("-", "_") + "/",
                    "index": tab.index + 1,
                    "openerTabId": tab.id
                });
                break;
            case "details": 
                chrome.tabs.create({
                    "url": "https://github.com/LordredstoneNr1/uek",
                    "index": tab.index + 1,
                    "openerTabId": tab.id
                });
                break;
            case "about":
                chrome.tabs.create({
                    "url": chrome.runtime.getManifest().homepage_url,
                    "index": tab.index + 1,
                    "openerTabId": tab.id
                });
                break;
            case "open":
                chrome.tabs.sendMessage(tab.id, {
                    id: "toggle-panel",
                    data: ""
                });
                break;
            case "listsNew":
                list = new StoryList([], ["New List", "delete", false]);
                list.add(info.linkUrl);
                list.save();
                break;
            case "extractImageLink":
                chrome.tabs.sendMessage(tab.id, {
                    id: "extract-image",
                    source: "link",
                    linkURL: info.linkUrl,
                    //Send url along just in case
                    pageURL: info.pageUrl
                });
                break;
            case "extractImagePage":
                chrome.tabs.sendMessage(tab.id, {
                    id: "extract-image",
                    source: "page",
                    pageURL: info.pageUrl
                });
                break;
            case "openSourceLink": 
            chrome.tabs.sendMessage(tab.id, {
                    id: "open-source",
                    source: "link",
                    linkURL: info.linkUrl,
                    //Send url along just in case
                    pageURL: info.pageUrl
                });
                break;
            case "openSourcePage":
                chrome.tabs.sendMessage(tab.id, {
                    id: "open-source",
                    source: "page",
                    pageURL: info.pageUrl
                });
                break;
        } 
        const list = StoryList.unpackedLists[info.menuItemId.substring(6)];
        if (list != undefined) {
           list.add(info.linkUrl);
           list.save();
        }
    });
    
    // Execution starts here
    update();
});

chrome.commands.onCommand.addListener( function (command){
    console.debug("Command: ", command);
    if (command === "toggle-panel") {
        chrome.tabs.query(
            {"active": true, "currentWindow": true}, 
            function(currentTab) {
                chrome.tabs.sendMessage(currentTab[0].id, {id: "toggle-panel"});
            }
        );
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.debug("Message: ", request);
    switch (request.id) {
        case "update": 
            update();
            break;
        case "list-created":
            chrome.contextMenus.create({
                "id": request.name,
                "parentId": "listsRoot",
                "title": request.name.substring(6),
                "targetUrlPatterns": ["*://universe.leagueoflegends.com/*/story/*"],
                "contexts": ["link"]
            });
            break;
        case "list-renamed":
            chrome.contextMenus.remove(request.old, function () {
                chrome.contextMenus.create({
                "id": request.name,
                "parentId": "listsRoot",
                "title": request.name.substring(6),
                "targetUrlPatterns": ["*://universe.leagueoflegends.com/*/story/*"],
                "contexts": ["link"]
                });
            });
            break;
        case "open-tab":
            chrome.tabs.create({
                "url": request.url,
                "index": sender.tab.index +1,
                "openerTabId": sender.tab.id
            });
    }
    return true;
});