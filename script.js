let timeLeft = 0;
let timerId = null;
let selectedMinutes = 0;
const YEAR = '2025';
let totalMeditationMinutes = 0;

// JSONbin.io configuration
const JSONBIN_ACCESS_KEY = '$2a$10$MvlpIXdmzbNfmyAQtYM.AOmW2pNgBZlhsz10Y.FXc5lv687YKo.di';
const BIN_ID = '677a2f6fe41b4d34e4701ff0';

// Function to fetch meditation data
async function fetchMeditationData() {
    try {
        console.log('Fetching meditation data...');
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_ACCESS_KEY,
                'X-Bin-Meta': false
            }
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        totalMeditationMinutes = data[YEAR] || 0;
        displayTotalTime();
    } catch (error) {
        console.error('Detailed error fetching data:', error);
        totalMeditationMinutes = 0;
        displayTotalTime();
    }
}

// Function to update meditation data
async function updateMeditationData(minutes) {
    try {
        totalMeditationMinutes += minutes;
        const content = {
            [YEAR]: totalMeditationMinutes
        };
        
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_ACCESS_KEY,
                'X-Bin-Meta': false
            },
            body: JSON.stringify(content)
        });
        
        console.log('Update response status:', updateResponse.status);
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('Update error response:', errorText);
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
        
        console.log('Successfully updated meditation data');
        displayTotalTime();
    } catch (error) {
        console.error('Detailed error updating data:', error);
    }
}

// Load initial data when page loads
window.addEventListener('load', fetchMeditationData);

// Replace the old updateTotalTime function
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
    // Stop current meditation if running
    if (timerId !== null) {
        clearInterval(timerId);
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    
    selectedMinutes = minutes;
    timeLeft = minutes * 60;
    updateDisplay();
    
    // Start meditation immediately
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
        // If paused, resume meditation
        startMeditation();
        pauseButton.textContent = 'Pause';
    } else {
        // If running, pause meditation
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
    // Add completed meditation time to total
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

// Add function to display total time
function displayTotalTime() {
    document.getElementById('totalTime').textContent = 
        `Total Meditation in ${YEAR}: ${totalMeditationMinutes} minutes`;
}

// Call displayTotalTime when page loads
window.addEventListener('load', displayTotalTime); 
