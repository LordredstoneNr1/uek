var options = {
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

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        console.log("%c Network ","background-color: yellow; color: black; border-radius: 5px;" ,"XMLHttpRequest to \'" + url + "\' finished with status " + xhr.status);
        callback(xhr.response);
    };
    xhr.send();
};

//Setting up data
function update(callback) {
    console.debug("UEK update cycle started");
    getJSON("https://universe-meeps.leagueoflegends.com/v1/" + options.universeOverride.toLowerCase().replace("-", "_") + "/explore2/index.json", function(data){
        UnpackedStory.storyModules = [];
        data.modules.forEach( function(obj) {
            if (obj.type === "story-preview") {
                UnpackedStory.storyModules.push( new UnpackedStory(obj));
            }
        });
        
        /*Above sets up the base modules we work with. 
        If more information are needed, add them to the constructor of UnpackedStory. 
        For now, keep it small, store only the necessary information.
        */
        
        //Clear for Debug purposes, do not ship with this :D
        //chrome.storage.sync.clear();
        
        //this NEEDS to be inside the JSON callback so it is guaranteed to have data.
        chrome.storage.sync.get(null, function(items) {
            console.debug(items);
            if (!items.options) {
                console.log("%c Startup ", "color: red; font-weight: bold;", "UEK: First Startup");
                StoryList.createReadingList("all", "delete", false);
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
                    chrome.storage.sync.set({"options": options});
                });
            } else {
                for (entry in items) {
                    if (entry.startsWith("list: ")) {
                        new StoryList(items[entry].data, [entry.substring(6), items[entry].afterRead, items[entry].suggest]);
                    } 
                };
                options = items.options;
            }
            callback(UnpackedStory.storyModules, StoryList.unpackedLists, options);
        });
    });
    
    console.debug("UEK update cycle complete");
};

class StoryList {
    
    constructor(list, metaData) {
        
        this.displayName = metaData[0];
        this.data = list.map(a => (UnpackedStory.storyModules.find(b => b["slug"] == a)));
        
        if (metaData.length > 1 && ["delete", "mark", "keep"].includes(metaData[1])) {
            this.afterRead = metaData[1];
        } else {
            this.afterRead = "keep";
        }
        
        if (metaData.length > 2) {
            this.suggest = metaData[2];
        } else {
            this.suggest = false;
        }
                
        StoryList.unpackedLists[this.displayName] = this;
        chrome.contextMenus.create({
            "id": "list: ".concat(this.displayName),
            "parentId": "listsRoot",
            "title": this.displayName,
            "targetUrlPatterns": ["*://universe.leagueoflegends.com/*/story/*"],
            "contexts": ["link"]
        }, function() {
            if (chrome.runtime.lastError) {
                console.debug("%c Expected ", "background: lime; color: black; border-radius: 5px;", "Error while creating context menu item " + name + ": ", chrome.runtime.lastError.message);
            }
        }); 
    }
    
    static createReadingList(tag, afterReadHandler, suggest) {
        var filteredModules = [];
        var name;
        console.log("%c Data ", "background: green; border-radius: 5px;", "Setting up list for tag: " + tag);
        if (tag==="all") {
            //Special Tag: All stories
            console.debug("Special Tag found: " + tag);
            name = "Reading List";
            filteredModules = UnpackedStory.storyModules;
        } else if (Object.values(champions_base).includes(tag)) {
            
            //Regions
            console.debug("Region found: " + tag);
            name = "Region: " + tag;
            filteredModules = filterByTag("regions", tag);
        } else if (Object.keys(champions_base).includes(tag)) {
            
            //Champions
            console.debug("Champion found: " + tag);
            name = "Champion: " + tag;
            filteredModules = filterByTag("champions", tag);
        } else if (StoryList.authorList.includes(tag)) {
            
            //Authors
            console.debug("Author found: " + tag);
            name = "Author: " + tag;
            filteredModules = filterByTag("authors", tag);
        } else {
            
            //???
            console.debug("Tag not found.");
            return null;
        }
        
        console.debug(filteredModules);
            
        new StoryList(filteredModules.map(a => a.slug), [name, afterReadHandler, suggest]).save();
    }
          
    static filterByTag(key, tag) {
       return UnpackedStory.storyModules.filter( function(obj)  {
            var found = false;
            obj.tags[key].forEach(function(givenTag) {
                if (tag === givenTag) {
                    found = true;
                } 
            });
            return found;
        }); 
    }
    
    add(url) {
        var unpackedStory = UnpackedStory.storyModules.find(function (story) {
            return story.slug === url.substring(49, url.length-1);
        });
        if (!this.data.includes(unpackedStory)) {
           this.data.push(unpackedStory);
        }
    }
    
    save() {
        const list = {};
        list["list: " + this.displayName] = {
            "data" : this.data.map(a => a.slug), 
            "afterRead": this.afterRead,
            "suggest": this.suggest
        }
        chrome.storage.sync.set(list);
        chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
            console.log("%c Data ", "background: green; border-radius: 5px;", "Saved Data. Total bytes used: ", bytesInUse);
        });
    }
    
}
StoryList.authorList = new Array();
StoryList.unpackedLists = new Object();

class UnpackedStory {
    
    constructor(obj) {
        this.url = obj['url'];
        this.title = obj['title'];
        this.words = obj['word-count'];
        this.slug = obj['story-slug'];
        this.timestamp = obj['release-date'];
        this.getTags(obj);
    }
    
