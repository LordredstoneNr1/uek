function translate() {       
    var element;
    var options;
    console.log("Starting translation for locale ", chrome.i18n.getUILanguage());
    
    { // Riot sidebar
        document.getElementById("uek-link-element").firstElementChild.innerHTML = chrome.i18n.getMessage("info_title");
        document.getElementById("uek-link-open").insertAdjacentText("afterBegin", chrome.i18n.getMessage("info_open"));
        chrome.storage.sync.get("options", function (items) {
            options = items.options;
            document.getElementById("uek-link-open").firstElementChild.innerHTML = items.options.shortcut;
        });
    }
   
    { // Extension heading
        document.getElementById("uek-main-title").innerHTML = chrome.i18n.getMessage("info_title_version", [chrome.runtime.getManifest().version]);
        document.getElementById("uek-main-link-stories").innerHTML = chrome.i18n.getMessage("heading_stories");
        document.getElementById("uek-main-link-lists").innerHTML = chrome.i18n.getMessage("heading_lists");
        document.getElementById("uek-main-link-options").innerHTML = chrome.i18n.getMessage("heading_options");
        document.getElementById("uek-main-link-about").innerHTML = chrome.i18n.getMessage("heading_about");
    }
    
    { // Story Tab 
        document.getElementById("uek-stories-text").innerHTML = chrome.i18n.getMessage("stories_text");
        
        { // Filter form
            document.getElementById("uek-filter-title").nextElementSibling.innerHTML = chrome.i18n.getMessage("stories_filter_title");
            document.getElementById("uek-filter-title-text").placeholder = chrome.i18n.getMessage("stories_placeholder_title");

            document.getElementById("uek-filter-champions").nextElementSibling.innerHTML = chrome.i18n.getMessage("stories_filter_champions");
            document.getElementById("uek-filter-champions-text").placeholder = chrome.i18n.getMessage("stories_placeholder_champions");

            document.getElementById("uek-filter-regions").nextElementSibling.innerHTML = chrome.i18n.getMessage("stories_filter_regions");
            element = document.createElement("option");
            element.value = "";
            element.selected = true;
            element.innerHTML = chrome.i18n.getMessage("stories_placeholder_regions");
            document.getElementById("uek-filter-regions-dropdown").appendChild(element);

            document.getElementById("uek-filter-authors").nextElementSibling.innerHTML = chrome.i18n.getMessage("stories_filter_authors");
            element = document.createElement("option");
            element.value = "";
            element.selected = true;
            element.innerHTML = chrome.i18n.getMessage("stories_placeholder_authors");
            document.getElementById("uek-filter-authors-dropdown").appendChild(element);

            document.getElementById("uek-filter-type").nextElementSibling.innerHTML = chrome.i18n.getMessage("stories_filter_type");
            element = document.createElement("option");
            element.value = "all";
            element.selected = true;
            element.innerHTML = chrome.i18n.getMessage("stories_dropdown_alluniverses");
            document.getElementById("uek-filter-type-universe-dropdown").appendChild(element);
            element = document.createElement("option");
            element.value = "main-universe";
            element.innerHTML = chrome.i18n.getMessage("stories_dropdown_mainuniverse");
            document.getElementById("uek-filter-type-universe-dropdown").appendChild(element);
            element = document.createElement("option");
            element.value = "alternate-universes";
            element.innerHTML = chrome.i18n.getMessage("stories_dropdown_alternateuniverses");
            document.getElementById("uek-filter-type-universe-dropdown").appendChild(element);
            element = document.createElement("option");
            element.value = "all";
            element.selected = true;
            element.innerHTML = chrome.i18n.getMessage("stories_dropdown_allstories");
            document.getElementById("uek-filter-type-type-dropdown").appendChild(element);
            element = document.createElement("option");
            element.value = "color-stories";
            element.innerHTML = chrome.i18n.getMessage("stories_dropdown_colorstories");
            document.getElementById("uek-filter-type-type-dropdown").appendChild(element);
            element = document.createElement("option");
            element.value = "long-stories";
            element.innerHTML = chrome.i18n.getMessage("stories_dropdown_longstories");
            document.getElementById("uek-filter-type-type-dropdown").appendChild(element);

            document.getElementById("uek-filter-words").nextElementSibling.innerHTML = chrome.i18n.getMessage("stories_filter_words");
            var message = chrome.i18n.getMessage("stories_filter_words_text");
            if (message.indexOf("&min;") < message.indexOf("&max;")) {
                //min before max is default
                message = message.split("&min;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-words-min"));
                message = message[1].split("&max;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-words-max"));
                document.getElementById("uek-filter-words-max").insertAdjacentHTML("afterend", message[1] + "<br>");
            } else {
                //switch min and max fields
                element = document.getElementById("uek-filter-words-min");
                document.getElementById("uek-stories-filter").removeChild(element);
                
                //insert text
                message = message.split("&max;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-words-max"));
                message = message[1].split("&min;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-words-min"));
                document.getElementById("uek-filter-words-min").insertAdjacentHTML("afterend", message[1] + "<br>");
            
            }

            document.getElementById("uek-filter-date").nextElementSibling.innerHTML = chrome.i18n.getMessage("stories_filter_date");
            message = chrome.i18n.getMessage("stories_filter_date_text");
            if (message.indexOf("&min;") < message.indexOf("&max;")) {
                //min before max is default
                message = message.split("&min;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-date-min"));
                message = message[1].split("&max;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-date-max"));
                document.getElementById("uek-filter-date-max").insertAdjacentHTML("afterend", message[1] + "<br>");
            } else {
                //switch min and max fields
                element = document.getElementById("uek-filter-date-min");
                document.getElementById("uek-stories-filter").removeChild(element);
                document.getElementById("uek-filter-date-max").insertAdjacentElement("afterend", element);
                
                //insert text
                message = message.split("&max;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-date-max"));
                message = message[1].split("&min;");
                element = document.createTextNode(message[0]);
                document.getElementById("uek-stories-filter").insertBefore(element, document.getElementById("uek-filter-date-min"));
                document.getElementById("uek-filter-date-min").insertAdjacentHTML("afterend", message[1] + "<br>");
            
            }
            
        }
        
        document.getElementById("uek-filter-apply").firstElementChild.firstElementChild.innerHTML = chrome.i18n.getMessage("stories_button_apply");
        document.getElementById("uek-filter-save").firstElementChild.firstElementChild.innerHTML = chrome.i18n.getMessage("stories_button_save");
        document.getElementById("uek-filter-reset").firstElementChild.firstElementChild.innerHTML = chrome.i18n.getMessage("stories_button_reset");
        document.getElementById("uek-filter-reload").firstElementChild.firstElementChild.innerHTML = chrome.i18n.getMessage("stories_button_reload");
        
        { //Table heading
        element = document.createElement("th");
        element.innerHTML = chrome.i18n.getMessage("stories_table_nr");
        document.getElementById("uek-stories-table-heading").firstElementChild.appendChild(element);
        
        element = document.createElement("th");
        element.innerHTML = chrome.i18n.getMessage("stories_table_title");
        element.classList.add("activeSort");
        document.getElementById("uek-stories-table-heading").firstElementChild.appendChild(element);
        
        element = document.createElement("th");
        element.innerHTML = chrome.i18n.getMessage("stories_table_length");
        document.getElementById("uek-stories-table-heading").firstElementChild.appendChild(element);
        
        element = document.createElement("th");
        element.innerHTML = chrome.i18n.getMessage("stories_table_champions");
        document.getElementById("uek-stories-table-heading").firstElementChild.appendChild(element);
        
        element = document.createElement("th");
        element.innerHTML = chrome.i18n.getMessage("stories_table_regions");
        document.getElementById("uek-stories-table-heading").firstElementChild.appendChild(element);
        
        element = document.createElement("th");
        element.innerHTML = chrome.i18n.getMessage("stories_table_author");
        document.getElementById("uek-stories-table-heading").firstElementChild.appendChild(element);
        
        element = document.createElement("th");
        element.innerHTML = chrome.i18n.getMessage("stories_table_date");
        document.getElementById("uek-stories-table-heading").firstElementChild.appendChild(element);
        }
        
    }

    { // Lists Tab
        
    }
    
    { // Options Tab
        chrome.i18n.getAcceptLanguages(function (languages) {
            var optElement = document.createElement("optgroup");
            optElement.label = "Suggested" //chrome.i18n.getMessage("options_detected");
            
            const suggestedLanguages = new Set();
            suggestedLanguages.add(options.universeOverride);
            for (i = 0; i < languages.length; i++) {
                // No need to suggest all english variants if en-US is already suggested
                if (languages[i].length == 2 && Array.from(suggestedLanguages.values()).some(a => a.startsWith(languages[i]))) {
                    continue;
                }
                var suggestions = universeLanguages.filter( a => a === languages[i] );
                                
                // No direct match, try second pass
                if (suggestions.length == 0) {
                    suggestions = universeLanguages.filter( a => a.substring(0, 2) === languages[i].substring(0,2));
                } 
                // Found something
                if (suggestions.length > 0) {
                    for (j = 0; j < suggestions.length; j++) {
                        suggestedLanguages.add(suggestions[j]);
                    }
                }
            }
            
            suggestedLanguages.forEach( function (suggestion) {
                var childElement = document.createElement("option");
                childElement.value = suggestion;
                childElement.innerHTML = suggestion;
                optElement.appendChild(childElement);
            });
            
            document.getElementById("uek-options-locale").appendChild(optElement);
            
            optElement = document.createElement("optgroup");
            optElement.label = "All Languages";
            
            
            for (i = 0; i < universeLanguages.length; i++) {
                var childElement = document.createElement("option");
                childElement.value = universeLanguages[i];
                childElement.innerHTML = universeLanguages[i];
                optElement.appendChild(childElement);
            }
            
            document.getElementById("uek-options-locale").appendChild(optElement);
        });
    }
    
    { // About Tab
        document.getElementById("uek-about-text").innerHTML = chrome.i18n.getMessage("about_text");
    }
    console.log("Finished translation. Used locale is ", chrome.i18n.getMessage("info_universecode"));
}