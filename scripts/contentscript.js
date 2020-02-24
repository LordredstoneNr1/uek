console.debug("Content script loaded");

const universeLanguages = ["cs-CZ", "de-DE", "el-GR", "en-AU", "en-GB", "en-PH", "en-PL", "en-SG", "en-US", 
    "es-AR", "es-ES", "es-MX", "fr-FR", "hu-HU", "id-ID", "it-IT", "ja-JP", "ko-KR", "ms-MY", 
    "pl-PL", "pt-BR", "ro-RO", "ru-RU", "th-TH", "tr-TR", "vn-VN", "zh_cn", "zh_tw"];
    
var options;    
var open = false;
var championList, authorList, regionList;
var height, width, posLeft, posTop;
var unpackedStories, unpackedLists;
var stories_sortKey = "title";
var stories_filteredSelection = [];
var lists_currentList;
var lists_sortKey = "custom";
var lists_selectedStories = new Set();

//some functions we'll need. These need to be acessible outside of main

function request(url) {
    console.debug("Requested " + url);
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        }
        xhr.onerror = function() {
            reject(xhr.statusText);
        }
        xhr.send();
    });
}

function changeVisibility() {
    
    open = !open;
    //update context menu and riotbar entry
    if (!open) {
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: -" + width + "px; top: " + options.posTop + "px; height: " + height + "px;");
    } else {
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: " + options.posLeft + "px; top: " + options.posTop + "px; height: " + height + "px;");
    }
    
    document.getElementById("uek-toggle-open").classList.toggle("hidden");
    document.getElementById("uek-toggle-close").classList.toggle("hidden");
    console.debug((open?"Showing":"Hiding") + " UEK Extension page");
};

// Execution chain starts here: Start main logic after Riot set up the window. Our data calls do not need the DOM, so we can do that while Riot works.
function startup () {
    // Promise wrapping seems strange, maybe put that somewhere else?
    new Promise((resolve, reject) => chrome.storage.sync.get(null, function (items) {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
        } else {
            resolve(items);
        }
    })).then(
        // Setting up options
        function (items) {
            if (items.options) {
                options = items.options;
                console.log("%c Data ", "background: green; border-radius: 5px;", "Loaded options");
            }
            console.debug(options);
            if (items.read) {
                UnpackedStory.readStories = new Set(items.read);
                console.log("%c Data ", "background: green; border-radius: 5px;", "Loaded your read stories");
            }
            console.debug(UnpackedStory.readStories);
            unpackedLists = items;
            return request("https://universe-meeps.leagueoflegends.com/v1/" + options.universeOverride.toLowerCase().replace("-", "_") + "/explore2/index.json");
        }, 
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to load synchronized storage.", errorMsg);
        }
    ).then(
        // Setting up stories
        function (requestData) {
            championList = [], authorList = [], regionList = [];
            UnpackedStory.storyModules = new Set();
            
            JSON.parse(requestData).modules.forEach(function (module) {
                if (module.type === "story-preview") {
                    const story = new UnpackedStory(module);
                    championList.push(story.tags.champions);
                    authorList.push(story.tags.authors);
                    regionList.push(story.tags.regions);
                }
            });
            
            //remove duplicates & sort
            championList = Array.from(new Set(championList.flat())).sort();
            
            //removes duplicates & sort by number of times they appear (=> number of stories)
            regionList = regionList.flat().reduce(function (cumultativeRegions, newRegion) {
                const index = cumultativeRegions.findIndex(a => a.name === newRegion);
                if (index != -1) {
                    cumultativeRegions[index].nr++;
                } else if (newRegion != "") {
                    cumultativeRegions.push({"name": newRegion, "nr":1});
                }
                return cumultativeRegions;
            }, []).sort((a,b) => b.nr - a.nr).map(a => a.name);
            
            authorList = authorList.flat().reduce(function (cumultativeAuthors, newAuthor) {
                const index = cumultativeAuthors.findIndex(a => a.name === newAuthor);
                if (index != -1) {
                    cumultativeAuthors[index].nr++;
                } else if (newAuthor != "") {
                    cumultativeAuthors.push({"name": newAuthor, "nr":1});
                }
                return cumultativeAuthors;
            }, []).sort(function (a,b) { 
                if (a.nr !== b.nr) {
                    return b.nr-a.nr; // High to low with stories
                } else {
                    return a.name.localeCompare(b.name); // a to z with the names if same stories
                }
            });
            
            unpackedStories = UnpackedStory.storyModules; 
            console.log("%c Data ", "background: green; border-radius: 5px;", "Story data parsed successfully");
            console.debug(unpackedStories);
            
            return unpackedLists;
        }, 
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to fetch story modules from Universe.", errorMsg);
        }
    ).then(
        // Handle list data
        function (items) {
            for (entry in items) {
                if (entry.startsWith("list: ")) {
                    new StoryList(items[entry].data, [entry.substring(6), items[entry].deleteAfterRead, items[entry].suggest]);
                }                    
            }
            unpackedLists = StoryList.unpackedLists; 
            console.log("%c Data ", "background: green; border-radius: 5px;", "List data parsed successfully");          
            console.debug(unpackedLists);
            return request(chrome.runtime.getURL("html/inject.html"));
        }, 
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to parse list input.", errorMsg);
        }
    ).then(
        // Preparation / waiting
        function (htmlString) {
            // if all optionals exist we can continue directly
            // if (document.getElementById("riotbar-navmenu")?.lastElementChild?.firstElementChild) {
                if (document.getElementById("riotbar-navmenu") 
                    && document.getElementById("riotbar-navmenu").lastElementChild 
                    && document.getElementById("riotbar-navmenu").lastElementChild.firstElementChild) {
                        chrome.runtime.sendMessage("Case 1: Init");
                 return htmlString;
            } else {
                // Not ready yet, set up observer and wait.
                console.log("%c Startup ", "color: red; font-weight: bold;", "Riot is still building the website, I'll just sit here waiting...");
                new MutationObserver(function(mutationsList, observer) {
                    // Checks if there was a change with target id riotbar-navmenu and a node with class name riotbar-navmenu-dropdown has been added. Then we can continue executing.
                    if (mutationsList.find(a => a.target.id === "riotbar-navmenu" && Array.from(a.addedNodes).find(b => b.className === "riotbar-navmenu-dropdown"))) {
                        console.log(mutationsList);
                        observer.disconnect();
                        chrome.runtime.sendMessage("Case 2: Waited");
                        return htmlString;
                    }
                }).observe(document.body, {childList: true, subtree: true});
            }
        }, 
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: Unable to fetch injection file.", errorMsg);
        }
    ).then(
        // Ready for main call
        main,  
        function (errorMsg) {
            console.log("%c Startup ", "color: red; font-weight: bold;", "Error while starting UEK: ", errorMsg);
        }
    );
}

