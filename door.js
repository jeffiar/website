var N_DOORS = 5;
var doors = [];
var audios = [];
var doorDiv = document.getElementById("door-div");
var openDoorFile = "media/open.png";
var closedDoorFile = "media/closed.png";
var gertrudeFile = "media/gertrude.mp3";
var ticker;
var dt = 100; // in milliseconds
var n = 0; // number of game ticks so far
var freq = 0.05;
var playing = false;

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

    for(var i = 0; i < N_DOORS; i++) {
        var door = makeNewDoor();
        var audio = new Audio(gertrudeFile);
        audio.loop = true;

        doors.push(door);
        audios.push(audio);

        door.appendChild(audio);
        doorDiv.appendChild(door);
    }

    ticker = setInterval(tick, dt);
}

function endPlay() {
    document.getElementById("togglePlay").innerHTML = "Click to Play!";
    while (doorDiv.firstChild) {
        doorDiv.removeChild(doorDiv.firstChild);
    }
    clearInterval(ticker);
}

function makeNewDoor() {
    var door = document.createElement("img");
    door.src = closedDoorFile;
    door.onclick = function() {
        close(door);
    }
    return door;
}

function close(door) {
    door.src = closedDoorFile;
    door.style.cursor = "default";

    var audio = door.children[0];
    audio.pause();
    audio.currentTime = 0;
}

function open(door) {
    door.src = openDoorFile;
    door.style.cursor = "pointer";
}

function tick() {
    n += 1;
    // if (n < 20) {
    //     return;
    // }
    if (Math.random() < freq) {
        var i = Math.floor(Math.random() * N_DOORS);
        var door = doors[i];
        var audio = doors[i].children[0];

        open(door);
        audio.play();
    }
}
