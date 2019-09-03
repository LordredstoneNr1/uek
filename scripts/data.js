const champions_base = {
    "aatrox": "runeterra",
    "ahri": "ionia",
    "akali": "ionia",
    "alistar": "runeterra",
    "amumu": "shurima",
    "anivia": "freljord",
    "annie": "runeterra",
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
    "lissandra": "freljord",
    "lucian": "demacia",
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
    "yuumi": "bandle_city",
    "zac": "zaun",
    "zed": "ionia",
    "ziggs": "zaun",
    "zilean": "runeterra",
    "zoe": "mount_targon",
    "zyra": "ixtal"
};

const override_tags = {
    "bilgewater-story": {"champions": ["twistedfate", "graves"],"regions": ["bilgewater"], "authors": ["Scott Hawkes", "George Krstic", "Anthony Reynolds", "John O'Bryan"]},
    "popstar-interview":  {"champions": ["ahri", "kaisa", "akali", "evelynn"], "regions": [], "authors": ["Indu Reddy", "Jared Rosen"]},
    "popstars-lyrics": {"champions": ["ahri", "kaisa", "akali", "evelynn"], "regions": [], "authors": ["Jared Rosen"]},
    "trial-of-the-masks": {"champions": ["sivir"], "regions": [], "authors": ["Jared Rosen"]},
    "the-lure": {"champions": ["kayn", "sona"], "regions": [], "authors": ["Dan Abnett"]},
    "the-man-with-the-grinning-shadow": {"champions": ["lucian", "thresh", "alistar", "urgot", "karthus"], "regions": [], "authors": ["Jared Rosen"]}
};

const add_tags = {
    "project-of-rats-and-cats-and-neon-mice": {"champions": ["jhin", "vi", "vayne"]},
    "pajama-party": {"champions": ["lux", "ezreal", "missfortune", "soraka", "poppy", "lulu", "janna", "jinx"]},
    "at-the-edge-of-the-world": {"champions": ["zyra"], "regions":  ["noxus"]},
    "mount-targon-story": {"regions": ["mount_targon"], "champions": ["leona", "diana", "zoe", "pantheon", "taric"]},
    "star-guardian-starfall": {"champions": ["lux", "ezreal", "missfortune", "soraka", "poppy", "lulu", "janna", "jinx", "ahri", "syndra"]},
    "the-legend-of-the-darkin": {"champions": ["kayn", "aatrox", "varus"]},
    "twilight-of-the-gods": {"champions": ["zoe", "kayn", "aatrox", "varus"]},
    "rg-shurima-story": {"champions": ["sivir"]},
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
    "gnar-color-story": ["Leslee Sullivant Heintz"],
    "graves-color-story": ["Anthony Reynolds"],
    "hecarim-color-story": ["Graham McNeill"],
    "illaoi-color-story": ["Odin Austin Shafer"],
    "ivern-color-story": ["Matt Dunn"],
    "janna-color-story": ["Anthony Burch"],
    "jax-color-story": ["Graham McNeill"],
    "jayce-color-story": ["Anthony Burch"],
    "jinx-color-story": ["Graham McNeill"],
    "kalista-color-story": ["Graham McNeill"],
    "karthus-color-story": ["Graham McNeill"],
    "kindred-color-story": ["Matt Dunn"],
    "kindred-good-death-story": ["Matt Dunn"],
    "kled-color-story": ["Odin Austin Shafer"],
    "leblanc-color-story": ["L J Goulding"],
    "leesin-color-story": ["Graham McNeill"],
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
