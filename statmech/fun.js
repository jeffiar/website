var T_slider = document.getElementById("T_slider");
var left_canvas = document.getElementById("left_canvas");
var right_canvas = document.getElementById("right_canvas");

class Plotter {
    constructor(canvas, xmin, xmax, ymin, ymax, xlabel = "", ylabel = "") {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext("2d");
        this.xmin = xmin;
        this.xmax = xmax;
        this.ymin = ymin;
        this.ymax = ymax;
        this.xlabel = xlabel;
        this.ylabel = ylabel;
    }

    x2coord(x) {
        var fracx = (x - this.xmin) / (this.xmax - this.xmin);
        return fracx * this.width;
    }

    y2coord(y) {
        var fracy = (y - this.ymin) / (this.ymax - this.ymin);
        return this.height - (fracy * this.height);
    }

    coord2x(x) {
        var fracx = x / this.width;
        return this.xmin + (fracx * (this.xmax - this.xmin));
    }

    // From HTML element location to the logical X coord of graph
    elm2x(elmX) {
        var rect = this.canvas.getBoundingClientRect();
        var contX = rect.left + window.scrollX;
        var fracx = (elmX - contX) / (rect.width);
        return this.xmin + (fracx * (this.xmax - this.xmin));
    }

    elm2y(elmY) {
        var rect = this.canvas.getBoundingClientRect();
        var contY = rect.top + window.scrollY;
        var fracy = (elmY - contY) / (rect.height);
        return this.ymax - (fracy * (this.ymax - this.ymin));
    }

    draw_line(x1,y1,x2,y2, color = "black", dotted = false) {
        var X1 = this.x2coord(x1);
        var X2 = this.x2coord(x2);
        var Y1 = this.y2coord(y1);
        var Y2 = this.y2coord(y2);
        this.ctx.beginPath();
        if (dotted) {
            this.ctx.setLineDash([3,3]);
        } else {
            this.ctx.setLineDash([]);
        }
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(X1,Y1);
        this.ctx.lineTo(X2,Y2);
        this.ctx.stroke();
    }

    draw_axes() {
        this.draw_line(this.xmin, 0, this.xmax, 0, "gray");
        this.draw_line(0, this.ymin, 0, this.ymax, "gray");
        this.ctx.font = "20px Comic Sans MS";
        this.ctx.fillStyle = "gray";
        this.ctx.textAlign = "right";
        this.ctx.fillText(this.xlabel, this.width - 3, this.y2coord(0) + 20);
        this.ctx.fillText(this.ylabel, this.x2coord(0) - 3, 20);
    }

    draw_graph(graph, color="blue") {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        for (var i = 0; i < this.width; i++) {
            var x = this.coord2x(i);
            var y = graph(x);
            var X = this.x2coord(x);
            var Y = this.y2coord(y);
            if (i == 0) {
                this.ctx.moveTo(X,Y);
            } else {
                this.ctx.lineTo(X,Y);
            }
        }
        this.ctx.stroke();
    }

    clear_graph() {
        this.ctx.clearRect(0,0,this.width, this.height);
        this.draw_axes();
    }

    set_graphs(graphs, color = "blue") {
        this.graphs = graphs;
        this.clear_graph();
        for (var i = 0; i < graphs.length; i++) {
            this.draw_graph(this.graphs[i], color);
        }
    }

    label_xval(x, label) {
        var y = this.graphs[0](x);
        this.draw_line(x,0,x,y,"red", true);

        this.ctx.font = "20px Comic Sans MS";
        this.ctx.fillStyle= "red";
        this.ctx.textAlign = "center";
        this.ctx.fillText(label, this.x2coord(x), this.y2coord(0) - 7);
    }

    draw_point(x,y, color="red") {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.arc(this.x2coord(x), this.y2coord(y), 5, 0, 2*Math.PI);
        this.ctx.fill();
    }

    write_text(text, x, y, color="gray") {
        this.ctx.font = "20px Comic Sans MS";
        this.ctx.fillStyle = color;
        this.ctx.textAlign = "center";
        this.ctx.fillText(text, x, y);
    }
}

var Tc = 30;
function make_Fm(T) {
    function Fm(x) {
        return 0.25 * x**4 + 0.5 * (T - Tc) * x**2;
    }
    return Fm;
}

function make_fancy_Fm(r, h) {
    function Fm(x) {
        return 0.25 * x**4 + 0.5 * r * x**2 - h * x;
    }
    return Fm;
}

function min_m(T) {
    // Need to update this later if I include the external field...
    if (T > Tc) {
        return 0;
    } else {
        return (Tc - T)**0.5;
    }
}

// Find the x value which minimizes f on the range (xmin, xmax)
// Much better than solving a cubic equation!!
function min_of(f, xmin, xmax) {
    var ntries = 200;
    var step = (xmax - xmin) / ntries;
    var min = xmin;
    var minval = 10**1000;
    for (var i = 0; i < ntries; i++) {
        var x = xmin + (i * step);
        var y = f(x);
        if (y < minval) {
            min = x;
            minval = y;
        }
    }
    return min;
}

var left_plotter = new Plotter(left_canvas, -10, 10, -250, 250, "m", "F");
var right_plotter = new Plotter(right_canvas, -10, 100, -10, 10, "T", "m*");

