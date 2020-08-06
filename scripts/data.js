console.debug("Data script loaded");

// Data
const champions_base = {
    "aatrox": "runeterra",
    "ahri": "ionia",
    "akali": "ionia",
    "alistar": "runeterra",
    "amumu": "shurima",
    "anivia": "freljord",
    "annie": "runeterra",
    "aphelios": "mount_targon",
    "ashe": "freljord",
    "aurelionsol": "runeterra",
    "azir": "shurima",
    "bard": "runeterra",
    "blitzcrank": "zaun",
    "brand": "runeterra",
    "braum": "freljord",
    "caitlyn": "piltover",
    "camille": "piltover",
    "cassiopeia": "noxus",
    "chogath": "void",
    "corki": "bandle_city",
    "darius": "noxus",
    "diana": "mount_targon",
    "draven": "noxus",
    "drmundo": "zaun",
    "ekko": "zaun",
    "elise": "shadow_isles",
    "evelynn": "runeterra",
    "ezreal": "piltover",
    "fiddlesticks": "runeterra",
    "fiora": "demacia",
    "fizz": "runeterra",
    "galio": "demacia",
    "gangplank": "bilgewater",
    "garen": "demacia",
    "gnar": "freljord",
    "gragas": "freljord",
    "graves": "bilgewater",
    "hecarim": "shadow_isles",
    "heimerdinger": "piltover",
    "illaoi": "bilgewater",
    "irelia": "ionia",
    "ivern": "ionia",
    "janna": "zaun",
    "jarvaniv": "demacia",
    "jax": "runeterra",
    "jayce": "piltover",
    "jhin": "ionia",
    "jinx": "zaun",
    "kaisa": "void",
    "kalista": "shadow_isles",
    "karma": "ionia",
    "karthus": "shadow_isles",
    "kassadin": "void",
    "katarina": "noxus",
    "kayle": "demacia",
    "kayn": "ionia",
    "kennen": "ionia",
    "khazix": "void",
    "kindred": "runeterra",
    "kled": "noxus",
    "kogmaw": "void",
    "leblanc": "noxus",
    "leesin": "ionia",
    "leona": "mount_targon",
    "lillia": "ionia",
    "lissandra": "freljord",
    "lucian": "runeterra",
    "lulu": "bandle_city",
    "lux": "demacia",
    "malphite": "ixtal",
    "malzahar": "void",
    "maokai": "shadow_isles",
    "masteryi": "ionia",
    "missfortune": "bilgewater",
    "monkeyking": "ionia",
    "mordekaiser": "noxus",
    "morgana": "demacia",
    "nami": "runeterra",
    "nasus": "shurima",
    "nautilus": "bilgewater",
    "neeko": "ixtal",
    "nidalee": "ixtal",
    "nocturne": "runeterra",
    "nunu": "freljord",
    "olaf": "freljord",
    "orianna": "piltover",
    "ornn": "freljord",
    "pantheon": "mount_targon",
    "poppy": "demacia",
    "pyke": "bilgewater",
    "qiyana": "ixtal",
    "quinn": "demacia",
    "rakan": "ionia",
    "rammus": "shurima",
    "reksai": "void",
    "renekton": "shurima",
    "rengar": "ixtal",
    "riven": "noxus",
    "rumble": "bandle_city",
    "ryze": "runeterra",
    "sejuani": "freljord",
    "senna": "runeterra",
    "sett": "ionia",
    "shaco": "runeterra",
    "shen": "ionia",
    "shyvana": "demacia",
    "singed": "zaun",
    "sion": "noxus",
    "sivir": "shurima",
    "skarner": "shurima",
    "sona": "demacia",
    "soraka": "mount_targon",
    "swain": "noxus",
    "sylas": "demacia",
    "syndra": "ionia",
    "tahmkench": "runeterra",
    "taliyah": "shurima",
    "talon": "noxus",
    "taric": "mount_targon",
    "teemo": "bandle_city",
    "thresh": "shadow_isles",
    "tristana": "bandle_city",
    "trundle": "freljord",
    "tryndamere": "freljord",
    "twistedfate": "bilgewater",
    "twitch": "zaun",
    "udyr": "freljord",
    "urgot": "zaun",
    "varus": "ionia",
    "vayne": "demacia",
    "veigar": "bandle_city",
    "velkoz": "void",
    "vi": "piltover",
    "viktor": "zaun",
    "vladimir": "noxus",
    "volibear": "freljord",
    "warwick": "zaun",
    "xayah": "ionia",
    "xerath": "shurima",
    "xinzhao": "demacia",
    "yasuo": "ionia",
    "yorick": "shadow_isles",
    "yone": "ionia",
    "yuumi": "bandle_city",
    "zac": "zaun",
    "zed": "ionia",
    "ziggs": "zaun",
    "zilean": "runeterra",
    "zoe": "mount_targon",
    "zyra": "ixtal"
};

