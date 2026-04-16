const SETTINGS_STORAGE_KEY = "pomodoro.settings.v1";
const DEFAULT_SETTINGS = Object.freeze({
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakEvery: 4,
    enableBrowserNotifications: false,
    autoStartNextSession: false
});

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

const timeElement = document.getElementById("time");
const btnPlayElement = document.getElementById("btnPlay");
const btnFocusElement = document.getElementById("btnFocus");
const btnBreakElement = document.getElementById("btnBreak");
const btnSettingsElement = document.getElementById("btnSettings");
const notiElement = document.getElementById("noti");
const sessionCountElement = document.getElementById("sessionCount");
const btnSoundElement = document.getElementById("btnSound");
const soundIconElement = document.getElementById("soundIcon");
const alertAudioElement = document.getElementById("audio");
const buttonSoundElement = document.getElementById("buttonSound");
const pomodoroElement = document.getElementById("pomodoro");
const settingsModalElement = document.getElementById("settingsModal");
const settingsPanelElement = document.getElementById("settingsPanel");
const closeSettingsButtonElement = document.getElementById("closeSettingsBtn");
const settingsFormElement = document.getElementById("settingsForm");
const focusMinutesInputElement = document.getElementById("focusMinutesInput");
const shortBreakMinutesInputElement = document.getElementById("shortBreakMinutesInput");
const longBreakMinutesInputElement = document.getElementById("longBreakMinutesInput");
const longBreakEveryInputElement = document.getElementById("longBreakEveryInput");
const enableNotificationsInputElement = document.getElementById("enableNotificationsInput");
const autoStartNextInputElement = document.getElementById("autoStartNextInput");
const resetSettingsButtonElement = document.getElementById("resetSettingsBtn");
const settingsMessageElement = document.getElementById("settingsMessage");

let settings = loadSettings();
let currentMode = "focus";
let totalSeconds = settings.focusMinutes * 60;
let completedFocusSessions = 0;
let countDownInterval = null;
let isCountDown = false;
let isSoundEnabled = true;

function clampNumber(value, min, max, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, Math.round(parsed)));
}

function sanitizeSettings(rawSettings) {
    const source = rawSettings || {};

    return {
        focusMinutes: clampNumber(source.focusMinutes, 1, 180, DEFAULT_SETTINGS.focusMinutes),
        shortBreakMinutes: clampNumber(source.shortBreakMinutes, 1, 60, DEFAULT_SETTINGS.shortBreakMinutes),
        longBreakMinutes: clampNumber(source.longBreakMinutes, 1, 90, DEFAULT_SETTINGS.longBreakMinutes),
        longBreakEvery: clampNumber(source.longBreakEvery, 2, 12, DEFAULT_SETTINGS.longBreakEvery),
        enableBrowserNotifications: Boolean(source.enableBrowserNotifications),
        autoStartNextSession: Boolean(source.autoStartNextSession)
    };
}

function loadSettings() {
    try {
        const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (!storedSettings) {
            return { ...DEFAULT_SETTINGS };
        }

        const parsedSettings = JSON.parse(storedSettings);
        return sanitizeSettings(parsedSettings);
    } catch (error) {
        return { ...DEFAULT_SETTINGS };
    }
}

function saveSettings(nextSettings) {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    } catch (error) {}
}

function isNotificationSupported() {
    return typeof Notification !== "undefined";
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;
    return minutes.toString().padStart(2, "0") + ":" + remainSeconds.toString().padStart(2, "0");
}

