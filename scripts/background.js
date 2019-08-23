var options = {};
class StoryList {
    
    constructor(name, list) {
        var collection = [];
        list.data.forEach(function (slug) {
            collection.push(StoryList.findBinSearch(UnpackedStory.storyModules, "slug", slug));
        });
        
        this.displayName = name;
        this.data = collection;
        if (Object.keys(list).includes("bool")) {
            this.deleteAfterRead = list.bool;
        } else {
            this.deleteAfterRead = false;
        }
        
        StoryList.unpackedLists[this.displayName] = this;
        
        chrome.contextMenus.create({
            "id": name,
            "parentId": "listsRoot",
            "title": name,
            "targetUrlPatterns": ["*://universe.leagueoflegends.com/*/story/*"],
            "contexts": ["link"]
        }); 
    }
    
    static createReadingList(tag, deleteAfterRead) {
        var filteredModules = [];
        var name;
        console.log("Setting up list for tag: " + tag);
        if (tag==="all") {
            //Special Tag: All stories
            console.log("Special Tag found: " + tag);
            name = "Reading List";
            filteredModules = UnpackedStory.storyModules;
        } else if (Object.values(regions).includes(tag)) {
            
            //Regions
            console.log("Region found: " + tag);
            name = "Region: " + tag;
            filteredModules = filterByTag("regions", tag);
        } else if (Object.keys(champions).includes(tag)) {
            
            //Champions
            console.log("Champion found: " + tag);
            name = "Champion: " + tag;
            filteredModules = filterByTag("champions", tag);
        } else if (StoryList.authorList.includes(tag)) {
            
            //Authors
            console.log("Author found: " + tag);
            name = "Author: " + tag;
            filteredModules = filterByTag("authors", tag);
        } else {
            
            //???
            console.log("Tag not found.");
            return null;
        }
        var urlCollection = [];
        console.log(filteredModules);
        filteredModules.forEach(function(obj) {
            urlCollection.push(obj.slug);
        });
            
        var list =  {
            "data": urlCollection,
            "bool": deleteAfterRead, 
        }
        new StoryList(name, list).save();
    }
    
    static findBinSearch(list, key, item) {
        function findBinRec(start, end) {
            var middle = Math.floor((start + end) / 2);
            var result = list[middle][key].localeCompare(item);
            //console.log(start, middle, end);
            //console.log(list[middle][key], item, result);
            if (result == 0) {
                return list[middle];
            } else if (result > 0) {
                return findBinRec(start, middle-1);
            } else {
                return findBinRec(middle+1, end);
            }
        };
        return findBinRec(0, list.length);
    }
    
