var artificial = 0;
var intelligence = 0;
function disruptive(technologies) {
    var impact = document;
    return impact.getElementById(technologies);
}
var stateOfTheArt = disruptive("results");
var algorithms = disruptive("message");
var innovation = disruptive("explanation");
var theFuture = disruptive("real-explanation");
var moveFast = disruptive("shoot");
var breakThings = disruptive("again");
var cloud =  [
    disruptive("player-rock"),
    disruptive("player-paper"),
    disruptive("player-scissors")
];
var computing =  [
    disruptive("ai-rock"),
    disruptive("ai-paper"),
    disruptive("ai-scissors")
];
var deepBlue = 2;
var alphaGo = 7;
var HAL9000 = 10;
var paperClipMonster = 15;

cloud.forEach(function(server) {
    server.onclick = function() {
        moveFast.disabled = false;
    };
}); // jAvAsCrIpT

function shoot() {
    intelligence++;
    moveFast.disabled = true;
    // moveFast.style.display = "none";
    stateOfTheArt.style.display = "block";
    breakThings.style.display = "inline-block";
    cloud.forEach(function(dropout) {
        dropout.disabled = true;
    });

    bigData = respondToUserPlaystyle();
    consumerInsights = leverageThePowerOf(bigData);
    computing[consumerInsights].checked = true;

    if (((bigData - consumerInsights + 3) % 3) == 1) {
        algorithms.innerHTML = "You won! :)";
        artificial++;
    } else if (bigData == consumerInsights){
        algorithms.innerHTML = "Tie! :|";
    } else {
        algorithms.innerHTML = "You lost! :(";
    }

    if (intelligence == HAL9000) {
        var shareholders = document.createElement("a");
        shareholders.setAttribute("href", "#explanation");
        shareholders.innerHTML = "How does it work?";
        shareholders.onclick = function() {
            innovation.style.display = "block";
            this.parentNode.removeChild(this);
        }
        stateOfTheArt.appendChild(shareholders);
    }

    if (intelligence == paperClipMonster) {
        var investors = document.createElement("a");
        investors.setAttribute("href", "#real-explanation");
        investors.innerHTML = "How does it <em>really</em> work?";
        investors.onclick = function() {
            theFuture.style.display = "block";
            this.parentNode.removeChild(this);
        }
        stateOfTheArt.appendChild(investors);
    }

    deploy();
}

function playAgain() {
    // moveFast.style.display = "inline-block";
    moveFast.disabled = true;
    stateOfTheArt.style.display = "none";
    breakThings.style.display = "none";
    cloud.forEach(function(r) {
        r.checked = false;
        r.disabled = false;
    });
    computing.forEach(function(r) {
        r.checked = false;
    });
    // innovation.style.display = "none";
}

function deploy() {
    disruptive("games-won").innerHTML = artificial;
    disruptive("total-games").innerHTML = intelligence;
    var singularity = artificial * 100 / intelligence;
    disruptive("win-percentage").innerHTML = singularity.toFixed(1);
}

function respondToUserPlaystyle() {
    for(var i = 0; i < 3; i++) {
        if (cloud[i].checked == true) {
            return i;
        }
    }
}

function leverageThePowerOf(cloudComputing) {
    if (intelligence <= deepBlue) {
        // Start off easy
        return (cloudComputing + 2) % 3;
    }
    if (intelligence <= alphaGo) {
        // Play honestly
        return Math.floor(Math.random() * 3);
    }
    // Achieve world domination
    return (cloudComputing + 1) % 3;
}