const override_tags = {
    "ambitions-embrace": {"champions": ["lux"], "regions": [], "authors": ["Michael Yichao"]},
    "at-the-edge-of-the-world": {"champions": ["zyra"], "authors": ["Ian St. Martin"], "regions":  ["noxus"]},
    "bilgewater-story": {"champions": ["twistedfate", "graves"],"regions": ["bilgewater"], "authors": ["Scott Hawkes", "George Krstic", "Anthony Reynolds", "John O'Bryan"]},
    "out-of-time": {"champions": ["ezreal", "lucian", "pantheon", "fiora", "ekko"], "regions": [], "authors": ["Michael Yichao"]},
    "pantheon-fallen-story": {"champions": ["pantheon"], "regions": ["mount_targon"], "authors": ["David Slagle"]},
    "popstar-interview":  {"champions": ["ahri", "kaisa", "akali", "evelynn"], "regions": [], "authors": ["Indu Reddy", "Jared Rosen"]},
    "popstars-lyrics": {"champions": ["ahri", "kaisa", "akali", "evelynn"], "regions": [], "authors": ["Jared Rosen"]},
    "trial-of-the-masks": {"champions": ["sivir"], "regions": [], "authors": ["Jared Rosen"]},
    "the-lure": {"champions": ["kayn", "sona"], "regions": [], "authors": ["Dan Abnett"]},
    "the-man-with-the-grinning-shadow": {"champions": ["lucian", "thresh", "alistar", "urgot", "karthus"], "regions": [], "authors": ["Jared Rosen"]},
    "the-twilight-star": {"champions": ["lux", "poppy", "missfortune", "lulu", "jinx", "zoe"], "regions": [], "authors": ["Ariel Lawrence"]},
    "volibear-color-story": {"champions": ["volibear"], "regions": ["freljord"], "authors": ["Anthony Reynolds", "Rayla Heide"]},
    "with-hell-before-them": {"champions": ["thresh", "Ashe", "Darius", "Hecarim"], "regions": [], "authors": ["Jared Rosen"]}
};

const add_tags = {
    "child-of-zaun": {"champions":["caitlyn", "vi"]},
    "mount-targon-story": {"regions": ["mount_targon"], "champions": ["leona", "diana", "zoe", "pantheon", "taric"]},
    "pajama-party": {"champions": ["lux", "ezreal", "missfortune", "soraka", "poppy", "lulu", "janna", "jinx"]},
    "perennial": {"champions": ["ahri"], "regions": ["ionia"]},
    "project-of-rats-and-cats-and-neon-mice": {"champions": ["jhin", "vi", "vayne"]},
    "rg-shurima-story": {"champions": ["sivir"]},
    "star-guardian-starfall": {"champions": ["lux", "ezreal", "missfortune", "soraka", "poppy", "lulu", "janna", "jinx", "ahri", "syndra"]},
    "sisterhood-of-war-i": {"champions": ["riven"], "regions": ["noxus", "ionia"]},
    "sisterhood-of-war-ii": {"champions": ["riven"], "regions": ["noxus", "ionia"]},
    "sisterhood-of-war-iii": {"champions": ["riven"], "regions": ["noxus", "ionia"]},
    "the-legend-of-the-darkin": {"champions": ["kayn", "aatrox", "varus"]},
    "twilight-of-the-gods": {"champions": ["zoe", "kayn", "aatrox", "varus"]},
    "the-whispering-doodad": {"champions": ["draven"], "regions": ["noxus"]},
    "whatoncesailedfree": {"champions": ["jarvaniv"]},
    "where-icathia-once-stood": {"regions": ["void", "shurima"]},
};

