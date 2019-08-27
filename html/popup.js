/* Not a big script, just seting a few things in the HTML that need script support. 
    This is why this is in the HTML folder, NOT the script folder!
*/

document.getElementById("center").innerHTML = ("Universe Enhancement Kit v" + chrome.runtime.getManifest().version);

document.getElementById("changeLink").onclick = function() {
    chrome.tabs.create({
                "url": "chrome://extensions/shortcuts",
            });
};
chrome.storage.sync.get("options", function(options){
    if (options.shortcut) {
        document.getElementById("shortcut").innerHTML = options.shortcut;
    } else {
        chrome.commands.getAll(function (commands) {
            document.getElementById("shortcut").innerHTML = commands[1].shortcut;
        });
    }
});

