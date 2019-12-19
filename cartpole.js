// ------------------------
// --- GLOBAL VARIABLES ---
// ------------------------
var canvas = document.getElementById('canvas');
var bigContainer = document.getElementById('big-container');
var arrowImg = document.getElementById('arrow');
var themeSelect = document.getElementById('theme');
var cartImg = document.getElementById('kiwibot');
var bulbImg = document.getElementById('cal-flag');
var context = canvas.getContext('2d');
var startButton = document.getElementById('start');
var resetButton = document.getElementById('reset');
var highScoreSpan = document.getElementById('hi-score');
var manualButton = document.getElementById('manual');
var autoButton = document.getElementById('auto');
var advancedDiv = document.getElementById('advanced-div');
var codeBox = document.getElementById('code-box');
var codeRunButton = document.getElementById('run-code');
var codeRunSpan = document.getElementById('run-confirm');
var immortalityCheckBox = document.getElementById('immortal-checkbox');

// Constants of simulation
const g = 10; // strength of gravity
const l = 200; // length of pole
const Mm = 1; // Ratio of cart mass to pole mass
const strength = 15; // How strongly user input accelerates cart
const friction = 0.15; // Damping constant of left-right motion
const dt = 1e-3; // Time step
const stepsPerFrame = 50; // Number of steps before drawing a frame
const framesPerSec = 100; // Number of frames to draw each second
const stepsPerSec = stepsPerFrame * framesPerSec;
const LEFT_PUSH = -1;
const RIGHT_PUSH = 1;
const NO_PUSH = 0;

// Current state
var running = false; // true if simulation is currently running, false otherwise
var automaticMode = false; // true if Automatic Mode radio button is selected
var mouseDown = false; // true if user's mouse is pressed down on arrow
var throttle = NO_PUSH; // one of LEFT_PUSH, RIGHT_PUSH, or NO_PUSH
var x = canvas.width / 2; // x-position of cart
var xDot = 0; // time derivative of ^
var theta = 0; // angle of the pole, measuring cw from vertical
var thetaDot = 0; // time derivative of ^
var t = 0; // timesteps taken
var needToInitialize = true; // Whether ^^^^^ need to be initialized next frame
var obj = {}; // an object for user to keep track of things if they so desire
var highScore = 0; // Current high score, in seconds alive.

// Visual Elements
var defaultCanvasWidth = canvas.width;
var defaultCanvasHeight = canvas.height;
var platformY = 325;
var platformWidth = 250;
var platformLeft = (canvas.width - platformWidth) / 2;
var platformRight = platformLeft + platformWidth;
var cartWidth = 60;
var cartHeight = 40;
var wheelRadius = 5;
var bulbRadius = 10;
var poleThickness = 4;
var poleLength = l;
var arrowWidth = 40;
var arrowHeight = 40;
var fatFingerSize = 5;
var arrowY = platformY + 20;
var arrowGap = 80; // X-gap between arrow and edge of canvas

// -----------------------------
// --- rEsPoNsIvE wEb DeSiGn ---
// -----------------------------
function resizeCanvas() {
    var containerWidth = parseInt(
        window.getComputedStyle(bigContainer).getPropertyValue("width")
    )
    if (containerWidth < defaultCanvasWidth) {
        canvas.width = Math.max(containerWidth, platformWidth);
    } else {
        canvas.width = defaultCanvasWidth;
    }
    // Update some visual parameters
    platformLeft = (canvas.width - platformWidth) / 2;
    platformRight = platformLeft + platformWidth;
    arrowGap = (canvas.width/2 - arrowWidth - 2*fatFingerSize) / 2;
    x = x; // TODO update the cart position too
    // ...but seriously who is gonna resize the window during a simulation?
}
function resizeAndPaintCanvas() { resizeCanvas(); paintCanvas(); }
window.onresize = resizeAndPaintCanvas;

// Make arrows bigger if we are on a touch screen
// https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
if (isTouch) {
    canvas.height = 450;
    arrowWidth = 80;
    arrowHeight = 80;
    fatFingerSize = 10;
    arrowY = platformY + 25;
    arrowGap = 40;
}