const authors_fallback = {
    "a-sword-without-a-sheath-story":  ["Joe Lansford", "Robert Lo"],
    "ahri-garden-forgetting": ["Rayla Heide"],
    "amumu-color-story": ["Anthony Reynolds"],
    "art-is-life": ["Graham McNeill"],
    "ashe-color-story": ["Lillian Herington"],
    "at-the-edge-of-the-world": ["Ian St. Martin"],
    "aurelionsol-color-story": ["Matt Dunn"],
    "azir-color-story": ["Anthony Reynolds"],
    "bird-and-branch-story": ["Ariel Lawrence"],
    "blitzcrank-color-story": ["Rayla Heide"],
    "braum-color-story": ["Leslee Sullivant"],
    "caitlyn-color-story": ["Graham McNeill"],
    "camille-color-story": ["Ariel Lawrence"],
    "camille-weakest-heart": ["Ariel Lawrence"],
    "canticleofthewingedsisters": ["Graham McNeill"],
    "cassiopeia-color-story": ["Rayla Heide"],
    "confessions-of-a-broken-blade-act-1-story": ["Ariel Lawrence"],
    "confessions-of-a-broken-blade-act-2-story": ["Ariel Lawrence"],
    "confessions-of-a-broken-blade-act-3-story": ["Ariel Lawrence"],
    "darius-color-story": ["Laura Michet"],
    "demacian-heart": ["Phillip Vargas"],
    "diana-color-story": ["Graham McNeill"],
    "drmundo-color-story": ["Anthony Burch"],
    "ekko-color-story": ["Matt Dunn"],
    "elise-color-story": ["Graham McNeill"],
    "evelynn-color-story": ["John O'Bryan"],
    "ezreal-color-story": ["Rayla Heide"],
    "fiddlesticks-color-story": ["Rayla Heide"],
    "fiora-color-story": ["Graham McNeill"],
    "fizz-color-story": ["Anthony Reynolds"],
    "flesh-and-stone": ["John O'Bryan"],
    "for-demacia": ["Graham McNeill"],
    "from-the-ashes": ["Aaron Dembski-Bowden"],
    "frozen-hearts": ["David Slagle"],
    "gangplank-color-story": ["Anthony Reynolds"],
    "garen-color-story": ["Graham McNeill"],
    "gnar-color-story": ["Leslee Sullivant"],
    "graves-color-story": ["Anthony Reynolds"],
    "hecarim-color-story": ["Anthony Reynolds", "Graham McNeill"],
    "heimerdinger-color-story": ["Leslee Sullivant"],
    "illaoi-color-story": ["Odin Austin Shafer"],
    "ivern-color-story": ["Matt Dunn"],
    "janna-color-story": ["Anthony Burch"],
    "jax-color-story": ["Graham McNeill"],
    "jayce-color-story": ["Anthony Burch"],
    "jinx-color-story": ["Graham McNeill"],
    "kalista-color-story": ["Anthony Reynolds", "Graham McNeill"],
    "karthus-color-story": ["Anthony Reynolds", "Graham McNeill"],
    "kindred-color-story": ["Matt Dunn"],
    "kindred-good-death-story": ["Matt Dunn"],
    "kled-color-story": ["Odin Austin Shafer"],
    "leblanc-color-story": ["L J Goulding"],
    "leesin-color-story": ["Graham McNeill"],
    "legend-of-the-frozen-watchers": ["L J Goulding"],
    "leona-color-story": ["Graham McNeill"],
    "lucian-color-story": ["Anthony Reynolds"],
    "lux-color-story": ["Graham McNeill"],
    "malphite-color-story": ["Graham McNeill"],
    "maokai-color-story": ["Rayla Heide"],
    "masteryi-color-story": ["Michael Luo"],
    "missfortune-color-story": ["Graham McNeill"],
    "morgana-color-story": ["Rayla Heide"],
    "mount-targon-story": ["Graham McNeill"],
    "nami-first-steps": ["Rayla Heide"],
    "orianna-color-story": ["Rayla Heide"],
    "pajama-party": ["Ariel Lawrence"],
    "pantheon-color-story": ["David Slagle"],
    "pantheon-fallen-story": ["David Slagle"],
    "piltover-progress-day": ["Graham McNeill"],
    "poppy-color-story": ["John O'Bryan"],
    "project-of-rats-and-cats-and-neon-mice": ["Ariel Lawrence"],
    "quinn-color-story": ["Graham McNeill"],
    "rammus-color-story": ["Rayla Heide"],
    "reksai-color-story": ["Odin Austin Shafer"],
    "renekton-color-story": ["Graham McNeill"],
    "rg-shurima-story": ["Graham McNeill"],
    "ryze-color-story": ["John O'Bryan"],
    "shadow-and-fortune-story": ["Graham McNeill"],
    "shadow-isles-story": ["Graham McNeill"],
    "shen-color-story": ["John O'Bryan"],
    "shyvana-color-story": ["Rayla Heide"],
    "singed-thenightmare-story": ["Phillip Vargas"],
    "sion-color-story": ["Randy Begel"],
    "sivir-color-story": ["Odin Austin Shafer"],
    "skarner-color-story": ["Rayla Heide"],
    "snow-day": ["Michael Luo"],
    "star-guardian-starfall": ["Ariel Lawrence"],
    "sylas-color-story": ["John O'Bryan"],
    "tales-of-ornn": ["Matt Dunn"],
    "taliyah-color-story": ["Ariel Lawrence"],
    "taric-color-story": ["George Krstic"],
    "the-curators-gambit": ["Matt Dunn"],
    "the-dreaming-pool": ["Anthony Reynolds"],
    "the-echoes-left-behind": ["Anthony Reynolds"],
    "the-eye-in-the-abyss": ["Anthony Reynolds"],
    "the-legend-of-the-darkin": ["Graham McNeill"],
    "the-road-to-ruin-story":  ["Joe Lansford", "Robert Lo"],
    "the-whispering-doodad": ["Graham McNeill"],
    "thresh-color-story": ["Rayla Heide"],
    "trifarian-legion": ["Anthony Reynolds"],
    "tristana-color-story": ["Graham McNeill"],
    "turmoil": ["Anthony Reynolds"],
    "twilight-of-the-gods": ["Graham McNeill"],
    "twistedfate-color-story": ["Graham McNeill"],
    "twitch-color-story": ["Iain Hendry"],
    "vastaya-field-journal": ["Anthony Burch"],
    "vayne-color-story": ["Graham McNeill"],
    "veigar-color-story": ["Amanda Jeffrey"],
    "vi-color-story": ["Graham McNeill"],
    "viktor-color-story": ["Rayla Heide"],
    "warwick-color-story": ["David Slagle"],
    "where-icathia-once-stood": ["Graham McNeill"],
    "xayah-color-story": ["Matt Dunn"],
    "xerath-color-story": ["Anthony Reynolds"],
    "yorick-color-story": ["John O'Bryan"],
    "yuumi-color-story": ["Rayla Heide"],
    "zac-color-story": ["Graham McNeill"],
    "zaun-cityironglass": ["Graham McNeill"],
    "zoe-color-story": ["Odin Austin Shafer"],
    "zyra-color-story": ["Matt Dunn"],
}

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

