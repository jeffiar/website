const canvas = document.getElementById("canvas");
const bigContainer = document.getElementById('big-container');
const damping_slider = document.getElementById("damping");
const damping_span = document.getElementById("damping-span");
const T_MAX = 50;
const DT = 0.01;
const DAMPING_MAX = 10;

function resizeCanvas() {
    var containerWidth = parseInt(
        window.getComputedStyle(bigContainer).getPropertyValue("width")
    )
    canvas.width = containerWidth;
}
window.onresize = function() {resizeCanvas(); paintCanvas();};
resizeCanvas();

class Plotter {
    constructor(canvas, xmin, xmax, ymin, ymax, xlabel = "", ylabel = "") {
        this.canvas = canvas;
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
        return fracx * this.canvas.width;
    }

    y2coord(y) {
        var fracy = (y - this.ymin) / (this.ymax - this.ymin);
        return this.canvas.height - (fracy * this.canvas.height);
    }

    coord2x(x) {
        var fracx = x / this.canvas.width;
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
        this.draw_line(this.xmin, 0, this.xmax, 0, "black");
        this.draw_line(0, this.ymin, 0, this.ymax, "black");
        this.ctx.font = "20px Comic Sans MS";
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "right";
        this.ctx.fillText(this.xlabel, this.canvas.width - 3, this.y2coord(0) + 20);
        this.ctx.fillText(this.ylabel, this.x2coord(0) + 15, 20);
    }

    draw_graph(graph, color="blue", dotted=false) {
        this.ctx.beginPath();
        this.ctx.setLineDash(dotted ? [3,3] : []);
        this.ctx.strokeStyle = color;
        for (var i = 0; i < this.canvas.width; i++) {
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
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        this.draw_axes();
    }

    set_graphs(graphs, color = "blue") {
        this.graphs = graphs;
        this.clear_graph();
        for (var i = 0; i < graphs.length; i++) {
            this.draw_graph(this.graphs[i], color);
        }
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
        this.ctx.fillText(text, this.x2coord(x), this.y2coord(y));
    }
}

var x_of_t_plotter = new Plotter(canvas, -1, T_MAX, -1.5, 1.5, "t", "x");
x_of_t_plotter.draw_axes();

var xs = [];
var vs = [];
var ts = [];

damping_slider.oninput = function() {
    damping = DAMPING_MAX * Math.pow(damping_slider.value / 100, 2);
    damping_span.innerHTML = "&gamma; = " + damping.toFixed(2) + "&radic;km";

    calc_trajectory();
    paintCanvas();
}
damping_slider.oninput();

function paintCanvas() {
    x_of_t_plotter.clear_graph()
    x_of_t_plotter.draw_graph(x_of_t)
    if (damping < 2) {
        // Also draw the exponential decay envelopes
        x_of_t_plotter.draw_graph(envelope, "gray", dotted=true);
        x_of_t_plotter.draw_graph(minus_envelope, "gray", dotted=true);
    }
    x_of_t_plotter.write_text(
        damping > 2 ? "Overdamped!" : "Underdamped!",
        T_MAX / 2, 1.25, color="red"
    );
}

function calc_trajectory() {
    xs = []; vs = []; ts = [];
    let x = 1;
    let v = 0;
    let t = 0;
    while (t < T_MAX) {
        // Good-old Euler's method
        xs.push(x); vs.push(v); ts.push(t);
        v += (-damping * v - x) * DT
        x += v * DT;
        t += DT;
    }
}

function x_of_t(t) {
    var i = Math.floor(t / DT);
    return xs[i];
}

function envelope(t) {
    return Math.exp(-damping * t / 2);
}

function minus_envelope(t) {
    return -envelope(t);
}