// -----------------
// --- GAME LOOP ---
// -----------------
// The equations of motion are given in the Wikipedia article
//      https://en.wikipedia.org/wiki/Inverted_pendulum
// at the end of the "Lagrange's Equations" section. I solved for x double dot
// and theta double dot.
function doStep() {
    // Evolve forward in time for `dt` seconds, and update the state space
    // parameters `x`, `xDot`, `theta`, and `thetaDot`.
    var cos = Math.cos(theta);
    var sin = Math.sin(theta);
    var F = throttle * strength;
    var det = (l*cos**2 - l*(1+Mm));
    var xDotDot = (-l*F + l*l*sin*(thetaDot**2) - g*l*sin*cos) / det;
    var thetaDotDot = (-cos*F + l*cos*sin*(thetaDot**2) - g*sin*(1+Mm)) / det;
    // An extra term so it's not too slippery
    xDotDot -= friction * xDot;

    // Euler's method (Sorry Mosieur Verlet, you were too finnicky.)
    x += xDot * dt;
    theta += thetaDot * dt;
    xDot += xDotDot * dt;
    thetaDot += thetaDotDot * dt;
    t += 1;
}

// With some help from
// http://physics.weber.edu/schroeder/software/demos/MolecularDynamics.html
var timeoutVar = 0;
function simulate() {
    for (var step = 0; step < stepsPerFrame; step++) {
        doStep();
    }
    if (automaticMode) {
        throttle = pickAction(x, xDot, theta, thetaDot, t, obj);
    }
    if (!immortalityCheckBox.checked && !cartPoleInBounds()) {
        // The user lost the game
        stopRunning();
    } else {
        // Call itself 10 milliseconds later
        timeoutVar = window.setTimeout(simulate, 1000 / framesPerSec);
    }
    paintCanvas();
}

// Mysterious incantation that sometimes helps for smooth animation:
window.requestAnimFrame = (function(callback) {
    return (window.requestAnimationFrame || window.webkitRequestAnimationFrame 
        || window.mozRequestAnimationFrame || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / framesPerSec);
        });
})();

function cartPoleInBounds() {
    var poleTipX = x - poleLength * Math.sin(theta);
    var poleTipY = platformY - cartHeight - poleLength * Math.cos(theta);
    return (
        x > platformLeft - cartWidth / 2
        && x < platformRight + cartWidth / 2
        && poleTipY < platformY
        // && Math.abs(theta) < Math.PI / 2
        && poleTipX > 0 && poleTipX < canvas.width
    )
    // TODO make it ok if theta "wraps around" 2 pi...
}

function cartPoleAlmostDead() {
    var dist = Math.abs(x - canvas.width / 2);
    var angle = Math.abs(theta);
    var distDanger = platformWidth * 0.5 * 0.6;
    var angleDanger = Math.PI / 6;
    return (dist > distDanger || angle > angleDanger);
}

// --------------------------
// --- CHANGING PLAYSTATE ---
// --------------------------
function startStop() {
    if (!running) {
        startRunning();
    } else {
        pauseRunning();
    }
    paintCanvas();
}

var overlayText = "Press Start to Begin!"
var overlayColor = "gray";
function startRunning() {
    running = true;
    if (needToInitialize) {
        initialize();
    }
    if (!automaticMode) {
        attachListeners();
    }
    // immortalityCheckBox.disabled = true;
    // autoButton.disabled = true;
    // manualButton.disabled = true;
    startButton.value = "Pause";
    resetButton.disabled = true;
    simulate();
}

function pauseRunning() {
    running = false;
    detachListeners();
    // immortalityCheckBox.disabled = false;
    // autoButton.disabled = false;
    // manualButton.disabled = false;
    overlayText = "Simulation Paused";
    overlayColor = "gray";
    startButton.value = "Resume";
    resetButton.disabled = false;
    clearTimeout(timeoutVar);
}

function stopRunning() {
    running = false;
    detachListeners();
    needToInitialize = true;
    // immortalityCheckBox.disabled = false;
    // autoButton.disabled = false;
    // manualButton.disabled = false;
    overlayText = "You lost!";
    overlayColor = "red";
    startButton.value = "Play Again";
    resetButton.disabled = true;
    clearTimeout(timeoutVar);

    var score = t / stepsPerSec;
    if (score > highScore) {
        highScore = score;
        highScoreSpan.innerHTML = highScore.toFixed(1);
    }
}

function reset() {
    running = false;
    startButton.value = "Start";
    overlayText = "Press Start to Begin!";
    overlayColor = "gray";
    initialize();
    clearTimeout(timeoutVar);
    paintCanvas();
}

