window.addEventListener("load", function() {
    var navNode = document.getElementById("riotbar-navmenu").lastElementChild;
    var outerDiv = document.createElement("div");
    outerDiv.setAttribute("id", "uek-link-element");
    outerDiv.setAttribute("class", "riotbar-navmenu-category");
    var innerDiv = document.createElement("div");
    innerDiv.setAttribute("class", "riotbar-category-name");
    innerDiv.innerHTML = "Universe Enhancement Kit";
    outerDiv.appendChild(innerDiv);
    innerDiv = document.createElement("div");
    var link = document.createElement("a");
    link.setAttribute("class", "riotbar-navmenu-link");
    link.setAttribute("onclick", 'test()');
    link.innerHTML = "Open sidebar view";
    innerDiv.appendChild(link);
    outerDiv.appendChild(innerDiv);
    navNode.firstElementChild.appendChild(outerDiv);
});

function test() {
    console.log("Test");
}
/*function changeVisibility() {
    if (div.getAttribute("class") == "hidden") {
        div.setAttribute("class", "");
    } else {
        div.setAttribute("class", "hidden");
    }
};


inject menu point into left sidebar:
    id="riotbar-navmenu"
     --> lastChild (div class="riotbar-navmenu-dropdown");
     
     --> firstChild.appendChild
    */