/* Not a big script, just seting a few things in the HTML that need script support / translation. 
    This is why this is in the HTML folder, NOT the script folder!
*/
var element;
document.getElementById("uek-popup-title").innerHTML = chrome.i18n.getMessage("info_title_version", [chrome.runtime.getManifest().version]);

chrome.storage.sync.get("options", function(items) {
    document.getElementById("shortcut").innerHTML = items.options.shortcut;
});

document.getElementById("uek-popup-text").innerHTML = chrome.i18n.getMessage("popup_text") + 
                '<li><b id="shortcut"> [Ctrl] + [Shift] + [L] </b> (<a id="changeLink" class="link" href="javascript:void(0)"></a>)</li>';
document.getElementById("changeLink").innerHTML = chrome.i18n.getMessage("popup_change");  
document.getElementById("changeLink").onclick = function() {
    chrome.tabs.create({
        "url": "chrome://extensions/shortcuts",
    });
};

element = document.createElement("li");
element.innerHTML = chrome.i18n.getMessage("popup_contextmenu");      
document.getElementById("uek-popup-text").appendChild(element);

element = document.createElement("li");
element.innerHTML = chrome.i18n.getMessage("popup_riotmenu");      
document.getElementById("uek-popup-text").appendChild(element);

element = document.createElement("li");
element.innerHTML = chrome.i18n.getMessage("popup_click");      
document.getElementById("uek-popup-text").appendChild(element);

element = document.createElement("p");
element.innerHTML = chrome.i18n.getMessage("popup_close");
document.getElementById("uek-popup-text").parentElement.appendChild(element);

