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
        // Update this line to use 5-min music for 1-min and 5-min sessions
        const musicId = minutes <= 5 ? 'fiveMinMusic' : 'tenMinMusic';
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
    
    const completedMinutes = Math.floor((initialDuration * 60 - timeLeft) / 60);
    
    clearInterval(timer);
    resetTimer();
    
    if (completedMinutes >= 1) { // Only save if at least 1 minute
        saveMeditationTime(completedMinutes);
    }
}

function completeMeditation() {
    // Clear the timer first
    clearInterval(timer);
    resetTimer();
    
    // Save the meditation time in minutes
    console.log('Completing meditation with minutes:', initialDuration);
    saveMeditationTime(initialDuration);
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
    }
} 