var ids = ['a', 'b', 'c', 'd', 'e'];
var pentagon = document.getElementById("pentagon");
var polygon = document.getElementById("polygon");
var o = pentagon.getAttribute("height") / 2;

var getValues = function() {
    var values = [];
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var slider = document.getElementById(id);
        values.push(slider.value);
    }
    return values
}

var moveSlider = function(slider, id) {
    var value = slider.value;
    var span = document.getElementById(id + "-span");
    span.innerHTML = value + "/5";

    drawPentagon();
}

var drawPentagon = function() {
    s = ""
    values = getValues();
    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var x = o + o * values[i] * 0.2 * Math.cos(i * 2 * 0.2 * Math.PI);
        var y = o + o * values[i] * 0.2 * Math.sin(i * 2 * 0.2 * Math.PI);
        s += x + "," + y + " "
    }
    polygon.setAttribute("points", s)
}
