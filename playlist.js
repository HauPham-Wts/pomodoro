const playlist = document.getElementById("playlist");
let files = [];
let currentAudio = null;
let currentPlayingFileName;
let isPlaying = false;

function handleFiles(selectedFile) {
    for (const file of selectedFile) {
        if (file.type.startsWith("audio/")) {
            files.push(file);
            addToPlaylist(file.name);
        }
    }
}

function addToPlaylist(fileName) {
    const li = document.createElement("li");
    const music_icon = document.createElement("i");
    const textSpan = document.createElement("span");
    const deleterBtn = document.createElement("i");

    textSpan.textContent = fileName;

    li.appendChild(music_icon);
    li.appendChild(textSpan);
    li.appendChild(deleterBtn);

    li.addEventListener("click", function() {
        playSong(fileName);
    });

    playlist.appendChild(li);

    music_icon.className = "fas fa-music";
    deleterBtn.className = "fas fa-trash";
    deleterBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        if (currentAudio && currentPlayingFileName === fileName) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
            currentPlayingFileName = null;
            document.getElementById("music-name").textContent = "No music playing";
        }
        li.remove();
    });
}

function playSong(fileName) {
    // Stop current song
    if (currentAudio) {
        currentAudio.pause();
        isPlaying = false;
        currentAudio.currentTime = 0;
    }
    const file = files.find(f => f.name === fileName);
    if (file) {
        const fileUrl = URL.createObjectURL(file);
        currentAudio = new Audio(fileUrl);
        isPlaying = true;
        currentAudio.play();
        currentPlayingFileName = fileName;
        document.getElementById("music-name").textContent = fileName;

        // Clear URL object after song play
        currentAudio.addEventListener("play", () => URL.revokeObjectURL(fileUrl));
    }
}

// File input button functionality
document.getElementById("fileInput").addEventListener("change", function() {
    handleFiles(event.target.files);
});

// Play/pause current song
document.getElementById("music-player").addEventListener("click", function() {
    if (isPlaying) {
        isPlaying = false;
        currentAudio.pause();
    } else {
        isPlaying = true;
        currentAudio.play();
    }
});

