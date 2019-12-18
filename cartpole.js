// With some help from
// http://physics.weber.edu/schroeder/software/demos/MolecularDynamics.html

var stepsPerFrame = 50;
var framesPerSec = 100;
var stepsPerSec = stepsPerFrame * framesPerSec;
var canvas = document.getElementById('canvas');
var arrowImg = document.getElementById('arrow');
var themeSelect = document.getElementById('theme');
var cartImg = new Image();
cartImg.src = "img/kiwibot.png"; // TODO wait for load before draw?
var bulbImg = new Image();
bulbImg.src = "img/cal-flag.png";
var context = canvas.getContext('2d');
var startButton = document.getElementById('start');
var highScore = 0;
var highScoreSpan = document.getElementById('hi-score');
var overlayText = "Press Start to Begin!"
var overlayColor = "gray";
var timeoutVar = 0;

// Current state
var running = false; // true if simulation is currently running, false otherwise
var throttle = 0; // -1 if accel left, 0 if nothing, +1 if accel right
var x = canvas.width / 2; // x-position of cart
var xDot = 0; // time derivative of ^
var theta = 0; // angle of the pole, measuring cw from vertical
var thetaDot = 0; // time derivative of ^
var t = 0; // timesteps taken
var needToInitialize = true; // Whether ^^^^^ need to be initialized next frame

// Constants of simulation
var g = 10; // strength of gravity
var l = 200; // length of pole
var alpha = 1; // Ratio of cart mass to pole mass (assuming mass of pole at tip)
var strength = 15; // How strongly user input accelerates cart
var friction = 0.15; // Damping constant of left-right motion
var dt = 1e-3; // Time step

// Visual Elements
var platformY = 350
var platformWidth = 250
var platformLeft = (canvas.width - platformWidth) / 2
var platformRight = platformLeft + platformWidth;
var cartWidth = 60;
var cartHeight = 40;
var wheelRadius = 5;
var bulbRadius = 10;
var poleThickness = 4;
var poleLength = l;

var leftKeyCodes = [37, 72, 65]; // left arrow, h, a
var rightKeyCodes = [39, 76, 68]; // right arrow, l, d

document.onkeypress = function (e) {
    e = e || window.event;
    // console.log('Key Press:' + e.keyCode);
    // Spacebar will start/stop the simulation as well
    if (e.keyCode == 32) {
        startStop();
    }
};

document.onkeydown = function (e) {
    e = e || window.event;
    // console.log('Key Down:' + e.keyCode);
    if (leftKeyCodes.includes(e.keyCode)) {
        throttle = -1;
    }
    if (rightKeyCodes.includes(e.keyCode)) {
        throttle = 1;
    }
};

document.onkeyup = function (e) {
    e = e || window.event;
    // console.log('Key Up:' + e.keyCode);
    if (leftKeyCodes.includes(e.keyCode)) {
        throttle = 0;
    }
    if (rightKeyCodes.includes(e.keyCode)) {
        throttle = 0;
    }
};

// Mysterious incantation that sometimes helps for smooth animation:
window.requestAnimFrame = (function(callback) {
return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / framesPerSec);
    };
})();

// The equations of motion are taken from the Wikipedia article:
//      https://en.wikipedia.org/wiki/Inverted_pendulum
// Solve for x double dot and theta double dot by inverting the 2x2 matrix
function doStep() {
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    var F = throttle * strength; // Might rescale...
    var det = (l*cos**2 - l*(1+alpha));
    var xDoubleDot = (-l*F + l*l*sin*(thetaDot**2) - g*l*sin*cos) / det;
    var thetaDoubleDot = (-cos*F + l*cos*sin*(thetaDot**2) 
                                                - g*sin*(1+alpha)) / det;
    xDoubleDot -= friction * xDot;

    x += xDot * dt;
    theta += thetaDot * dt;
    xDot += xDoubleDot * dt;
    thetaDot += thetaDoubleDot * dt;
    t += 1;
}

function cartPoleInBounds() {
    var poleTipX = x - poleLength * Math.sin(theta);
    return (x > platformLeft - cartWidth / 2
        && x < platformRight + cartWidth / 2
        && Math.abs(theta) < Math.PI / 2
        && poleTipX > 0 && poleTipX < canvas.width)
}

function cartPoleAlmostDead() {
    var dist = Math.abs(x - canvas.width / 2);
    var angle = Math.abs(theta);
    var distDanger = platformWidth * 0.5 * 0.6;
    var angleDanger = Math.PI / 6;
    return (dist > distDanger || angle > angleDanger);
}

