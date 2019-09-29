var doors = [];
var doorDiv = document.getElementById("door-div");
var scoreDiv = document.getElementById("score");
var openDoorFile = "media/open.png";
var closedDoorFile = "media/closed.png";
var gertrudeFile = "media/gertrude.mp3";
var ticker;
var dt = 100; // in milliseconds
var n = 0; // number of game ticks so far
var freq = 0.05;
var playing = false;
var score = 0;

function togglePlay() {
    if (playing == false) {
        playing = true;
        beginPlay();
    } else {
        playing = false;
        endPlay();
    }
}

function beginPlay() {
    document.getElementById("togglePlay").innerHTML = "Stop this madness!!";

    makeNewDoor();

    scoreDiv.style.display = "block";
    scoreDiv.innerHTML = "Score: 0";
    ticker = setInterval(tick, dt);
}

function endPlay() {
    doors = [];
    document.getElementById("togglePlay").innerHTML = "Click to Play!";
    while (doorDiv.firstChild) {
        doorDiv.removeChild(doorDiv.firstChild);
    }
    clearInterval(ticker);

    score = 0;
    scoreDiv.style.display = "none";
}

function makeNewDoor() {
    var door = document.createElement("img");
    door.src = closedDoorFile;
    door.onclick = function() {
        close(door);
    }
    var audio = new Audio(gertrudeFile);
    audio.loop = true;

    doors.push(door);

    door.appendChild(audio);
    doorDiv.appendChild(door);
}

function close(door) {
    door.src = closedDoorFile;
    door.style.cursor = "default";
    // door.onclick = function() {
    //     return;
    // }

    var audio = door.children[0];
    audio.pause();
    audio.currentTime = 0;

    score += 1;
    scoreDiv.innerHTML = "Score: " + score;

    if (doors.length < 21) {
        makeNewDoor();
    }
}

function open(door) {
    door.src = openDoorFile;
    door.style.cursor = "pointer";
    door.onclick = function() {
        close(door);
    }
}

function tick() {
    n += 1;
    if (Math.random() < freq) {
        var i = Math.floor(Math.random() * doors.length);
        var door = doors[i];
        var audio = doors[i].children[0];

        open(door);
        audio.play();
    }
}