function main(inject) {

    console.log("%c Startup ", "color: red; font-weight: bold;", "Started main");
    
    // Some function definitions, I'd rather have them here if possible. only changeVisibility and request need to be outside.
    
    function show(key) {
        document.getElementsByClassName("activeTab")[0].classList.remove("activeTab");
        const blocklist = document.getElementById("uek-main-body").children;
        for (i = 0; i < blocklist.length; i++) {
           blocklist[i].classList.add("hidden");
        }
        //remove everything and add it back to the things we need.
        document.getElementById("uek-main-link-"+key).classList.add("activeTab");
        document.getElementById("uek-main-block-"+key).classList.remove("hidden");
    }
        
    async function generateStoryHTML() {
        const target = document.getElementById("uek-stories-table-body");
        target.innerHTML = "";
        stories_filteredSelection = Array.from(unpackedStories);
        //Apply filters and sort the list;
        if (document.getElementById("uek-filter-title").checked) {
            const title = document.getElementById("uek-filter-title-text").value;
            stories_filteredSelection = stories_filteredSelection.filter(a => new RegExp(title, "i").test(a.title));
        }
        if (document.getElementById("uek-filter-champions").checked) {
            stories_filteredSelection = stories_filteredSelection.filter(function (story) {
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
                stories_filteredSelection = stories_filteredSelection.filter(a => a.tags.regions.includes(region));
            }
        }
        if (document.getElementById("uek-filter-authors").checked) {
            const author = document.getElementById("uek-filter-authors-dropdown").value;
            if (author != "") {
                stories_filteredSelection = stories_filteredSelection.filter(a => a.tags.authors.includes(author));
            }
        }
        if (document.getElementById("uek-filter-type").checked) {
            const universe = document.getElementById("uek-filter-type-universe-dropdown").value;
            const type = document.getElementById("uek-filter-type-type-dropdown").value;
            if (universe === "main-universe") {
                stories_filteredSelection = stories_filteredSelection.filter(a=> a.tags.regions.length > 0);
            } else if (universe === "alternate-universes")  {
                stories_filteredSelection = stories_filteredSelection.filter(a=> a.tags.regions.length == 0);
            }
            
            const excludes = ["nami-first-steps", "rengar-prey"];
            
            if (type === "color-stories") {
                stories_filteredSelection = stories_filteredSelection.filter(a=> a.slug.includes("color") || excludes.includes(a.slug));
            } else if (type === "long-stories") {
                stories_filteredSelection = stories_filteredSelection.filter(a=> !(a.slug.includes("color") || excludes.includes(a.slug)));
            }
        }
        if (document.getElementById("uek-filter-words").checked) {
            const min = document.getElementById("uek-filter-words-min").value;
            const max = document.getElementById("uek-filter-words-max").value;
            if (min !== "") {stories_filteredSelection = stories_filteredSelection.filter(a=> a.words >= min);}
            if (max !== "") {stories_filteredSelection = stories_filteredSelection.filter(a=> a.words <= max);}
        }
        if (document.getElementById("uek-filter-date").checked) {
            const min = document.getElementById("uek-filter-date-min").value;
            const max = document.getElementById("uek-filter-date-max").value;
            if (min !== "") {stories_filteredSelection = stories_filteredSelection.filter(a => a.timestamp >= min);}
            if (max !== "") {stories_filteredSelection = stories_filteredSelection.filter(a => a.timestamp <= max);}
        }
        if (stories_sortKey.endsWith("reverse")) {
            unpackedStories.forEach(function (story) {
                story.tags.champions.sort().reverse();
                story.tags.regions.sort().reverse();
                story.tags.authors.sort().reverse();
            });
            // b.compare to a because this needs to be reversed.
            stories_filteredSelection.sort((a,b) => b.compareToWithKey(a, stories_sortKey.substring(0, stories_sortKey.indexOf("-reverse"))));
        } else {
            unpackedStories.forEach(function (story) {
                story.tags.champions.sort();
                story.tags.regions.sort();
                story.tags.authors.sort();
            });
            stories_filteredSelection.sort((a,b) => a.compareToWithKey(b, stories_sortKey));
        }
        console.debug("Displaying current selection, sorted by: ", stories_sortKey, stories_filteredSelection);
        
        stories_filteredSelection.forEach( function (story, i) {
            const row = document.createElement("tr");
            row.innerHTML = [
                "<td>" + (i+1),
                "<a href=\"" + story.url + "\">" + story.title + "</a>",
                story.words,
                story.tags.champions.join(", "),
                story.tags.regions.join(", "),
                story.tags.authors.join(", "), 
                new Date(story.timestamp).toLocaleDateString() + "</td>"
            ].join("</td>\n<td>");
            target.appendChild(row);
        });
    }
    
    /* // Lists D&D
    function dragStart(ev) {
        this.id = "uek-lists-dragelement";
        
        ev.dataTransfer.setData("text/plain", "Drag text");
    }
        
    function dragEnd(ev) {
        this.id = "";
        while (document.getElementById("uek-lists-previewelement") != null) {
            document.getElementById("uek-lists-previewelement").remove();
        }
    }
     
    function dragEnter(ev) {
        if (isValid) {
            ev.stopPropagation();
            const placeholder = document.getElementById("uek-lists-previewelement");
            if (placeholder == null) {
                placeholder = document.createElement("tr");
                placeholder.innerHTML = "<td></td>";
                placeholder.id = "uek-lists-previewelement";
            }
            this.parentElement.insertBefore(placeholder, this.nextElementSibling);
        } else {
          document.getElementById("uek-lists-previewelement").remove();
        }
    }
     
    function dragOver(ev) {
        if (isValid) {
            ev.preventDefault();
        }
    } 
     
    function dragLeave(ev) {
        ev.stopPropagation();
        console.log(this);
    }
    
    function drop(ev) {
         ev.preventDefault();
    }
    */
   
    async function generateListHTML() {
        if (lists_currentList != undefined) {
            const name = lists_currentList.displayName;
            // List stuff
        
            document.getElementById("uek-lists-title").innerHTML = name;
            document.getElementById("uek-lists-name").value = name;
            
            // story table
            const target = document.getElementById("uek-lists-table-body");
            target.innerHTML = "";
            
            const stories = lists_currentList.data;
            
            if (lists_sortKey.endsWith("reverse")) {
                stories.forEach(function (story) {
                    story.tags.champions.sort().reverse();
                    story.tags.regions.sort().reverse();
                    story.tags.authors.sort().reverse();
                });
                // b.compareTo(a) because it must be reversed here
                stories.sort((a,b) => b.compareToWithKey(a, lists_sortKey.substring(0, lists_sortKey.indexOf("-reverse"))));
            } else {
                stories.forEach(function (story) {
                    story.tags.champions.sort();
                    story.tags.regions.sort();
                    story.tags.authors.sort();
                });
                stories.sort((a,b) => a.compareToWithKey(b, lists_sortKey));
            }
            
            for (i = 0; i < stories.length; i++) {
                const row = document.createElement("tr");
                const story = stories[i];
                row.innerHTML = [
                    "<td>" + "<input type=\"checkbox\" id=\"uek-select-story-" + i + "\">",
                    story.title,
                    Math.ceil(story.words / 260) + " min.",
                    story.tags.champions.join(", "),
                    story.tags.regions.join(", ") + "</td>"
                ].join("</td>\n<td>");
                target.appendChild(row);
                document.getElementById("uek-select-story-" + i).onchange = function () {
                    if (this.checked) {
                        lists_selectedStories.add(story);
                    } else {
                        lists_selectedStories.delete(story);
                    }
                    console.log(lists_selectedStories);
                }
                row.onclick = function () {
                    const checkbox = this.getElementsByTagName("input")[0];
                    checkbox.checked = !checkbox.checked;
                }
            }
        } else {
            console.log("Trying to start 'generateListHTML' while 'lists_currentList' is undefined", unpackedLists);
        }
    }
    
    function calculateHeight() {
        const heightConst = document.getElementById("uek-options-heightconst").value;
        const heightFactor = document.getElementById("uek-options-heightfactor").value;
        document.getElementById("uek-options-window-text").classList.remove("hidden");
        document.getElementById("uek-options-height").value = Math.round(heightFactor / 100 * window.innerHeight + heightConst * 1) + "px";
    }
    
    function calculateWidth() {
        const widthConst = document.getElementById("uek-options-widthconst").value;
        const widthFactor = document.getElementById("uek-options-widthfactor").value;
        document.getElementById("uek-options-window-text").classList.remove("hidden");
        document.getElementById("uek-options-width").value = Math.round((widthFactor / 100 * window.innerWidth) + widthConst * 1) + "px";
    }
    
    function calculatePosition() {
        const posLeft = document.getElementById("uek-options-left").value;
        const posTop = document.getElementById("uek-options-top").value;
        document.getElementById("uek-options-window-text").classList.remove("hidden");
        document.getElementById("uek-options-position").value = " " + posLeft + " / " + posTop;
    }
    
    function save(callback) {
        chrome.storage.sync.get("options", function (items) {
            options.heightFactor = Number(document.getElementById("uek-options-heightfactor").value);
            options.heightConst = Number(document.getElementById("uek-options-heightconst").value);
            options.widthFactor = Number(document.getElementById("uek-options-widthfactor").value);
            options.widthConst = Number(document.getElementById("uek-options-widthconst").value);
            options.posLeft = Number(document.getElementById("uek-options-left").value);
            options.posTop = Number(document.getElementById("uek-options-top").value);
            options.universeOverride = document.getElementById("uek-options-locale").value;
            options.changelog = document.getElementById("uek-options-changelog").checked;
                            
            chrome.storage.sync.set({"options": options}, callback);
        });
    }
    
    // Injection and translation start
    const injectDoc = new DOMParser().parseFromString(inject, "text/html");
    
    const parent = document.getElementById("riotbar-navbar");
    const navNode = injectDoc.getElementById("uek-link-element");
    navNode.onclick = function() {changeVisibility();};
    parent.insertBefore(navNode, parent.lastElementChild);
    
    
    const mainNode = injectDoc.getElementById("uek-base-wrapper");
    document.body.appendChild(mainNode);
    
    translate(); //async!
    
    { // Window
        width = options.widthConst + (options.widthFactor / 100 * window.innerWidth);
        if (width < 650) {width = 650; }
        height =  options.heightConst + (options.heightFactor / 100 * window.innerHeight);
        if (height < 750) {height = 750; }
        document.getElementById("uek-base-wrapper").setAttribute("style", "left: -"+ width +"px; top: " + options.posTop + "px; height: " + height + "px;");
        document.getElementById("uek-main-page").setAttribute("style", "width: "+ width +"px; height: " + height + "px;");
        document.getElementById("uek-main-body").setAttribute("style", "height: " + (height - 40 - 6) + "px;");
        console.debug("Window setup complete");
    }
    
    { // Header and link
        document.getElementById("uek-toggle-link").onclick = function() { changeVisibility();};
        document.getElementById("uek-toggle-open").src = chrome.runtime.getURL("images/arrow-right.png");
        document.getElementById("uek-toggle-close").src = chrome.runtime.getURL("images/arrow-left.png");
        
        document.getElementById("uek-main-title").href = chrome.runtime.getManifest().homepage_url;
        
        document.getElementById("uek-main-link-stories").onclick = function() {show("stories");};
        document.getElementById("uek-main-link-lists").onclick = function() {show("lists");};
        document.getElementById("uek-main-link-options").onclick = function() {show("options");};
        document.getElementById("uek-main-link-about").onclick = function() {show("about");};
        console.debug("Header setup complete");
    }
   
    { // Story tab
        document.getElementById("uek-stories-table-body").setAttribute("style", "height: " + 
        (document.getElementById("uek-main-block-stories").getBoundingClientRect().height 
            - document.getElementById("uek-stories-filter").getBoundingClientRect().height - 20 - 32) + "px;");
                  
        // Form stuff below
        { // Changing values activates the filter
            document.getElementById("uek-filter-title-text").oninput = function () {
                document.getElementById("uek-filter-title").checked = (document.getElementById("uek-filter-title-text").value != "");
            };
            document.getElementById("uek-filter-champions-text").oninput = function () {
                document.getElementById("uek-filter-champions").checked = (document.getElementById("uek-filter-champions-text").value != "");
            };
            document.getElementById("uek-filter-regions-dropdown").onchange = function () {
                document.getElementById("uek-filter-regions").checked = (document.getElementById("uek-filter-regions-dropdown").value != "");
            };
            document.getElementById("uek-filter-authors-dropdown").onchange = function () {
                document.getElementById("uek-filter-authors").checked = (document.getElementById("uek-filter-authors-dropdown").value != "");
            };
            document.getElementById("uek-filter-type-universe-dropdown").onchange = function () {
                document.getElementById("uek-filter-type").checked = (document.getElementById("uek-filter-type-universe-dropdown").value != "all");
            };
            document.getElementById("uek-filter-type-type-dropdown").onchange = function () {
                document.getElementById("uek-filter-type").checked = (document.getElementById("uek-filter-type-type-dropdown").value != "all");
            };
            document.getElementById("uek-filter-words-min").oninput = function () {
                document.getElementById("uek-filter-words").checked = true;
            };
            document.getElementById("uek-filter-words-max").oninput = function () {
                document.getElementById("uek-filter-words").checked = true;
            };
            document.getElementById("uek-filter-date-min").oninput = function () {
                document.getElementById("uek-filter-date").checked = true;
            };
            document.getElementById("uek-filter-date-max").oninput = function () {
                document.getElementById("uek-filter-date").checked = true;
            };
        }
        
        document.getElementById("uek-stories-filter").onkeyup = function (ev) {
            if (ev.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }
             
            if (ev.key === "Enter") {
                generateStoryHTML();
            }
            
            ev.preventDefault();
        }
        
        document.getElementById("uek-filter-apply").onclick = function() {
            generateStoryHTML();
        };
        
        document.getElementById("uek-filter-save").onclick = function() {
            const filters = ""; // fill later
            const name = new StoryList(stories_filteredSelection.map(a => a.slug), ["New List", false, false, filters]).displayName;
            // need to double-check name because it might not be the original (duplicates)
            lists_currentList = unpackedLists[name];
            const parent = document.getElementById("uek-lists-selection");
            const element = document.createElement("option");
            element.innerHTML = name;
            element.value = name;
            parent.appendChild(element);
            parent.value = name;
            generateListHTML();
            show("lists");
        };
    
        //No need to set onclick for reset because that will reset the form by default
        
        //Same, resetting is default, but we also need to ask the background script to reload the stories
        document.getElementById("uek-filter-reload").onclick = function() {
            stories_sortKey = "title";
            request("https://universe-meeps.leagueoflegends.com/v1/" + options.universeOverride.toLowerCase().replace("-", "_") + "/explore2/index.json").then(
                function(requestData) {
                    championList = [], authorList = [], regionList = [];
                    UnpackedStory.storyModules = new Array();
                    
                    JSON.parse(requestData).modules.forEach(function (module) {
                        if (module.type === "story-preview") {
                            const story = new UnpackedStory(module);
                            championList.push(story.tags.champions);
                            authorList.push(story.tags.authors);
                            regionList.push(story.tags.regions);
                        }
                    });
                    
                    //remove duplicates & sort
                    championList = [...new Set(championList.flat())].sort();
                    
                    //removes duplicates & sort by number of times they appear (=> number of stories)
                    regionList = regionList.flat().reduce(function (cumultativeRegions, newRegion) {
                        const index = cumultativeRegions.findIndex(a => a.name === newRegion);
                        if (index === -1) {
                            cumultativeRegions.push({"name": newRegion, "nr":1});
                        } else {
                            cumultativeRegions[index].nr++;
                        }
                        return cumultativeRegions;
                    }, []).sort((a,b) => b.nr - a.nr).map(a => a.name);
                    
                    authorList = authorList.flat().reduce(function (cumultativeAuthors, newAuthor) {
                        const index = cumultativeAuthors.findIndex(a => a.name === newAuthor);
                        if (index === -1) {
                            cumultativeAuthors.push({"name": newAuthor, "nr":1});
                        } else {
                            cumultativeAuthors[index].nr++;
                        }
                        return cumultativeAuthors;
                    }, []).sort(function (a,b) { 
                        if (a.nr !== b.nr) {
                            return b.nr-a.nr; // High to low with stories
                        } else {
                            return a.name.localeCompare(b.name); // a to z with the names if same stories
                        }
                    });
                    unpackedStories = UnpackedStory.storyModules; 
                    console.log("%c Data ", "background: green; border-radius: 5px;", "Story data parsed successfully");
                    console.debug(unpackedStories);
                },
                function (errorMsg) {
                    console.log("%c Startup ", "color: red; font-weight: bold;", "Error while restarting UEK: Unable to fetch story modules from Universe.", errorMsg);
                }).then(generateStoryHTML);
        };
        
        // Add to dropdown lists
        regionList.forEach(function (region) {
            const element = document.createElement("option");
            element.value = region;
            element.innerHTML = region;
            document.getElementById("uek-filter-regions-dropdown").appendChild(element);
        });
        
        authorList.forEach(function (author) {
            const element = document.createElement("option");
            element.value = author.name;
            element.innerHTML = author.name + " (" + author.nr + ")";
            document.getElementById("uek-filter-authors-dropdown").appendChild(element);
        });
        
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
        console.debug("Story setup complete");
        
    }
            
    { // Lists tab
        document.getElementById("uek-lists-table-body").setAttribute("style", "height: " + 
        (document.getElementById("uek-main-block-lists").getBoundingClientRect().height 
            - document.getElementById("uek-lists-window").getBoundingClientRect().height - 20 - 32) + "px;");
    
		// Layout fix
		document.getElementById("uek-lists-thumbnail").onload = function () {
			document.getElementById("uek-main-block-lists").classList.add("half-hidden");
			document.getElementById("uek-main-block-lists").classList.remove("hidden");
			document.getElementById("uek-lists-table-body").setAttribute("style", "height: " + 
            (document.getElementById("uek-main-block-lists").getBoundingClientRect().height 
                - document.getElementById("uek-lists-window").getBoundingClientRect().height - 20 - 32) + "px;");
			document.getElementById("uek-main-block-lists").classList.add("hidden");
            document.getElementById("uek-main-block-lists").classList.remove("half-hidden");
		}
		
        // This is to handle cached images where the size is not correct in the onload event.
		if (document.getElementById("uek-lists-thumbnail").complete) {
			document.getElementById("uek-main-block-lists").classList.add("half-hidden");
			document.getElementById("uek-main-block-lists").classList.remove("hidden");
			document.getElementById("uek-lists-table-body").setAttribute("style", "height: " + 
            (document.getElementById("uek-main-block-lists").getBoundingClientRect().height 
                - document.getElementById("uek-lists-window").getBoundingClientRect().height - 20 - 32) + "px;");
			document.getElementById("uek-main-block-lists").classList.add("hidden");
			document.getElementById("uek-main-block-lists").classList.remove("half-hidden");
		}
        
        const parent = document.getElementById("uek-lists-selection");
        parent.innerHTML = "";
        Object.keys(unpackedLists).forEach( function (name) {
            const element = document.createElement("option");
            element.innerHTML = name;
            element.value = name;
            parent.appendChild(element);
            if (lists_currentList == undefined) {
                lists_currentList = unpackedLists[name];
            }
        });
        
        document.getElementById("uek-lists-name").onchange = function () {
            if (this.value != lists_currentList.displayName) {
                const name = StoryList.checkName(this.value);
                Array.from(document.getElementById("uek-lists-selection").children).find(a => a.value = lists_currentList.displayName).innerHTML = name;
                lists_currentList.displayName = name;
                document.getElementById("uek-lists-title").innerHTML = name;
            }
        }
        
		document.getElementById("uek-lists-export").onclick = function () {
            const exportData = JSON.stringify(lists_currentList.pack());
			const url = window.URL.createObjectURL(new Blob([exportData], {type: "application/json"}));
			const link = document.createElement('a');
			link.href = url;
			link.download = document.getElementById("uek-lists-selection").value;
			link.classList.add("hidden");
			document.getElementById("uek-lists-overview").appendChild(link);
			link.click();
			setTimeout(function () {
			  window.URL.revokeObjectURL(url);
			  document.getElementById("uek-lists-overview").removeChild(link);
			}, 0);
		}
		
		document.getElementById("uek-lists-import").onclick = function (ev) {
			const label = this.getElementsByTagName("label")[0];
			if (ev.srcElement != label) {
				label.click();
			}
		}
		
		document.getElementById("uek-lists-import-file").onchange = function () {
			alert("Todo!"); // use packed lists for import/export to reduce filesizes
            
		}
		
        document.getElementById("uek-lists-selection").onchange = function () {
            lists_currentList = unpackedLists[this.value];
            generateListHTML();
        }
       
        document.getElementById("uek-lists-new").onclick = function () {
            const name = new StoryList(Array.from(lists_selectedStories).map(a => a.slug), ["New List"]).displayName; //["New List", false, false, null, ""]
            const parent = document.getElementById("uek-lists-selection");
            const element = document.createElement("option");
            element.innerHTML = name;
            element.value = name;
            parent.appendChild(element);
            parent.value = name;
            lists_currentList = unpackedLists[name];
            generateListHTML();
        }
        
        document.getElementById("uek-lists-rename").onclick = function () {
            document.getElementById("uek-lists-name").classList.toggle("hidden");
        }
        
        document.getElementById("uek-lists-save").onclick = function () {
            Object.keys(unpackedLists).forEach( function(key) {
                console.log(key, unpackedLists[key].displayName);
                if (key != unpackedLists[key].displayName) {
                    chrome.storage.sync.remove("list: " + key);
                    //will be saved under a different name: Remove this version
                }
                unpackedLists[key].save();
            });
        }
       
        document.getElementById("uek-lists-refresh").onclick = function () {
            new Promise((resolve, reject) => chrome.storage.sync.get(null, function (items) {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError.message);
                } else {
                    resolve(items);
                }
            })).then(
                // Handle list data
                function (items) {
                    StoryList.unpackedLists = {};
                    for (entry in items) {
                        if (entry.startsWith("list: ")) {
                            new StoryList(items[entry].data, [entry.substring(6), items[entry].deleteAfterRead, items[entry].suggest]);
                        }                    
                    }
                    unpackedLists = StoryList.unpackedLists; 
                    console.log("%c Data ", "background: green; border-radius: 5px;", "List data parsed successfully");          
                    console.debug(unpackedLists);
                    
                    const parent = document.getElementById("uek-lists-selection");
                    parent.innerHTML = "";
                    Object.keys(unpackedLists).forEach( function (name) {
                        const element = document.createElement("option");
                        element.innerHTML = name;
                        element.value = name;
                        parent.appendChild(element);
                        if (lists_currentList == undefined) {
                            lists_currentList = unpackedLists[name];
                        }
                    });
                    generateListHTML();
                }, 
                function (errorMsg) {
                    console.log("%c Startup ", "color: red; font-weight: bold;", "Error while restarting UEK: Unable to parse list input.", errorMsg);
                }
            );
        }
       
        document.getElementById("uek-lists-select-all").onchange = function () {
            const allChecked = this.checked;
            Array.from(document.getElementById("uek-lists-table-body").getElementsByTagName("input")).forEach(function (el) {
                el.checked = allChecked;
           });
       }
       
        /*
        for (element of document.getElementById("uek-lists-display").getElementsByTagName("TR")) {
             // if (element.getAttribute("data-type") === "list") {
             if (element.parentElement.nodeName === "TBODY") {
                 // Draggable
                 element.draggable = true;
                 element.ondragstart = dragStart;
                 element.ondragend = dragEnd;
             }
             
             //Droppable
             element.ondragenter = dragEnter;
             element.ondragover = dragOver;
             element.ondragleave = dragLeave;
             element.ondrop = drop;
         } 
		 */
         
        generateListHTML();
        console.debug("List setup complete");
    }

    { // Options tab
    
        document.getElementById("uek-options-heightfactor").value = options.heightFactor;
        document.getElementById("uek-options-heightconst").value = options.heightConst;
        document.getElementById("uek-options-widthfactor").value = options.widthFactor;
        document.getElementById("uek-options-widthconst").value = options.widthConst;
        document.getElementById("uek-options-left").value = options.posLeft;
        document.getElementById("uek-options-top").value = options.posTop;
        document.getElementById("uek-options-changelog").checked = options.changelog;  
    
        document.getElementById("uek-options-heightfactor").oninput = calculateHeight;
        document.getElementById("uek-options-heightconst").oninput = calculateHeight;
        
        document.getElementById("uek-options-widthfactor").oninput = calculateWidth;
        document.getElementById("uek-options-widthconst").oninput = calculateWidth;
        
        document.getElementById("uek-options-left").oninput = calculatePosition;
        document.getElementById("uek-options-top").oninput = calculatePosition;
                
        document.getElementById("uek-options-confirm").onclick = function () {
            document.getElementById("uek-options-window-text").classList.add("hidden");
            save(function () {
                chrome.runtime.sendMessage({id: "update"});
            });
        }
        
        document.getElementById("uek-options-refresh").onclick = function () {
            save(function() {
                chrome.runtime.sendMessage({id: "update"});
                console.log("%c Startup ", "color: red; font-weight: bold;", "Restarting UEK");
                document.getElementById("uek-base-wrapper").parentElement.removeChild(document.getElementById("uek-base-wrapper"));
                open = false;
                championList = [];
                authorList = [];
                regionList = [];
                stories_sortKey = "title";
                lists_sortKey = "custom";
                startup();
            });
        }
        
        document.getElementById("uek-options-delete").onclick = function() {
            document.getElementById("uek-options-delete-text").classList.toggle("hidden");
            document.getElementById("uek-options-delete-confirm").classList.toggle("hidden");
        };
        
        document.getElementById("uek-options-delete-confirm").onchange = function(e) {
            if (e.srcElement.value === chrome.i18n.getMessage("options_delete_confirmation")) {
                chrome.storage.sync.clear();
                alert(chrome.i18n.getMessage("options_delete_alert"));
            }
        }
        console.debug("Options setup complete");
    }
    
    { // About Tab
        if (options.changelog == true) {
            document.getElementById("uek-about-changelog").classList.remove("hidden");
            document.getElementById("uek-about-changelog").previousElementSibling.classList.remove("hidden");
        }
        document.getElementById("uek-about-suggestions").getElementsByTagName("a")[0].href = chrome.runtime.getManifest().homepage_url;
        console.debug("About setup complete");
    }
    
    //Ready to show - quick switch for determining the landing page
    
    document.getElementById("uek-main-link-stories").classList.add("activeTab");
    
    //document.getElementById("uek-main-block-stories").classList.add("hidden");
    document.getElementById("uek-main-block-lists").classList.add("hidden");
    document.getElementById("uek-main-block-options").classList.add("hidden");
    document.getElementById("uek-main-block-about").classList.add("hidden");
    
    Array.from(document.getElementsByClassName("half-hidden")).forEach(function (element) {element.classList.remove("half-hidden")});
    console.debug("Showing window"); 
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.debug("Message: ", message);
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
                    imageURL: url
                });
                break;
            default:
                console.warn("Received unknown message with id " + message.id + ": ", message, sender);
                break;
        }
    } else {
        console.debug("Not ready to process message right now.");
    }
});

chrome.runtime.sendMessage("Hi!");
startup();