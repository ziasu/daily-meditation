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
const pauseButton = document.getElementById('pauseButton');
const backgroundMusic = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
const stopButton = document.getElementById('stopButton');

function setTimer(minutes) {
    if (timerId !== null) {
        clearInterval(timerId);
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    
    selectedMinutes = minutes;
    timeLeft = minutes * 60;
    updateDisplay();
    startMeditation();
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function startMeditation() {
    if (timeLeft === 0) return;
    
    pauseButton.disabled = false;
    stopButton.disabled = false;
    pauseButton.textContent = 'Pause';

    if (musicToggle.checked) {
        backgroundMusic.play();
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

function pauseMeditation() {
    if (timerId === null) {
        startMeditation();
        pauseButton.textContent = 'Pause';
    } else {
        clearInterval(timerId);
        timerId = null;
        pauseButton.disabled = false;
        if (musicToggle.checked) {
            backgroundMusic.pause();
        }
        pauseButton.textContent = 'Continue';
    }
}

function endMeditation() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    pauseButton.disabled = true;
    stopButton.disabled = true;
    updateTotalTime(selectedMinutes);
}

function stopMeditation() {
    clearInterval(timerId);
    timerId = null;
    timeLeft = 0;
    updateDisplay();
    pauseButton.disabled = true;
    stopButton.disabled = true;
    pauseButton.textContent = 'Pause';
    if (musicToggle.checked) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

musicToggle.addEventListener('change', () => {
    if (!musicToggle.checked) {
        backgroundMusic.pause();
    } else if (timeLeft > 0 && !pauseButton.disabled) {
        backgroundMusic.play();
    }
});

function displayTotalTime() {
    document.getElementById('totalTime').textContent = 
        `Total Meditation in ${YEAR}: ${totalMeditationMinutes} minutes`;
}

window.addEventListener('load', displayTotalTime); 