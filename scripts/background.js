var lists = [], unpackedLists = {},storyModules = [];

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
        "contexts": ["all"],
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
        "id": "details",
        "parentId": "root",
        "title": "To GitHub Repository",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "id": "about",
        "parentId": "root",
        "title": "About...",
        "contexts": ["all"]
    });
    chrome.contextMenus.onClicked.addListener(function(info, tab) {
        if (info.menuItemId === "details") {
            chrome.tabs.create({
                "url": "https://github.com/LordredstoneNr1/uek",
                "index": tab.index + 1,
                "openerTabId": tab.id
            });
        } else if (info.menuItemId === "about") {
            chrome.tabs.create({
                //Replace URL with post
                "url": "https://boards.na.leagueoflegends.com/en/c/story-art",
                "index": tab.index + 1,
                "openerTabId": tab.id
            });
        } else if (info.menuItemId === "open") {
            chrome.tabs.sendMessage(tab.id, "toggle-panel");
        } else if (Object.keys(unpackedLists).includes("list:" + info.menuItemId)) {
            var list = unpackedLists[info.menuItemId];
            
        }
    });
});

chrome.commands.onCommand.addListener( function(command){
    chrome.tabs.query(
        {"active": true, "currentWindow": true}, function(currentTab) {
            chrome.tabs.sendMessage(currentTab[0].id, "toggle-panel");
        }
    );
});

//Setting up data
getJSON('https://universe-meeps.leagueoflegends.com/v1/en_us/explore2/index.json', function(status, data){
    data.modules.forEach( function(obj) {
        if (obj.type === "story-preview") {
            var tags = [];  
            if (override_tags[obj.title]) {
                override_tags[obj.title].forEach( function (newTag) {
                    tags.push(newTag);
                });
            } else {
                obj['featured-champions'].forEach(function(champion) {
                    tags.push(champion.name)
                    if (!tags.includes(regions[champions[champion.name]])) {
                        // Plain text version instead of faction slug
                        tags.push(regions[champions[champion.name]]);
                    }
                });  
                if (obj.subtitle != null) {
                    // this will be "by author", so we cut "by ".
                    tags.push(obj.subtitle.substring(3));
                } else {
                    authors[obj.title].forEach( function (author) {
                        tags.push(author);
                    });
                }
                if (add_tags[obj.title]) {
                    add_tags[obj.title].forEach( function (newTag) {
                        tags.push(newTag);
                    });
                }
            }
            storyModules.push( {
                "url": obj['url'],
                "title": obj['title'],
                "timestamp": obj['release-date'],
                "words": obj['word-count'],
                "slug": obj['story-slug'],
                "tags": tags,
            });
        }
    });
    console.log("Story Modules: ", storyModules);
    //Above sets up the base modules we work with.
    
    //Clear for Debug purposes, do not ship this :D
    chrome.storage.sync.clear();
    
    //Setting up reading list
    //this NEEDS to be inside the JSON callback so it is guaranteed to have data.
    chrome.storage.sync.get(null, function(items) {
        console.log(items);
        if (!Object.keys(items).includes("firstStartUp_done")) {
            lists.push(createReadingList("all", true));
            chrome.storage.sync.set({"firstStartUp_done": true});
            save();
        } else {
            for (entry in items) {
                console.log(entry);
            };
        }
        console.log("Found ", lists.length, " lists in synchronized storage.");
        lists.forEach(function(list) {unpack(list);});
    });
});

//Stolen from StackOverflow
function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        console.log("XHR Request to \'" + url + "\' finished with status " + xhr.status);
        callback(xhr.status, xhr.response);
    };
    xhr.send();
};

//make the slug list into a full list & register it in the context menu
function unpack(list) {
    chrome.contextMenus.create({
        "id": "list:" + list.displayName,
        "parentId": "listsRoot",
        "title": list.displayName
    });
    var full = {
        
    }
    unpackedLists[full.name] = full;
};

function save() {
    lists.forEach(function (list){
        var packedList = {};
        packedList[list.displayName] = {"data" : list.data, "bool": list.deleteAfterRead};
        chrome.storage.sync.set(packedList);
    });
    chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
        console.log("Saved Data. Total bytes used: ", bytesInUse);
    });
}

function createReadingList(tag, deleteAfterRead) {
    var filteredModules = [];
    var name;
    console.log("Setting up list for tag: "+tag);
    if (tag==="all") {
        //Special Tag: All stories
        console.log("Special Tag found: " + tag);
        name = "Reading List";
        filteredModules = storyModules;
    } else if (Object.values(champions).includes(tag)) {
        //Regions
        console.log("Region found: " + tag);
        name = regions[tag];
        filteredModules = storyModules.filter(  function(obj)  {
            var found = false;
            obj['tags'].forEach( function(givenTag) {
                if (regions[tag] === givenTag) {
                    found = true;
                } 
            });
            return found;
        });
    } else if (Object.keys(champions).includes(tag)) {
        //Champions
        console.log("Champion found: " + tag);
        name = tag;
        filteredModules = storyModules.filter( function(obj)  {
            var found = false;
            obj['tags'].forEach(function(givenTag) {
                if (tag === givenTag) {
                    found = true;
                } 
            });
            return found;
        });
    } else {
        console.log("Tag not found.");
        return null;
    }
    var urlCollection = [];
    console.log(filteredModules);
    filteredModules.forEach(function(obj) {
        urlCollection.push(obj.slug);
    });
        
    return {
        "displayName": name, 
        "data": urlCollection,
        "deleteAfterRead": deleteAfterRead, 
    }
}