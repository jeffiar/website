var pages = ["research.html", "performances.html", "projects.html",
             "essays.html", "music.html", "gallery.html", "cv.html"]
var names = ["Research", "Performances", "Projects", "Writings",
             "Music", "Media", "CV"];
var titles = ["My past and present research", "A list of my performances",
              "My projects", "Some essays", "My past musical compositions",
              "A photo gallery", "Curriculum Vitae"];
var url_parts = document.location.href.split('/');
var current_page = url_parts[url_parts.length - 1];

var menu_html = "<hr/>";
for (var i = 0; i < pages.length; i++) {
    if (pages[i] == current_page) {
        menu_html += names[i] + "<br/>";
    } else {
        menu_html += '<a href="' + pages[i] + '" title="' + titles[i] + '">' + names[i] + '</a><br/>';
    }
}
menu_html += "<hr/>"
document.write(menu_html);
