const FOCUS_DURATION_SECONDS = 25 * 60;
const SHORT_BREAK_DURATION_SECONDS = 5 * 60;
const LONG_BREAK_DURATION_SECONDS = 15 * 60;
const LONG_BREAK_EVERY = 4;

const THEME_COLORS = {
    focus: {
        body: "#BA4949",
        card: "#C15C5C"
    },
    break: {
        body: "#38858A",
        card: "#4C9196"
    }
};

let currentMode = "focus";
let totalSeconds = FOCUS_DURATION_SECONDS;
let completedFocusSessions = 0;
let countDownInterval = null;
let isCountDown = false;
let isSoundEnabled = true;

const timeElement = document.getElementById("time");
const btnPlayElement = document.getElementById("btnPlay");
const btnFocusElement = document.getElementById("btnFocus");
const btnBreakElement = document.getElementById("btnBreak");
const notiElement = document.getElementById("noti");
const sessionCountElement = document.getElementById("sessionCount");
const btnSoundElement = document.getElementById("btnSound");
const soundIconElement = document.getElementById("soundIcon");
const alertAudioElement = document.getElementById("audio");
const buttonSoundElement = document.getElementById("buttonSound");
const pomodoroElement = document.getElementById("pomodoro");
const fileInputLabelElement = document.getElementById("file-input-label");
const musicPlayerElement = document.getElementById("music-player");

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;
    return minutes.toString().padStart(2, "0") + ":" + remainSeconds.toString().padStart(2, "0");
}

function getDurationByMode(mode) {
    if (mode === "focus") {
        return FOCUS_DURATION_SECONDS;
    }

    if (mode === "longBreak") {
        return LONG_BREAK_DURATION_SECONDS;
    }

    return SHORT_BREAK_DURATION_SECONDS;
}

function getModeLabel(mode) {
    if (mode === "focus") {
        return "Focus";
    }

    if (mode === "longBreak") {
        return "Long Break";
    }

    return "Break";
}

function getNotificationText(mode) {
    if (mode === "focus") {
        return "Time to focus!";
    }

    if (mode === "longBreak") {
        return "Great work! Time for a long break!";
    }

    return "Time for a break!";
}

function safePlay(audioElement) {
    if (!audioElement || !isSoundEnabled) {
        return;
    }

    audioElement.currentTime = 0;
    const playPromise = audioElement.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
    }
}

function updateTime() {
    timeElement.textContent = formatTime(totalSeconds);
    document.title = formatTime(totalSeconds) + " - " + getModeLabel(currentMode) + " | Pomodoro";
}

function updatePlayButton() {
    btnPlayElement.textContent = isCountDown ? "PAUSE" : "START";
}

function updateSessionCount() {
    if (!sessionCountElement) {
        return;
    }

    sessionCountElement.textContent = "Completed focus sessions: " + completedFocusSessions;
}

function updateSoundButton() {
    if (!soundIconElement || !btnSoundElement) {
        return;
    }

    soundIconElement.classList.toggle("fa-volume-up", isSoundEnabled);
    soundIconElement.classList.toggle("fa-volume-mute", !isSoundEnabled);
    btnSoundElement.setAttribute("aria-label", isSoundEnabled ? "Mute sounds" : "Unmute sounds");
}

function applyTheme(mode) {
    const isBreakMode = mode !== "focus";
    const palette = isBreakMode ? THEME_COLORS.break : THEME_COLORS.focus;

    document.body.style.background = palette.body;
    pomodoroElement.style.background = palette.card;
    btnPlayElement.style.color = palette.body;
    btnFocusElement.classList.toggle("active", mode === "focus");
    btnBreakElement.classList.toggle("active", isBreakMode);

    if (fileInputLabelElement) {
        fileInputLabelElement.style.backgroundColor = palette.card;
    }

    if (musicPlayerElement) {
        musicPlayerElement.style.backgroundColor = palette.card;
    }
}

function stopTimer() {
    if (countDownInterval) {
        clearInterval(countDownInterval);
        countDownInterval = null;
    }

    isCountDown = false;
    updatePlayButton();
}

function startTimer() {
    if (isCountDown) {
        return;
    }

    isCountDown = true;
    updatePlayButton();
    countDownInterval = setInterval(countDown, 1000);
}

function setMode(mode) {
    stopTimer();
    currentMode = mode;
    totalSeconds = getDurationByMode(mode);
    notiElement.textContent = getNotificationText(mode);
    applyTheme(mode);
    updateTime();
}

function handleSessionComplete() {
    stopTimer();
    safePlay(alertAudioElement);

    if (currentMode === "focus") {
        completedFocusSessions += 1;
        updateSessionCount();
        const shouldLongBreak = completedFocusSessions % LONG_BREAK_EVERY === 0;
        setMode(shouldLongBreak ? "longBreak" : "shortBreak");
        return;
    }

    setMode("focus");
}

function countDown() {
    totalSeconds -= 1;

    if (totalSeconds <= 0) {
        totalSeconds = 0;
        updateTime();
        handleSessionComplete();
        return;
    }

    updateTime();
}

btnPlayElement.addEventListener("click", function () {
    safePlay(buttonSoundElement);

    if (isCountDown) {
        stopTimer();
        return;
    }

    startTimer();
});

btnFocusElement.addEventListener("click", function () {
    safePlay(buttonSoundElement);
    setMode("focus");
});

btnBreakElement.addEventListener("click", function () {
    safePlay(buttonSoundElement);
    setMode("shortBreak");
});

btnSoundElement.addEventListener("click", function () {
    isSoundEnabled = !isSoundEnabled;
    updateSoundButton();

    if (!isSoundEnabled) {
        if (alertAudioElement) {
            alertAudioElement.pause();
        }

        if (buttonSoundElement) {
            buttonSoundElement.pause();
        }
    }
});

notiElement.textContent = getNotificationText(currentMode);
updateSessionCount();
applyTheme(currentMode);
updateSoundButton();
updateTime();
updatePlayButton();