function simulate() {
    for (var step = 0; step < stepsPerFrame; step++) {
        doStep();
    }

    if (cartPoleInBounds()) {
        // Call itself 10 milliseconds later
        timeoutVar = window.setTimeout(simulate, 1000 / framesPerSec);
    } else {
        // The user lost the game
        running = false;
        needToInitialize = true;
        clearTimeout(timeoutVar);

        overlayColor = "red";
        overlayText = "You lost!";
        startButton.value = "Play Again";
        var score = t / stepsPerSec;
        if (score > highScore) {
            highScoreSpan.innerHTML = score.toFixed(1);
        }
    }
    paintCanvas();
}
paintCanvas();

function drawDefaultCart(cartLeft, cartTop) {
    // Draw the body
    context.fillStyle = "blue";
    context.fillRect(cartLeft, cartTop, cartWidth, cartHeight - 2*wheelRadius);

    // Draw the wheels
    context.fillStyle = "brown";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(cartLeft + 2*wheelRadius, platformY - wheelRadius, 
        wheelRadius, 0, 2*Math.PI);
    context.fill();
    context.beginPath();
    context.arc(cartLeft + cartWidth- 2*wheelRadius, platformY - wheelRadius, 
        wheelRadius, 0, 2*Math.PI);
    context.fill();
}

function paintCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the ground
    context.fillStyle = "black";
    context.fillRect(platformLeft, platformY, platformWidth, 5)

    // Draw the cart
    var cartLeft = x - cartWidth / 2;
    var cartTop = platformY - cartHeight;
    if (themeSelect.value == "plain") {
        drawDefaultCart(cartLeft, cartTop);
    } else if (themeSelect.value == "gobears") {
        context.drawImage(cartImg, cartLeft, cartTop, cartWidth, cartHeight);
    }

    // Draw the pole
    context.save();
    context.fillStyle = "gray";
    context.translate(x, cartTop);
    context.rotate(Math.PI - theta)
    context.beginPath();
    context.rect(-poleThickness / 2, 0, poleThickness, poleLength)
    context.fill();

    // Draw the thing at the top of the pole
    if (themeSelect.value == "plain") {
        context.fillStyle = "red";
        context.beginPath();
        context.arc(0, poleLength, bulbRadius, 0, 2*Math.PI);
        context.fill();
    } else if (themeSelect.value == "gobears") {
        context.save();
        context.translate(0, poleLength);
        context.rotate(Math.PI);
        context.drawImage(bulbImg, 0, 0, 100, 50);
        context.restore();
    }

    context.restore();

    // Draw a circle at top of pole
    var poleTipX = x - poleLength * Math.sin(theta);
    var poleTipY = cartTop - poleLength * Math.cos(theta);

    // Show user's score
    context.font = "24px Comic Sans MS";
    context.fillStyle = "black";
    context.textAlign = "center";
    context.textBaseline= "top";
    var score = t / stepsPerSec;
    context.fillText("Score: " + score.toFixed(1), canvas.width / 2, 10);

    // Show "Danger!" if user is about to lose
    context.fillStyle = "red";
    context.textAlign = "center";
    if (cartPoleAlmostDead()) {
        if ((t * 3) % stepsPerSec < (stepsPerSec / 2)) {
            context.fillText("Danger!", canvas.width / 2, 50);
        }
    }

    // Draw arrow keys to visualize user input
    context.save();
    context.globalAlpha = (throttle == -1) ? 1 : 0.2;
    context.drawImage(arrowImg, 50, platformY + 8, 100, 40);
    context.restore();

    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.globalAlpha = (throttle == 1) ? 1 : 0.2;
    context.drawImage(arrowImg, 50, platformY + 8, 100, 40);
    context.restore();

    // Blur out if paused
    if (!running) {
        context.fillStyle = overlayColor;
        context.globalAlpha = 0.5;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;

        context.font = "32px Comic Sans MS";
        context.fillStyle = "black";
        context.textAlign = "center"
        context.fillText(overlayText, canvas.width / 2, 50)
    }
}

function initialize() {
    x = canvas.width / 2;
    xDot = 0;
    theta = Math.random() * 0.1 - 0.05;
    thetaDot = 0;
    t = 0;
    needToInitialize = false;
}

function startStop() {
    running = !running;
    if (running) {
        startButton.value = "Pause";
        if (needToInitialize) {
            initialize();
        }
        simulate();
    } else {
        startButton.value = "Resume";
        overlayText = "Simulation Paused";
        overlayColor = "gray";
        clearTimeout(timeoutVar);
        paintCanvas();
    }
}

startButton.onclick = startStop;
themeSelect.onchange = paintCanvas;
