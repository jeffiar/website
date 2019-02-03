var T_slider = document.getElementById("T_slider");
var T_value = document.getElementById("T_value");
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
}

var Tc = 30;
function make_Fm(T) {
    function Fm(x) {
        return 0.25 * x**4 + 0.5 * (T - Tc) * x**2;
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

var left_plotter = new Plotter(left_canvas, -10, 10, -250, 250, "m", "F");
var right_plotter = new Plotter(right_canvas, -10, 100, -10, 10, "T", "m*");

// Callbacks
T_slider.oninput = on_T_slider;
function on_T_slider() {
    var T = T_slider.value / 5;
    T_value.innerHTML = (T-Tc).toFixed(1);
    
    Fm = make_Fm(T);
    m_star = min_m(T);

    left_plotter.set_graphs([Fm]);
    left_plotter.label_xval(m_star, "m*");
    left_plotter.label_xval(-m_star, "m*");
    left_plotter.draw_point(m_star, Fm(m_star));
    left_plotter.draw_point(-m_star, Fm(m_star));

    right_plotter.set_graphs([min_m, function(T) {return -min_m(T);}], "red");
    right_plotter.draw_point(T, m_star);
    right_plotter.draw_point(T, -m_star);
}
on_T_slider();
