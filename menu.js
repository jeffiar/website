var pages = ["index.html","research.html", "performances.html", "projects.html",
             "essays.html", "music.html", "gallery.html", "cv.html"]
var names = ["Home", "Research", "Performances", "Projects", "Writings",
             "Music", "Media", "CV"];
var titles = ["About me", "My past and present research", "A list of my performances",
              "My projects", "Some essays", "My past musical compositions",
              "A photo gallery", "Curriculum Vitae"];
var url_parts = document.location.href.split('/');
var current_page = url_parts[url_parts.length - 1];
if (current_page == "") {
    current_page = "index.html";
}

var menu_html = "";
for (var i = 0; i < pages.length; i++) {
    if (pages[i] == current_page) {
        menu_html += '[ ' + names[i] + " ] ";
    } else {
        menu_html += '[ <a href="' + pages[i] + '" title="' + titles[i] + '">' + names[i] + '</a> ] ';
    }
}

// menu_html += '<br/> [ <a href="statmech2/"> Notes on Statistical Mechanics</a> ]'
document.write(menu_html);