function initialize() {
    x = canvas.width / 2;
    xDot = 0;
    theta = Math.random() * 0.1 - 0.05;
    thetaDot = 0;
    t = 0;
    throttle = NO_PUSH;
    mouseDown = false;
    resetButton.disabled = true;
    needToInitialize = false;
}

// -------------
// --- GOOEY ---
// -------------
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
    if (immortalityCheckBox.checked) {
        context.fillRect(0, platformY, canvas.width, 2)
        context.fillRect(0, platformY + 4, canvas.width, 2)
    } else {
        context.fillRect(platformLeft, platformY, platformWidth, 5)
    }

    // Draw the cart
    var cartLeft = x - cartWidth / 2;
    var cartTop = platformY - cartHeight;
    if (themeSelect.value == "plain") {
        drawDefaultCart(cartLeft, cartTop);
    } else if (themeSelect.value == "gobears") {
        context.drawImage(cartImg, cartLeft, cartTop, cartWidth, cartHeight);
    }

    // Draw the pole
    context.save(); // for pole
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
        context.save(); // for flag
        context.translate(0, poleLength);
        context.rotate(Math.PI);
        context.drawImage(bulbImg, 0, 0, 100, 50);
        context.restore(); // for flag
    }

    context.restore(); // for pole

    if (!immortalityCheckBox.checked) {
        // Show user's score
        context.font = "24px Comic Sans MS";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline= "top";
        var score = t / stepsPerSec;
        context.fillText("Score: " + score.toFixed(1), canvas.width / 2, 10);

        // Flash "Danger!" if user is about to lose
        context.fillStyle = "red";
        context.textAlign = "center";
        if (cartPoleAlmostDead()) {
            if ((t * 3) % stepsPerSec < (stepsPerSec / 2)) {
                context.fillText("Danger!", canvas.width / 2, 50);
            }
        }
    }

    // Draw the left and right arrows indicating current throttle status
    function drawArrow(flip, thr) {
        // O gods of function design, how I have sinned! The arguments of
        // this function have no meaning whatsoever! Please forgive me!
        // (Is there a better way to do this...?)
        context.save();
        if (flip) {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        context.globalAlpha = (throttle == thr) ? 1 : 0.2;
        context.drawImage(arrowImg, arrowGap, arrowY, arrowWidth, arrowHeight);

        if (!automaticMode) {
            // Draw boxes around arrows to show user they can click/touch
            // TODO turn the cursor into a pointer when hovering over arrows
            context.beginPath();
            context.rect(arrowGap - fatFingerSize, arrowY, 
                         arrowWidth + 2* fatFingerSize, arrowHeight);
            context.stroke();
            context.globalAlpha = (throttle == thr) ? 0.5 : 0.05;
            context.fillStyle = "gray";
            context.fill();
        }

        context.restore();
    }

    drawArrow(false, LEFT_PUSH);
    drawArrow(true, RIGHT_PUSH);

    // Blur out the canvas if paused
    if (!running) {
        context.fillStyle = overlayColor;
        context.globalAlpha = 0.5;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;

        context.font = "32px Comic Sans MS";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.fillText(overlayText, canvas.width / 2, 40);
    }
}

// --------------------------
// --- KEYPRESS LISTENERS ---
// --------------------------
// Spacebar should start/stop the simulation
document.onkeypress = function (e) {
    e = e || window.event;
    // console.log('Key Press:' + e.keyCode);
    if (e.keyCode == 32 && document.activeElement.id == "") {
        e.preventDefault();
        startStop();
    }
};

var leftKeyCodes = [37, 72, 65]; // left arrow, h, a
var rightKeyCodes = [39, 76, 68]; // right arrow, l, d
function onKeyDown(e) {
    e = e || window.event;
    // console.log('Key Down:' + e.keyCode);
    if (leftKeyCodes.includes(e.keyCode)) {
        e.preventDefault();
        throttle = LEFT_PUSH;
    }
    if (rightKeyCodes.includes(e.keyCode)) {
        e.preventDefault();
        throttle = RIGHT_PUSH;
    }
}

function onKeyUp(e) {
    e = e || window.event;
    // console.log('Key Up:' + e.keyCode);
    if (leftKeyCodes.includes(e.keyCode) || rightKeyCodes.includes(e.keyCode)) {
        e.preventDefault();
        throttle = NO_PUSH;
    }
}

