// Variables for focus time and break time setting
let focusMinutes = 25;
let focusSeconds = 0;
let breakMinutes = 5;
let breakSeconds = 0;

let initialSeconds = focusMinutes * 60 + focusSeconds;
let totalSeconds = initialSeconds;

let countDownInterval;
let isCountDown = false;

let isSoundPlaying = false;

let playlist = [];
let currentIndex = 0;
let audioElement = new Audio();

// Show timer
function showTime() {
    updateTime();
}

// Countdown Logic
function countDown() {
    totalSeconds -= 1;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    document.getElementById("time").textContent = minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
    if (totalSeconds <= 0) {
        clearInterval(countDownInterval);
        isCountDown = false;
        totalSeconds = initialSeconds;
        showTime();
        document.getElementById("btnPlay").textContent = "START";
    }
}

// 
function updateTime() {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    document.getElementById("time").textContent = minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

// Switch to focus or break tab
function switchTab(buttonId) {
    if (isCountDown) {
        isCountDown = false;
        clearInterval(countDownInterval);
        document.getElementById("btnPlay").textContent = "START";
    }
    if (buttonId === "btnBreak") {
        // Change to break time
        initialSeconds = breakMinutes * 60 + breakSeconds;
        totalSeconds = initialSeconds;
        showTime();
        // Change background and button text color
        document.body.style.background = "#38858A";
        document.getElementById("pomodoro").style.background = "#4C9196";
        document.getElementById("btnPlay").style.color = "#38858A";
        // Change notification
        document.getElementById("noti").textContent = "Time for a break!";
        // Add .active
        document.getElementById("btnBreak").classList.add("active");
        document.getElementById("btnFocus").classList.remove("active");
    } else if (buttonId === "btnFocus") {
        // Change to focus time
        initialSeconds = focusMinutes * 60 + focusSeconds;
        totalSeconds = initialSeconds;
        showTime();
        // Change background and button text color
        document.body.style.background = "#BA4949";
        document.getElementById("pomodoro").style.background = "#C15C5C";
        document.getElementById("btnPlay").style.color = "#BA4949";
        // Change notification
        document.getElementById("noti").textContent = "Time to focus!";
        // Add .active
        document.getElementById("btnFocus").classList.add("active");
        document.getElementById("btnBreak").classList.remove("active");
    }
}

// Play/pause button functionality
document.getElementById("btnPlay").addEventListener("click", function() {
    if (isCountDown) {
        isCountDown = false;
        clearInterval(countDownInterval);
        document.getElementById("btnPlay").textContent = "START";
    } else {
        isCountDown = true;
        countDownInterval = setInterval(countDown, 1000);
        document.getElementById("btnPlay").textContent = "STOP";
    }
});

// Switch tab button functionality
document.getElementById("btnFocus").addEventListener("click", function() {switchTab("btnFocus")});
document.getElementById("btnBreak").addEventListener("click", function() {switchTab("btnBreak")});

// Click sound for button
document.getElementById("btnPlay").addEventListener("click", function() {
    document.getElementById("buttonSound").play();
});

// Music player functionality
document.getElementById("play-pause-btn").addEventListener("click", function() {

});



// Initiate
// Show timer on screen
showTime();
// Default active button (Focus)
document.getElementById("btnFocus").classList.add("active");




