function translate() {       
    var element;
    console.log("%c Translation ", "background-color: yellow; color: black; border-radius: 5px;", "Starting translation for locale ", chrome.i18n.getUILanguage());
    
    // Options callback
    chrome.storage.sync.get("options", function (items) {
        const options = items.options;
        document.getElementById("uek-link-open").firstElementChild.innerHTML = options.shortcut;
        
        document.getElementById("uek-options-height").value = Math.round(options.heightFactor / 100 * window.innerHeight + options.heightConst * 1) + "px";
        document.getElementById("uek-options-width").value = Math.round(options.widthFactor / 100 * window.innerWidth + options.widthConst * 1) + "px";
        document.getElementById("uek-options-position").value = "" + options.posLeft + " / " + options.posTop;
        
        // Creates language dropdown menu. This needs the current language, so it's here.
        chrome.i18n.getAcceptLanguages(function (languages) {
            var optElement = document.createElement("optgroup");
            optElement.label = chrome.i18n.getMessage("options_suggestedlocales");
            
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
            
            console.debug(suggestedLanguages);
            suggestedLanguages.forEach( function (suggestion) {
                var childElement = document.createElement("option");
                childElement.value = suggestion;
                childElement.innerHTML = suggestion;
                optElement.appendChild(childElement);
            });
            
            document.getElementById("uek-options-locale").appendChild(optElement);
            
            optElement = document.createElement("optgroup");
            optElement.label = "";
            document.getElementById("uek-options-locale").appendChild(optElement);
            
            optElement = document.createElement("optgroup");
            optElement.label = chrome.i18n.getMessage("options_alllocales");
            
            for (i = 0; i < universeLanguages.length; i++) {
                var childElement = document.createElement("option");
                childElement.value = universeLanguages[i];
                childElement.innerHTML = universeLanguages[i];
                optElement.appendChild(childElement);
            }
            
            document.getElementById("uek-options-locale").appendChild(optElement);
        });
    });
    
    { // Riot sidebar
        document.getElementById("uek-link-element").firstElementChild.innerHTML = chrome.i18n.getMessage("info_title");
        document.getElementById("uek-link-open").insertAdjacentText("afterBegin", chrome.i18n.getMessage("info_open"));
        
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
        // Universe Languages + Suggestions
        document.getElementById("uek-options-locale").previousElementSibling.innerHTML = chrome.i18n.getMessage("options_universelocale");
        
        // Creating the selection needs options support: See above
        
        document.getElementById("uek-options-heightconst").previousElementSibling.innerHTML = chrome.i18n.getMessage("options_heightConst");
        document.getElementById("uek-options-heightfactor").previousElementSibling.innerHTML = chrome.i18n.getMessage("options_heightFactor");
        document.getElementById("uek-options-height").parentElement.insertAdjacentText("afterBegin", chrome.i18n.getMessage("options_calculatedHeight"));
        
        document.getElementById("uek-options-widthconst").previousElementSibling.innerHTML = chrome.i18n.getMessage("options_widthConst");
        document.getElementById("uek-options-widthfactor").previousElementSibling.innerHTML = chrome.i18n.getMessage("options_widthFactor");
        document.getElementById("uek-options-width").parentElement.insertAdjacentText("afterBegin", chrome.i18n.getMessage("options_calculatedWidth"));
        
        document.getElementById("uek-options-left").previousElementSibling.innerHTML = chrome.i18n.getMessage("options_positionLeft");
        document.getElementById("uek-options-top").previousElementSibling.innerHTML = chrome.i18n.getMessage("options_positionTop");
        document.getElementById("uek-options-position").parentElement.insertAdjacentText("afterBegin", chrome.i18n.getMessage("options_currentPosition"));
        
        document.getElementById("uek-options-window-text").innerHTML = chrome.i18n.getMessage("options_refresh_text");
        
        document.getElementById("uek-options-changelog").nextElementSibling.innerHTML = chrome.i18n.getMessage("options_changelog");
        document.getElementById("uek-options-changelog").nextElementSibling.nextElementSibling.innerHTML = chrome.i18n.getMessage("options_changelog_text");
        
        
        document.getElementById("uek-options-confirm").firstElementChild.firstElementChild.innerHTML = chrome.i18n.getMessage("options_confirm");
        document.getElementById("uek-options-refresh").firstElementChild.firstElementChild.innerHTML = chrome.i18n.getMessage("options_refresh");
        document.getElementById("uek-options-delete").firstElementChild.firstElementChild.innerHTML = chrome.i18n.getMessage("options_delete");
        
        document.getElementById("uek-options-delete-text").innerHTML = chrome.i18n.getMessage("options_delete_text");
        
    }
    
    { // About Tab
        document.getElementById("uek-about-changelog").previousElementSibling.innerHTML = chrome.i18n.getMessage("about_changelog");
        document.getElementById("uek-about-suggestions").previousElementSibling.innerHTML = chrome.i18n.getMessage("about_suggestions");
        document.getElementById("uek-about-suggestions").insertAdjacentText("afterBegin", chrome.i18n.getMessage("about_suggestions_text"));
        
        document.getElementById("uek-about-credits").previousElementSibling.innerHTML = chrome.i18n.getMessage("about_credits");
        document.getElementById("uek-about-credits").innerHTML = chrome.i18n.getMessage("about_credits_text");
        document.getElementById("uek-about-credits").nextElementSibling.insertAdjacentText("afterBegin", chrome.i18n.getMessage("about_credits_translators"));
        
        document.getElementById("uek-about-legal").previousElementSibling.innerHTML = chrome.i18n.getMessage("about_legal");
        document.getElementById("uek-about-legal").innerHTML = chrome.i18n.getMessage("about_legal_text");
    }
    console.log("%c Translation ", "background-color: yellow; color: black; border-radius: 5px;", "Finished translation. Used locale is ", chrome.i18n.getMessage("info_universecode"));
}