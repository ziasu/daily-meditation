const YEAR = '2025';
let totalSeconds = 0;
let timer;
let timeLeft;
let isRunning = false;
let currentAudio = null;
let initialDuration = 0;

function handleTimer(duration) {
    if (isRunning) return;
    
    initialDuration = duration;
    timeLeft = duration * 60;
    isRunning = true;
    
    // Update UI
    document.getElementById('stopButton').disabled = false;
    document.getElementById('fiveMinButton').disabled = true;
    document.getElementById('tenMinButton').disabled = true;
    document.getElementById('tenSecButton').disabled = true;
    
    // Handle music
    if (document.getElementById('musicToggle').checked) {
        // For 10-second timer, use 5-min music
        const musicId = duration < 1 || duration === 5 ? 'fiveMinMusic' : 'tenMinMusic';
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
        saveTotalTime(completedSeconds);
    }
}

function completeMeditation() {
    clearInterval(timer);
    resetTimer();
    saveTotalTime(Math.round(initialDuration * 60));
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
    try {
        const savedSeconds = localStorage.getItem(`meditation_seconds_${YEAR}`);
        totalSeconds = parseInt(savedSeconds) || 0;
        updateTotalTimeDisplay();
    } catch (error) {
        console.error('Error loading data:', error);
        totalSeconds = 0;
        updateTotalTimeDisplay();
    }
}

function saveTotalTime(seconds) {
    try {
        totalSeconds += seconds;
        localStorage.setItem(`meditation_seconds_${YEAR}`, totalSeconds);
        updateTotalTimeDisplay();
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function clearTotalTime() {
    try {
        totalSeconds = 0;
        localStorage.setItem(`meditation_seconds_${YEAR}`, 0);
        updateTotalTimeDisplay();
    } catch (error) {
        console.error('Error clearing data:', error);
    }
}

function updateTotalTimeDisplay() {
    const totalTimeElement = document.getElementById('totalTime');
    totalTimeElement.textContent = `Total Meditation in 2025: ${totalSeconds} seconds`;
}

// Initialize when page loads
window.addEventListener('load', loadTotalTime); 