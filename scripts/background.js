console.debug("Background script loaded");

// Default options
var options = {
    "widthFactor": 40, 
    "widthConst": 200,
    "heightFactor": 70, 
    "heightConst": 200,
    "posTop": 200,
    "posLeft": 15,
    "contextMenus": true,
    "changelog": true,
    "universeOverride": chrome.i18n.getMessage("info_universecode")
};

//Setting up data
function update() {
    console.debug("Started update");
    
    //Clear for Debug purposes, do not ship with this :D
    //chrome.storage.sync.clear();
    
    chrome.storage.sync.get(null, function(items) {
        console.debug(items);
        
        // No options: fresh install
        if (!items.options) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "UEK: First Startup");
            options = {
                "widthFactor": 40, 
                "widthConst": 200,
                "heightFactor": 70, 
                "heightConst": 200,
                "posTop": 150,
                "posLeft": 15,
                "contextMenus": true,
                "changelog": true,
                "universeOverride": chrome.i18n.getMessage("info_universecode")
            };
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
        }
        console.log("%c Startup ", "color: red; font-weight: bold;", "Initializing UEK");
        console.log("%c Data ", "background: green; border-radius: 5px;", "Options: ", options);
    });
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
            "*://universe.leagueoflegends.com/*/comic/", 
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
                },
                function (response) {
                  if (response && response.id === "extract-image-response") {
                        chrome.tabs.create({
                            "url": response.imageURL,
                            "index": tab.index + 1,
                            "openerTabId": tab.id
                        });
                    }
                });
                break;
            case "extractImagePage":
                chrome.tabs.sendMessage(tab.id, {
                    id: "extract-image",
                    source: "page",
                    pageURL: info.pageUrl
                },
                function (response) {
                    if (response && response.id === "extract-image-response") {
                        chrome.tabs.create({
                            "url": response.imageURL,
                            "index": tab.index + 1,
                            "openerTabId": tab.id
                        });
                    }
                });
                break;
        } 
        if (Object.keys(StoryList.unpackedLists).includes(info.menuItemId)) {
           StoryList.unpackedLists[info.menuItemId].add(info.linkUrl);
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
    }
    return true;
});