function getDurationByMode(mode) {
    if (mode === "focus") {
        return settings.focusMinutes * 60;
    }

    if (mode === "longBreak") {
        return settings.longBreakMinutes * 60;
    }

    return settings.shortBreakMinutes * 60;
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

function updateSettingsInputs() {
    if (focusMinutesInputElement) {
        focusMinutesInputElement.value = settings.focusMinutes;
    }

    if (shortBreakMinutesInputElement) {
        shortBreakMinutesInputElement.value = settings.shortBreakMinutes;
    }

    if (longBreakMinutesInputElement) {
        longBreakMinutesInputElement.value = settings.longBreakMinutes;
    }

    if (longBreakEveryInputElement) {
        longBreakEveryInputElement.value = settings.longBreakEvery;
    }

    if (enableNotificationsInputElement) {
        enableNotificationsInputElement.checked = settings.enableBrowserNotifications;
    }

    if (autoStartNextInputElement) {
        autoStartNextInputElement.checked = settings.autoStartNextSession;
    }
}

function showSettingsMessage(message, isError) {
    if (!settingsMessageElement) {
        return;
    }

    settingsMessageElement.textContent = message;
    settingsMessageElement.style.color = isError ? "#FFD9D9" : "#FFFFFF";
}

function isSettingsModalOpen() {
    return Boolean(settingsModalElement) && !settingsModalElement.hidden;
}

function openSettingsModal() {
    if (!settingsModalElement) {
        return;
    }

    settingsModalElement.hidden = false;
    document.body.classList.add("modal-open");

    if (btnSettingsElement) {
        btnSettingsElement.setAttribute("aria-expanded", "true");
    }

    if (focusMinutesInputElement) {
        focusMinutesInputElement.focus();
        focusMinutesInputElement.select();
    }
}

function closeSettingsModal(restoreFocus) {
    if (!settingsModalElement) {
        return;
    }

    settingsModalElement.hidden = true;
    document.body.classList.remove("modal-open");

    if (btnSettingsElement) {
        btnSettingsElement.setAttribute("aria-expanded", "false");
    }

    if (restoreFocus && btnSettingsElement) {
        btnSettingsElement.focus();
    }
}

function applyTheme(mode) {
    const isBreakMode = mode !== "focus";
    const palette = isBreakMode ? THEME_COLORS.break : THEME_COLORS.focus;

    document.body.style.background = palette.body;
    pomodoroElement.style.background = palette.card;
    btnPlayElement.style.color = palette.body;
    btnFocusElement.classList.toggle("active", mode === "focus");
    btnBreakElement.classList.toggle("active", isBreakMode);

    if (settingsPanelElement) {
        settingsPanelElement.style.backgroundColor = palette.card;
    }
}

async function resolveNotificationPreference(nextSettings) {
    if (!nextSettings.enableBrowserNotifications) {
        return { settings: nextSettings, warning: "" };
    }

    if (!isNotificationSupported()) {
        return {
            settings: { ...nextSettings, enableBrowserNotifications: false },
            warning: "Settings saved, but browser notifications are not supported."
        };
    }

    if (Notification.permission === "granted") {
        return { settings: nextSettings, warning: "" };
    }

    if (Notification.permission === "denied") {
        return {
            settings: { ...nextSettings, enableBrowserNotifications: false },
            warning: "Settings saved, but notifications are blocked by browser permission."
        };
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            return { settings: nextSettings, warning: "" };
        }

        return {
            settings: { ...nextSettings, enableBrowserNotifications: false },
            warning: "Settings saved, but notification permission was not granted."
        };
    } catch (error) {
        return {
            settings: { ...nextSettings, enableBrowserNotifications: false },
            warning: "Settings saved, but notification permission request failed."
        };
    }
}