// Classes

class UnpackedStory {
    
    constructor(obj) {
        this.url = obj['url'];
        this.title = obj['title'];
        this.words = obj['word-count'];
        this.slug = obj['story-slug'];
        this.timestamp = obj['release-date'] || null;
        this.imageURL = obj['background'].uri;
        this.getTags(obj);
        if (UnpackedStory.readStories.has(this.slug)) {
            this.read = true;
        } else {
            this.read = false;
        }
        
        UnpackedStory.storyModules.add(this);
    }
    
    compareToWithKey(other, key) {
        switch (key) {
            // Use title instead of slug because slugs are x-color-story: Unexpected results while sorting
            case "title": 
                if (other.title == null) return -1;
                if (this.title == null) return 1;
                return this.title.localeCompare(other.title);
                break;
                
            case "words":
                //Default from high to low here
                return other.words - this.words;
                break;
                
            case "release":
                if (other.timestamp == null) return -1;
                if (this.timestamp == null) return 1;
                return other.timestamp.localeCompare(this.timestamp);
                break;
            
            case "authors":
                var maxIndex = Math.min(this.tags.authors.length, other.tags.authors.length);
                for (i = 0; i < maxIndex; i++) {
                    if (this.tags.authors[i].localeCompare(other.tags.authors[i]) != 0) {
                        return this.tags.authors[i].localeCompare(other.tags.authors[i]);
                        break;
                    }
                }
                return this.tags.authors.length - other.tags.authors.length;
                break;
            
            case "champions":
                if (other.tags.champions.length == 0) return -1;
                if (this.tags.champions.length == 0) return 1;
                var maxIndex = Math.min(this.tags.champions.length, other.tags.champions.length);
                for (i = 0; i < maxIndex; i++) {
                    if (this.tags.champions[i].localeCompare(other.tags.champions[i]) != 0) {
                        return this.tags.champions[i].localeCompare(other.tags.champions[i]);
                        break;
                    }
                }
                return this.tags.champions.length - other.tags.champions.length;
                break;
            
            case "regions":
                if (other.tags.regions.length == 0) return -1;
                if (this.tags.regions.length == 0) return 1;
                var maxIndex = Math.min(this.tags.regions.length, other.tags.regions.length);
                for (i = 0; i < maxIndex; i++) {
                    if (this.tags.regions[i].localeCompare(other.tags.regions[i]) != 0) {
                        return this.tags.regions[i].localeCompare(other.tags.regions[i]);
                    }
                }
                return this.tags.regions.length - other.tags.regions.length;
                break;
                
            default: 
                return 0;
                break;
        }
    }
    
