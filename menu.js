var pages = ["index.html","research.html", "performances.html", "essays.html", "music.html", "cv.html"]
var names = ["Home", "Research", "Performances", "Writings",
             "Music", "CV"];
var titles = ["About me", "My past and present research", "A list of my performances",
              "Some writings", "My past musical compositions", "Curriculum Vitae"];
var url_parts = document.location.href.split('/');
var current_page = url_parts[url_parts.length - 1];
if (current_page == "") {
    current_page = "index.html";
}

var parts = []
for (var i = 0; i < pages.length; i++) {
    if (pages[i] == current_page) {
        parts.push(names[i]);
    } else {
        parts.push('<a href="' + pages[i] + '" title="' + titles[i] + '">' + names[i] + '</a>');
    }
}

var menu_html = '[ ' + parts.join(' | ') + ' ]'
document.write(menu_html);