// Callbacks
T_slider.oninput = on_T_slider;
function on_T_slider() {
    var T = T_slider.value / 5;
    
    Fm = make_Fm(T);
    m_star = min_m(T);

    left_plotter.set_graphs([Fm]);
    left_plotter.label_xval(m_star, "m*");
    left_plotter.label_xval(-m_star, "m*");
    left_plotter.draw_point(m_star, Fm(m_star));
    left_plotter.draw_point(-m_star, Fm(m_star));
    left_plotter.write_text("r = " + (T-Tc).toFixed(1), 300, 400, "black");

    right_plotter.set_graphs([min_m, function(T) {return -min_m(T);}], "red");
    right_plotter.draw_point(T, m_star);
    right_plotter.draw_point(T, -m_star);
    right_plotter.write_text("T = " + T.toFixed(1), right_plotter.x2coord(T), 400, "black");
    
    if (T > Tc) {
        right_plotter.write_text("T > Tc", 350, 50, "green");
        right_plotter.write_text("m* = 0", 350, 75, "green");
    } else {
        right_plotter.write_text("T < Tc", 350, 50, "green");
        right_plotter.write_text("m* = ±" + m_star.toFixed(1), 350, 75, "green");
    }
}
on_T_slider();
right_plotter.write_text("Drag the slider!", 230, 370, "green");

var right_canvas2 = document.getElementById("right_canvas2");

var left_plotter2 = new Plotter(left_canvas2, -10, 10, -250, 250, "m", "F");
var right_plotter2 = new Plotter(right_canvas2, -25, 25, -25, 25, "h", "r");
left_plotter2.draw_axes();
right_plotter2.draw_axes();

function on_2_slider(elmX, elmY) {
    h = right_plotter2.elm2x(elmX);
    r = right_plotter2.elm2y(elmY);
    right_plotter2.clear_graph();

    Fm = make_fancy_Fm(r, h);
    left_plotter2.set_graphs([Fm]);
    left_plotter2.write_text("h = " + h.toFixed(1), 300, 375, "black");
    left_plotter2.write_text("r = " + r.toFixed(1), 300, 400, "black");

    m_star = min_of(Fm, -10, 10);
    left_plotter2.label_xval(m_star, "m*");
    left_plotter2.draw_point(m_star, Fm(m_star));
}

// taken from https://codepen.io/ramenhog/pen/gmGzRQ
window.onload = function(){
  const moveMe = document.getElementById("movable");
  
  var diffY,
      diffX,
      elmHeight,
      elmWidth,
      containerX,
      containerY,
      containerHeight,
      containerWidth,
      isMouseDown = false;

    const container = document.getElementById('right_canvas2')
    const rect = container.getBoundingClientRect();
    containerX = rect.left + window.scrollX;
    containerY = rect.top + window.scrollY;

    on_2_slider(containerX, containerY);
    right_plotter2.write_text("<- Drag the ball!", 100, 20, "green");

  function mouseDown(e) {
    isMouseDown = true;
    // get initial mousedown coordinated
    const mouseY = e.clientY;
    const mouseX = e.clientX;
    
    // get element top and left positions
    const elm = moveMe;
    const elmY = elm.offsetTop;
    const elmX = elm.offsetLeft;

    // get elm dimensions
    elmWidth = elm.offsetWidth;
    elmHeight = elm.offsetHeight;
    

    // get container dimensions
    containerWidth = container.offsetWidth;
    containerHeight = container.offsetHeight;
    
    // get diff from (0,0) to mousedown point
    diffY = mouseY - elmY;
    diffX = mouseX - elmX;
    // console.log("container at " + containerX + ", " + containerY);
    // console.log("container size" + containerWidth + ", " + containerHeight);
    // console.log("div at " + elmX + ", " + elmY);
  }
  

  function mouseMove(e) {
    if (!isMouseDown) return;

    const elm = moveMe;
    // get new mouse coordinates
    const newMouseY = e.clientY;
    const newMouseX = e.clientX;
    
    // calc new top, left pos of elm
    let newElmTop = newMouseY - diffY,
        newElmLeft = newMouseX - diffX;
    
    // calc new bottom, right pos of elm
    let newElmBottom = newElmTop + elmHeight,
        newElmRight = newElmLeft + elmWidth;
    
  if (newElmTop < containerY) {
    newElmTop = containerY;
  }
  
  if (newElmLeft < containerX) {
    newElmLeft = containerX;
  }

  if (newElmBottom > containerY + containerHeight) {
    newElmTop = containerY + containerHeight - elmHeight;
  }

  if (newElmRight > containerX + containerWidth) {
    newElmLeft = containerX + containerWidth - elmWidth;
  }

    moveElm(elm, newElmTop, newElmLeft);
    
    on_2_slider(newElmLeft + (elmHeight/ 2), newElmTop + (elmWidth / 2)); // the callback for drawing the graph
  }

  // move elm
  function moveElm(elm, yPos, xPos) {
    elm.style.top = yPos + 'px';
    elm.style.left = xPos + 'px';
  }

  function mouseUp() {
    isMouseDown = false;
  }

  moveMe.addEventListener('mousedown', mouseDown);
  document.addEventListener('mousemove', mouseMove);
  document.addEventListener('mouseup', mouseUp);
}