    getTags(obj) {
        //console.debug("getTags for ", obj);
        var tags = {"champions": new Set(), "authors": new Set(), "regions": new Set()};  
        
        //Override in case I don't like something
        if (!override_tags[this.slug]) {
            
            //regular tags created from the champions and subtitle of the story
            obj['featured-champions'].forEach(function(champion) {
                if (chrome.i18n.getMessage("champion_" + champion.slug) != champion.name) {
                    console.log("%c Translation missing ", "background-color: red; border-radius: 5px;", champion.name);
                }
                tags.champions.add(chrome.i18n.getMessage("champion_" + champion.slug));
                // Plain text version instead of faction slug
                tags.regions.add(chrome.i18n.getMessage("region_" + champions_base[champion.slug]));
            });  
            
            // We embark on our quest to find the author. It will be long and painful, but these people need to be credited.
            const beginnings = chrome.i18n.getMessage("info_subtitle_by").split(";");
            if (obj.subtitle != null && beginnings.includes(obj.subtitle.substr(0, beginnings[0].length)) ) {
                
                var author = obj.subtitle.substring(beginnings[0].length);
                //Transform Ian St Martin into Ian St. Martin. No regex or unicode for that, it's just for Ian and no one else.
                if (author === "Ian St Martin") {
                    console.debug("Ian St Martin", " -> ", "Ian St. Martin");
                    author = "Ian St. Martin";
                }
                
                /*  We also need to get rid of character U+2019 (Single Right Quotation Mark). 
                    This one is for you, John O'Bryan!
                */
                if (author.includes("\u2019")) {
                    console.debug(author, " -> ", author.replace("\u2019", "'"));
                    author = author.replace("\u2019", "'");
                }
                
                // These are all edge cases we need to handle - I think?
                tags.authors.add(author);
            } else {
                //Lookup list in case the subtitle is not defined.
                if(authors_fallback[this.slug]) {
                    tags.authors = authors_fallback[this.slug];
                } else {
                    console.log("%c Author missing ", "background-color: red; border-radius: 5px;", obj["story-slug"]);
                }
            }
            
            //Adding tags as defined in data.js (if present)                            
            if (add_tags[this.slug]) {
                if (add_tags[this.slug].champions) {
                    add_tags[this.slug].champions.forEach(function (champion) {
                        tags.champions.add(chrome.i18n.getMessage("champion_" + champion));
                    });
                }
                if (add_tags[this.slug].regions) {
                    add_tags[this.slug].regions.forEach(function (region) {
                        tags.regions.add(chrome.i18n.getMessage("region_" + region));
                    });
                }
                if (add_tags[this.slug].authors) {
                    add_tags[this.slug].authors.forEach(function (author) {
                        tags.authors.add(author);
                    });
                }
            }
            
            tags.authors.forEach(function(author){
                StoryList.authorList.add(author);
            });
            
        } else {
            //Override
            tags.champions = override_tags[this.slug].champions.map(a => chrome.i18n.getMessage("champion_" + a));
            tags.regions = override_tags[this.slug].regions.map(a => chrome.i18n.getMessage("region_" + a));
            tags.authors = override_tags[this.slug].authors;
        }
        tags.champions = Array.from(tags.champions).sort();
        tags.regions = Array.from(tags.regions).sort();
        tags.authors = Array.from(tags.authors).sort(); 
        this.tags = tags;
    }
}
UnpackedStory.storyModules = new Set();
UnpackedStory.readStories = new Set();

