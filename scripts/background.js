console.debug("Background script loaded");

//Setting up data
function update() {
    
    console.debug("Started update");
    
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
                options = items.options;
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
            console.log("%c Startup ", "color: red; font-weight: bold;", "Initializing UEK");
        },
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to fetch story modules from Universe.", errorMsg);
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
            case "open":
                chrome.tabs.sendMessage(tab.id, {
                    id: "toggle-panel",
                    data: ""
                });
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
        case "open-tab":
            chrome.tabs.create({
                "url": request.url,
                "index": sender.tab.index +1,
                "openerTabId": sender.tab.id
            });
    }
    return true;
});