// Variables for focus time and break time settings
let focusMinutes = 25;
let focusSeconds = 0;
let breakMinutes = 5;
let breakSeconds = 0;

let initialSeconds = focusMinutes * 60 + focusSeconds;
let totalSeconds = initialSeconds;

let countDownInterval;
let isCountDown = false;

function showTime() {
    updateTime();
}

// Update timer display
function updateTime() {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    document.getElementById("time").textContent = minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
}

// Countdown logic
function countDown() {
    totalSeconds -= 1;
    updateTime();
    if (totalSeconds <= 0) {
        clearInterval(countDownInterval);
        isCountDown = false;
        totalSeconds = initialSeconds;
        updateTime();
        document.getElementById("btnPlay").textContent = "START";
        if (document.getElementById("audio")) {
            document.getElementById("audio").play();
        }
    }
}

// Switch between focus and break time
function switchTab(buttonId) {
    if (isCountDown) {
        isCountDown = false;
        clearInterval(countDownInterval);
        document.getElementById("btnPlay").textContent = "START";
    }
    if (buttonId === "btnBreak") {
        initialSeconds = breakMinutes * 60 + breakSeconds;
        document.body.style.background = "#38858A";
        document.getElementById("pomodoro").style.background = "#4C9196";
        document.getElementById("btnPlay").style.color = "#38858A";
        document.getElementById("noti").textContent = "Time for a break!";
        document.getElementById("btnBreak").classList.add("active");
        document.getElementById("btnFocus").classList.remove("active");
        document.getElementById("file-input-label").style.backgroundColor = "#4C9196";
        document.getElementById("music-player").style.backgroundColor = "#4C9196";
    } else if (buttonId === "btnFocus") {
        initialSeconds = focusMinutes * 60 + focusSeconds;
        document.body.style.background = "#BA4949";
        document.getElementById("pomodoro").style.background = "#C15C5C";
        document.getElementById("btnPlay").style.color = "#BA4949";
        document.getElementById("noti").textContent = "Time to focus!";
        document.getElementById("btnFocus").classList.add("active");
        document.getElementById("btnBreak").classList.remove("active");
        document.getElementById("file-input-label").style.backgroundColor = "#C15C5C";
        document.getElementById("music-player").style.backgroundColor = "#C15C5C";
        document.getElementById("music-player").style.backgroundColor = "#C15C5C";
    }
    totalSeconds = initialSeconds;
    updateTime();
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

// Call showTime() to show timer on screen
showTime();
// Set active for default focus tab
document.getElementById("btnFocus").classList.add("active");