class StoryList {

    constructor(list, metaData) {
        this.displayName = StoryList.checkName(metaData[0]);
        this.data = list.map(a => (Array.from(UnpackedStory.storyModules).find(b => b["slug"] == a))) || [];
        this.deleteAfterRead = metaData[1] || false;
        this.suggest = metaData[2] || false;
        this.thumbnailURL = metaData[3] || (this.data[0].imageURL || null);
//      this.updates = metaData[4] || "";

        StoryList.unpackedLists[this.displayName] = this;
    }

    add(url) {
        var unpackedStory = Array.of(...UnpackedStory.storyModules).find( story => story.slug === url.substring(49, url.length-1) );
        if (!this.data.includes(unpackedStory)) {
           this.data.push(unpackedStory);
        }
    }

    save() {
        chrome.storage.sync.set(this.pack());
        chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
            console.log("%c Data ", "background: green; border-radius: 5px;", "Saved Data. Total bytes used: ", bytesInUse);
        });
    }

    pack() {
        const list = {};
        list["list: " + this.displayName] = {
            "data" : this.data.map(a => a.slug),
            "deleteAfterRead": this.deleteAfterRead,
            "suggest": this.suggest//,
            //"updates": this.updates 
        }
        return list;
    }
    
}
StoryList.authorList = new Set();
StoryList.unpackedLists = new Object();
StoryList.checkName = function (name) {
    if (Object.keys(StoryList.unpackedLists).includes(name)) {
        console.log("%c Data ", "background: green; border-radius: 5px;", "Duplicate list: ", name);
        const pattern = / \(\d+\)$/;
        const pos = name.search(pattern);
        if (pos != -1) {
            const nr = name.substr(pos, name.length-1).toNumber();
            return StoryList.checkName(name.replace(pattern, " (" + (nr+1) + ")"));
        } else {
            return name + " (1)";
        }
    }
    // else: unchanged
    return name;
}

// functions

function getAsPromise() {
    return new Promise((resolve, reject) => chrome.storage.sync.get(null, function (items) {
        if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
        } else {
            resolve(items);
        }
    }));
}

function request(url) {
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