    static hasUnpacked(list) {
        return Object.keys(StoryList.unpackedLists).includes(list);
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
        var packedList = {};
        var packedData = [];
        this.data.forEach(function(story) {
            packedData.push(story.slug);
        });
        // only save this value if true, since it defaults to false if unspecified. -- Actually I don't care, that extra storage space shouldn't make the difference.
        packedList["list: " + this.displayName] = {"data" : packedData, "bool": this.deleteAfterRead};

        chrome.storage.sync.set(packedList);
        chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
            console.log("Saved Data. Total bytes used: ", bytesInUse);
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
    
    
    //Usage: StoryArray.sort((a, b) => a.compareTo(b, key));
    compareTo(other, key) {
        switch (key) {
            // Use title instead of slug because slugs are x-color-story: Unexpected results while sorting
            case "title": 
                return this.title.localeCompare(other.title);
                break;
                
            case "words":
                //Default from high to low here
                return other.words - this.words;
                break;
                
            case "release":
                return other.timestamp - this.timestamp;
                break;
            
            case "authors":
                var maxIndex = Math.min(this.authors.length, other.authors.length);
                for (i = 0; i < maxIndex; i++) {
                    if (this.authors[i].localeCompare(other.authors[i]) != 0) {
                        return this.authors[i].localeCompare(other.authors[i]);
                        break;
                    }
                }
                return this.authors.length - other.authors.length;
                break;
            
            case "champions":
                var maxIndex = Math.min(this.champions.length, other.champions.length);
                for (i = 0; i < maxIndex; i++) {
                    if (this.champions[i].localeCompare(other.champions[i]) != 0) {
                        return this.champions[i].localeCompare(other.champions[i]);
                        break;
                    }
                }
                return this.champions.length - other.champions.length;
                break;
            
            case "regions":
                var maxIndex = Math.min(this.regions.length, other.regions.length);
                for (i = 0; i < maxIndex; i++) {
                    if (this.regions[i].localeCompare(other.regions[i]) != 0) {
                        return this.regions[i].localeCompare(other.regions[i]);
                        break;
                    }
                }
                return this.regions.length - other.regions.length;
                break;
                
            default: 
                return 0;
                break;
        }
    }
    
    getTags(obj) {
        var tags = {"champions": [], "authors": [], "regions":[]};  
        
        //Override in case I don't like something
        if (override_tags[this.title]) {
            tags = override_tags[this.title];
        } else {
            //regular tags created from the champions and subtitle of the story
            obj['featured-champions'].forEach(function(champion) {
                tags.champions.push(champion.name);
                if (!tags.regions.includes(champions[champion.name])) {
                    // Plain text version instead of faction slug
                    tags.regions.push(champions[champion.name]);
                }
            });  
            if (obj.subtitle != null) {
                /* Subtitle is "by author", so we need to cut the first three characters.
                    We also need to get rid of character U+2019 (Single Right Quotation Mark). 
                    This one is for you, John O'Bryan!
                */
                tags.authors.push(obj.subtitle.substring(3).replace("\u2019","'"));
            } else {
                //Lookup list in case the subtitle is not defined.
                authors_fallback[this.title].forEach( function (author) {
                    tags.authors.push(author);
                });
            }
            
            //Adding tags as defined in data.js (if present)
            if (add_tags[this.title]) {
                
                if (add_tags[this.title].champions) {
                    add_tags[this.title].champions.forEach( function (newTag) {
                        tags.champions.push(newTag);
                    });
                }
                if (add_tags[this.title].regions) {
                    add_tags[this.title].regions.forEach( function (newTag) {
                        tags.regions.push(newTag);
                    });
                }
                if (add_tags[this.title].authors) {
                    add_tags[this.title].authors.forEach( function (newTag) {
                        tags.authors.push(newTag);
                    });
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
        switch (info.menuItemId)  {
            case "root":
                chrome.tabs.create({
                    "url": "https://universe.leagueoflegends.com/en_US/",
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
                    //Replace URL with post
                    "url": "https://boards.na.leagueoflegends.com/en/c/story-art",
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
                list = new StoryList("New List", {"data":[]});
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
        if (StoryList.hasUnpacked(info.menuItemId)) {
           StoryList.unpackedLists[info.menuItemId].add(info.linkUrl);
        }
    });
});

chrome.commands.onCommand.addListener( function(command){
    chrome.tabs.query(
        {"active": true, "currentWindow": true}, 
        function(currentTab) {
            chrome.tabs.sendMessage(currentTab[0].id, {id: "toggle-panel"});
        }
    );
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.id === "get-stories") {
        sendResponse({
            id: "get-stories-response",
            success: true,
            data: UnpackedStory.storyModules
        });
        console.log("Sender ", sender, " requested story modules, sending data.");
    }
    return true;
});

//Setting up data
getJSON('https://universe-meeps.leagueoflegends.com/v1/en_us/explore2/index.json', function(status, data){
    data.modules.forEach( function(obj) {
        if (obj.type === "story-preview") {
            UnpackedStory.storyModules.push( new UnpackedStory(obj));
        }
    });
    console.log("Story Modules: ", UnpackedStory.storyModules);
    /*Above sets up the base modules we work with. 
    If more information are needed, add them to the constructor of UnpackedStory. 
    For now, keep it small, store only the necessary information.
    */
    
    //Clear for Debug purposes, do not ship with this :D
    //chrome.storage.sync.clear();
    
    //this NEEDS to be inside the JSON callback so it is guaranteed to have data.
    chrome.storage.sync.get(null, function(items) {
        //Setting up reading list after first startup
        if (!Object.keys(items).includes("options")) {
            StoryList.createReadingList("all", true);
            chrome.commands.getAll(function (commands) {
                options.shortcut = commands[1].shortcut;
            });
            chrome.storage.sync.set({"options": options});
        } else {
            console.log("Started UEK, reading data: " + Object.keys(items).length + " items.");
            for (entry in items) {
                if (entry.startsWith("list: ")) {
                    new StoryList(entry.substring(6), items[entry]);
                } else if (entry == "options") {
                    options = entry[options];
                }
                console.log(entry);
            };
        }
        console.log("Found", Object.keys(StoryList.unpackedLists).length, "lists in synchronized storage.");
        console.log(StoryList.unpackedLists);
    });
});

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        console.log("XMLHttpRequest to \'" + url + "\' finished with status " + xhr.status);
        callback(xhr.status, xhr.response);
    };
    xhr.send();
};