    getTags(obj) {
        var tags = {"champions": [], "authors": [], "regions":[]};  
        
        //Override in case I don't like something
        if (override_tags[this.slug]) {
            tags.champions = override_tags[this.slug].champions.map(a => chrome.i18n.getMessage("champion_" + a));
            tags.regions = override_tags[this.slug].regions.map(a => chrome.i18n.getMessage("region_" + a));
            tags.authors = override_tags[this.slug].authors;
        } else {
            //regular tags created from the champions and subtitle of the story
            obj['featured-champions'].forEach(function(champion) {
                if (chrome.i18n.getMessage("champion_" + champion.slug) != champion.name) {
                    console.log("%c Author missing ", "background-color: red; border-radius: 5px;", champion.name);
                }
                tags.champions.push(chrome.i18n.getMessage("champion_" + champion.slug));
                if (!tags.regions.includes(chrome.i18n.getMessage("region_" + champions_base[champion.slug]))) {
                    // Plain text version instead of faction slug
                    tags.regions.push(chrome.i18n.getMessage("region_" + champions_base[champion.slug]));
                }
            });  
            
            const beginnings = chrome.i18n.getMessage("info_subtitle_by").split(";");
            if (obj.subtitle != null && beginnings.includes(obj.subtitle.substr(0, beginnings[0].length)) ) {
                
                var author = obj.subtitle.substring(beginnings[0].length);
                
                //Transform Ian St Martin into Ian St. Martin.
                if (author === "Ian St Martin") {
                    author = "Ian St. Martin";
                }
                
                /*  We also need to get rid of character U+2019 (Single Right Quotation Mark). 
                    This one is for you, John O'Bryan!
                */
                if (author.includes("\\u+2019")) {
                    author = author.replace("\\u+2019", "'");
                }
                
                // These are all edge cases we need to handle - I think?
                tags.authors.push(author);
            } else {
                //Lookup list in case the subtitle is not defined.
                if(authors_fallback[this.slug]) {
                    tags.authors = authors_fallback[this.slug];
                } else {
                    console.log("%c Translation missing ", "background-color: red; border-radius: 5px;", obj["story-slug"]);
                }
            }
            
            //Adding tags as defined in data.js (if present)
            if (add_tags[this.slug]) {
                
                if (add_tags[this.slug].champions) {
                    // Duplicate protection by transforming into a set and back
                    tags.champions = [...new Set(tags.champions.concat(add_tags[this.slug].champions.map(a => chrome.i18n.getMessage("champion_" + a))))];
                }
                if (add_tags[this.slug].regions) {
                    tags.regions = [...new Set(tags.regions.concat(add_tags[this.slug].regions.map(a => chrome.i18n.getMessage("region_" + a))))];
                }
                if (add_tags[this.slug].authors) {
                    tags.authors = [...new Set(tags.authors.concat(add_tags[this.slug].authors))];
                }
            }
            
            tags.authors.forEach(function(author){
                if (!StoryList.authorList.includes(author)) {
                    StoryList.authorList.push(author);
                }
            });
            
        }
        tags.authors.sort();
        tags.champions.sort();
        tags.regions.sort();
        this.tags = tags;
    }
}
UnpackedStory.storyModules = new Array();

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
                  if (response.id === "extract-image-response" && response.success == true) {
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
                    if (response.id === "extract-image-response" && response.success == true) {
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
});

chrome.commands.onCommand.addListener( function(command){
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
    if (request.id === "get-stories") {
        sendResponse({
            "id": "get-stories-response",
            "success": true,
            "stories": UnpackedStory.storyModules
        });
        console.log("%c Data ", "background: green; border-radius: 5px;", "Sending story data to ", sender.id);
    } else if (request.id === "query-stories") {
        update(function (modules, lists, options) {
            sendResponse({
                "id": "query-stories-response",
                "success": true,
                "stories": modules
            });
            console.log("%c Data ", "background: green; border-radius: 5px;", "Sender ", sender.id, " requested refreshing the story modules.");
            console.log("%c Data ", "background: green; border-radius: 5px;", "Story Modules: ", modules);
            console.log("%c Data ", "background: green; border-radius: 5px;", "Lists: ", lists);
        });
    } else if (request.id === "get-lists") {
        sendResponse({
            "id": "get-lists-response",
            "success": true,
            "lists": StoryList.unpackedLists
        });
        console.log("%c Data ", "background: green; border-radius: 5px;", "Sending list data to ", sender.id);
    } else if (request.id === "query-lists") {
        update(function (modules, lists, options) {
            sendResponse({
                "id": "query-lists-response",
                "success": true,
                "lists": lists
            });
            console.log("%c Data ", "background: green; border-radius: 5px;", "Sender ", sender.id, " requested refreshing the lists.");
            console.log("%c Data ", "background: green; border-radius: 5px;", "Story Modules: ", modules);
            console.log("%c Data ", "background: green; border-radius: 5px;", "Lists: ", lists);
        });
    } else if (request.id === "update-options") {
        options = request.data;
        update(function (modules, lists, options) {
            chrome.contextMenus.update("root", {visible: options.contextMenus});
        });
    }
    return true;
});


//Actual startup / initialization
update(function (modules, lists, options) {
    console.log("%c Startup ", "color: red; font-weight: bold;", "Initializing UEK");
    console.log("%c Data ", "background: green; border-radius: 5px;", "Story Modules: ", modules);
    console.log("%c Data ", "background: green; border-radius: 5px;", "Lists: ", lists);
    console.log("%c Data ", "background: green; border-radius: 5px;", "Storage: ", options);
});