function sendBrowserNotification(completedMode, nextMode) {
    if (!settings.enableBrowserNotifications || !isNotificationSupported() || Notification.permission !== "granted") {
        return;
    }

    const completedLabel = getModeLabel(completedMode);
    const nextLabel = getModeLabel(nextMode);
    const autoStartText = settings.autoStartNextSession
        ? "Started automatically."
        : "Press START to begin.";

    try {
        new Notification(completedLabel + " complete", {
            body: "Now: " + nextLabel + ". " + autoStartText,
            icon: "imgs/tomato.png"
        });
    } catch (error) {}
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
    const completedMode = currentMode;
    stopTimer();
    safePlay(alertAudioElement);

    let nextMode = "focus";

    if (completedMode === "focus") {
        completedFocusSessions += 1;
        updateSessionCount();
        const shouldLongBreak = completedFocusSessions % settings.longBreakEvery === 0;
        nextMode = shouldLongBreak ? "longBreak" : "shortBreak";
    }

    setMode(nextMode);
    sendBrowserNotification(completedMode, nextMode);

    if (settings.autoStartNextSession) {
        startTimer();
    }
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

function readSettingsFromInputs() {
    return {
        focusMinutes: focusMinutesInputElement ? focusMinutesInputElement.value : settings.focusMinutes,
        shortBreakMinutes: shortBreakMinutesInputElement ? shortBreakMinutesInputElement.value : settings.shortBreakMinutes,
        longBreakMinutes: longBreakMinutesInputElement ? longBreakMinutesInputElement.value : settings.longBreakMinutes,
        longBreakEvery: longBreakEveryInputElement ? longBreakEveryInputElement.value : settings.longBreakEvery,
        enableBrowserNotifications: enableNotificationsInputElement ? enableNotificationsInputElement.checked : settings.enableBrowserNotifications,
        autoStartNextSession: autoStartNextInputElement ? autoStartNextInputElement.checked : settings.autoStartNextSession
    };
}

function hasAdjustedValues(rawSettings, sanitizedSettings) {
    return Number(rawSettings.focusMinutes) !== sanitizedSettings.focusMinutes ||
        Number(rawSettings.shortBreakMinutes) !== sanitizedSettings.shortBreakMinutes ||
        Number(rawSettings.longBreakMinutes) !== sanitizedSettings.longBreakMinutes ||
        Number(rawSettings.longBreakEvery) !== sanitizedSettings.longBreakEvery ||
        Boolean(rawSettings.enableBrowserNotifications) !== sanitizedSettings.enableBrowserNotifications ||
        Boolean(rawSettings.autoStartNextSession) !== sanitizedSettings.autoStartNextSession;
}

function applySettings(nextSettings, message, isError) {
    settings = sanitizeSettings(nextSettings);
    saveSettings(settings);
    stopTimer();
    totalSeconds = getDurationByMode(currentMode);
    updateSettingsInputs();
    updateTime();

    if (message) {
        showSettingsMessage(message, Boolean(isError));
    }
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

if (btnSettingsElement) {
    btnSettingsElement.addEventListener("click", function () {
        safePlay(buttonSoundElement);
        openSettingsModal();
    });
}

if (closeSettingsButtonElement) {
    closeSettingsButtonElement.addEventListener("click", function () {
        safePlay(buttonSoundElement);
        closeSettingsModal(true);
    });
}

if (settingsModalElement) {
    settingsModalElement.addEventListener("click", function (event) {
        if (event.target === settingsModalElement) {
            closeSettingsModal(false);
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isSettingsModalOpen()) {
        closeSettingsModal(true);
    }
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

if (settingsFormElement) {
    settingsFormElement.addEventListener("submit", async function (event) {
        event.preventDefault();
        safePlay(buttonSoundElement);

        const rawSettings = readSettingsFromInputs();
        const sanitizedSettings = sanitizeSettings(rawSettings);
        const adjusted = hasAdjustedValues(rawSettings, sanitizedSettings);
        const notificationResult = await resolveNotificationPreference(sanitizedSettings);
        const finalSettings = notificationResult.settings;

        if (notificationResult.warning) {
            applySettings(finalSettings, notificationResult.warning, true);
            return;
        }

        applySettings(finalSettings, adjusted ? "Saved with adjusted limits." : "Settings saved.", false);
    });
}

if (resetSettingsButtonElement) {
    resetSettingsButtonElement.addEventListener("click", function () {
        safePlay(buttonSoundElement);
        applySettings(DEFAULT_SETTINGS, "Settings reset to default values.");
    });
}

saveSettings(settings);
notiElement.textContent = getNotificationText(currentMode);
updateSessionCount();
updateSettingsInputs();
applyTheme(currentMode);
updateSoundButton();
updateTime();
updatePlayButton();

if (btnSettingsElement) {
    btnSettingsElement.setAttribute("aria-expanded", "false");
}