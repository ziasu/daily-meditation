const YEAR = '2025';
let timer;
let timeLeft;
let isRunning = false;
let currentAudio = null;
let initialDuration = 0;

function handleTimer(minutes) {
    // Check if user is logged in
    if (!auth.currentUser) {
        document.getElementById('authError').textContent = 'Please login first';
        return;
    }

    if (isRunning) return;
    
    initialDuration = minutes;
    timeLeft = minutes * 60;
    isRunning = true;
    
    // Update UI
    document.getElementById('stopButton').disabled = false;
    document.getElementById('fiveMinButton').disabled = true;
    document.getElementById('tenMinButton').disabled = true;
    document.getElementById('tenSecButton').disabled = true;
    
    // Handle music
    if (document.getElementById('musicToggle').checked) {
        // For 10-second timer, use 5-min music
        const musicId = minutes < 1 || minutes === 5 ? 'fiveMinMusic' : 'tenMinMusic';
        currentAudio = document.getElementById(musicId);
        if (currentAudio) {
            currentAudio.currentTime = 0; // Reset audio to start
            currentAudio.play().catch(e => console.error('Error playing audio:', e));
        } else {
            console.error(`Audio element ${musicId} not found`);
        }
    }
    
    updateTimerDisplay();
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
    } else {
        completeMeditation();
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

function stopMeditation() {
    if (!isRunning) return;
    
    const completedSeconds = Math.round((initialDuration * 60) - timeLeft);
    
    clearInterval(timer);
    resetTimer();
    
    if (completedSeconds > 30) { // Only save if meditated for more than 30 seconds
        saveMeditationTime(completedSeconds);
    }
    
    // Stop any playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
}

function completeMeditation() {
    clearInterval(timer);
    resetTimer();
    
    // Save the completed meditation time to Firebase
    const completedSeconds = Math.round(initialDuration * 60);
    saveMeditationTime(completedSeconds);
    
    // Stop any playing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
}

function resetTimer() {
    isRunning = false;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    document.getElementById('stopButton').disabled = true;
    document.getElementById('fiveMinButton').disabled = false;
    document.getElementById('tenMinButton').disabled = false;
    document.getElementById('tenSecButton').disabled = false;
    
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
}

function loadTotalTime() {
    // We don't need this anymore as Firebase handles it
    // The total time is loaded in firebase-config.js when user logs in
}

function saveTotalTime(seconds) {
    // Save to Firebase instead of localStorage
    saveMeditationTime(seconds);
}

function clearTotalTime() {
    if (auth.currentUser) {
        clearMeditationTime();
        updateTotalTimeDisplay(0);
    }
} 