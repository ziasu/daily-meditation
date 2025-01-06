let timeLeft = 0;
let timerId = null;
let selectedMinutes = 0;
const YEAR = '2025';
let totalMeditationMinutes = 0;

function fetchMeditationData() {
    try {
        const savedMinutes = localStorage.getItem(`meditation_minutes_${YEAR}`);
        totalMeditationMinutes = parseInt(savedMinutes) || 0;
        displayTotalTime();
    } catch (error) {
        totalMeditationMinutes = 0;
        displayTotalTime();
    }
}

function updateMeditationData(minutes) {
    try {
        totalMeditationMinutes += minutes;
        localStorage.setItem(`meditation_minutes_${YEAR}`, totalMeditationMinutes);
        displayTotalTime();
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

window.addEventListener('load', fetchMeditationData);

function updateTotalTime(minutes) {
    updateMeditationData(minutes);
}

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const stopButton = document.getElementById('stopButton');
const musicToggle = document.getElementById('musicToggle');
const fiveMinMusic = document.getElementById('fiveMinMusic');
const tenMinMusic = document.getElementById('tenMinMusic');
let currentMusic = null;
let activeButton = null;

function handleTimer(minutes) {
    const button = minutes === 5 ? document.getElementById('fiveMinButton') : document.getElementById('tenMinButton');
    
    if (timerId !== null && activeButton === button) {
        // If same button clicked while running, pause the meditation
        clearInterval(timerId);
        timerId = null;
        if (currentMusic) {
            currentMusic.pause();
        }
        button.textContent = `${minutes} Minutes`;
        stopButton.disabled = false;
    } else {
        // If different button or starting new meditation
        if (timerId !== null) {
            // Clear existing meditation if any
            clearInterval(timerId);
            if (currentMusic) {
                currentMusic.pause();
                currentMusic.currentTime = 0;
            }
            if (activeButton) {
                activeButton.textContent = `${activeButton === document.getElementById('fiveMinButton') ? '5' : '10'} Minutes`;
            }
        }
        
        selectedMinutes = minutes;
        timeLeft = minutes * 60;
        currentMusic = minutes === 5 ? fiveMinMusic : tenMinMusic;
        activeButton = button;
        button.textContent = 'Pause';
        stopButton.disabled = false;
        
        updateDisplay();
        startMeditation();
    }
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function startMeditation() {
    if (timeLeft === 0) return;

    if (musicToggle.checked && currentMusic) {
        currentMusic.play();
    }

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();

        if (timeLeft === 0) {
            clearInterval(timerId);
            timerId = null;
            endMeditation();
        }
    }, 1000);
}

function stopMeditation() {
    clearInterval(timerId);
    timerId = null;
    timeLeft = 0;
    updateDisplay();
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    if (activeButton) {
        activeButton.textContent = `${activeButton === document.getElementById('fiveMinButton') ? '5' : '10'} Minutes`;
        activeButton = null;
    }
    stopButton.disabled = true;
}

function endMeditation() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
    if (activeButton) {
        activeButton.textContent = `${activeButton === document.getElementById('fiveMinButton') ? '5' : '10'} Minutes`;
        activeButton = null;
    }
    stopButton.disabled = true;
    updateTotalTime(selectedMinutes);
}

musicToggle.addEventListener('change', () => {
    if (!musicToggle.checked && currentMusic) {
        currentMusic.pause();
    } else if (timeLeft > 0 && !stopButton.disabled && currentMusic) {
        currentMusic.play();
    }
});

function displayTotalTime() {
    document.getElementById('totalTime').textContent = 
        `Total Meditation in ${YEAR}: ${totalMeditationMinutes} minutes`;
}

window.addEventListener('load', displayTotalTime); 