function inLeftArrowBox(x, y) {
    var d = fatFingerSize;
    return (y > arrowY - d && y < arrowY + arrowHeight + d &&
        x > arrowGap - d && x < arrowGap + arrowWidth + d)
}

function inRightArrowBox(x, y) {
    var d = fatFingerSize;
    return (y > arrowY -d && y < arrowY + arrowHeight + d &&
        x > canvas.width - arrowGap - arrowWidth - d && x < canvas.width - arrowGap + d)
}

function canvasCoordsOf(e) {
    if (e.type == "touchstart" || e.type == "touchmove") {
        // This is a touch event on the document
        var touch = e.touches[0];
        var rect = canvas.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    } else {
        // This is a mouse event on the canvas
        return { x: e.offsetX, y: e.offsetY };
    }
}

function onMouseDown(e) {
    var pos = canvasCoordsOf(e);
    // console.log('Down x: ' + pos.x + ' y: ' + pos.y);
    if (inLeftArrowBox(pos.x, pos.y)) {
        e.preventDefault();
        throttle = LEFT_PUSH;
        window.navigator.vibrate(10); // give some o' that good feedback
    }
    if (inRightArrowBox(pos.x, pos.y)) {
        e.preventDefault();
        throttle = RIGHT_PUSH;
        window.navigator.vibrate(10);
    }
    mouseDown = true;
}

function onMouseUp(e) {
    e.preventDefault();
    // console.log('Mouse up');
    if (mouseDown) {
        e.preventDefault();
        throttle = NO_PUSH;
    }
    mouseDown = false;
}

function attachListeners() {
    // console.log("Attaching listeners");
    canvas.onmousedown = onMouseDown;
    canvas.onmouseup = onMouseUp;
    canvas.onmouseout = onMouseUp;
    canvas.addEventListener('touchstart', onMouseDown);
    canvas.addEventListener('touchend', onMouseUp);
    document.onkeydown = onKeyDown;
    document.onkeyup = onKeyUp;
}

function detachListeners() {
    // console.log("Detaching listeners");
    // If the user lets go of a button while the game is not running, we want
    // that event to register correctly -- so we only detach the keydowns.
    canvas.onmousedown = null;
    // canvas.onmouseup = null;
    // canvas.onmouseout = null;
    canvas.removeEventListener('touchstart', onMouseDown);
    // canvas.removeEventListener('touchend', onMouseUp);
    document.onkeydown = null;
    // document.onkeyup = null;
}

// -------------------------
// --- ELEMENT LISTENERS ---
// -------------------------
startButton.onclick = startStop;
resetButton.onclick = reset;
themeSelect.onchange = paintCanvas;
immortalityCheckBox.onchange = function () { t = 0; paintCanvas(); }

manualButton.onchange = function () {
    advancedDiv.style.display = "none";
    automaticMode = false;
    if (running) {
        attachListeners();
    }
    paintCanvas();
}
autoButton.onchange = function () {
    advancedDiv.style.display = "inline-block";
    automaticMode = true;
    detachListeners();
    paintCanvas();
}

codeRunButton.onclick = function () {
    // The most stupidly insecure thing on this planet but whatever
    try {
        pickAction = new Function("x", "xDot", "theta", "thetaDot", codeBox.value);
        codeRunSpan.innerHTML = "Your code has been run."
        codeRunButton.disabled = true;
    } catch (err) {
        alert("Error:\n" + err.message);
    }
}
codeBox.onchange = function () {
    codeRunButton.disabled = false;
    codeRunSpan.innerHTML = "";
};
codeBox.onkeyup = codeBox.onchange;
codeBox.onpaste = codeBox.onchange;

// `x` is the cart position, measured in pixels right of the canvas border.
// `xDot` is the cart velocity, in pixels per 0.2 seconds (`1/dt*stepsPerSec`).
// `theta` is the pole angle, in radians from vertical. Clockwise is positive.
// `thetaDot` is the angular velocity of the pole, in radians per 0.2 seconds.
// `t` is the number of time steps taken so far. It is an integer.
// `obj` is any javascript object you would like. It lets you keep global state
//      between function calls.
// The function `pickAction` is called once every `stepsPerFrame` time steps.
// See the function `simulate` for the simulation logic.
pickAction = new Function(
        "x", "xDot", "theta", "thetaDot", "t", "obj", codeBox.value);

// Draw the canvas once the page is ready
window.addEventListener("load", function() {
    resizeAndPaintCanvas();
});
