let timeLeft = 0;
let timerId = null;
let selectedMinutes = 0;
const YEAR = '2025';
let totalMeditationMinutes = 0;

// JSONbin.io configuration
const JSONBIN_ACCESS_KEY = '$2a$10$MvlpIXdmzbNfmyAQtYM.AOmW2pNgBZlhsz10Y.FXc5lv687YKo.di'; // Replace with your access key
const JSONBIN_MASTER_KEY = '$2a$10$.bxyU0zfBl4HrSdbv/gDdueQfC9KVU9dVusZfaGisN5nvyDCuyXb.'; // Replace with your access key
const BIN_ID = '677a2f6fe41b4d34e4701ff0'; // Replace with your bin ID

// Function to fetch meditation data from JSONbin.io
async function fetchMeditationData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        totalMeditationMinutes = data[YEAR] || 0;
        displayTotalTime();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to localStorage if cloud fetch fails
        const savedMinutes = localStorage.getItem(`meditation_minutes_${YEAR}`);
        totalMeditationMinutes = parseInt(savedMinutes) || 0;
        displayTotalTime();
    }
}

// Function to update meditation data in JSONbin.io
async function updateMeditationData(minutes) {
    try {
        // Convert minutes to seconds for storage
        const seconds = Math.round(minutes * 60);
        totalMeditationMinutes += seconds;
        
        // Save to localStorage as backup
        localStorage.setItem(`meditation_minutes_${YEAR}`, totalMeditationMinutes);
        
        // Update JSONbin.io
        const content = {
            [YEAR]: totalMeditationMinutes
        };
        
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_MASTER_KEY,
                'X-Bin-Meta': false
            },
            body: JSON.stringify(content)
        });
        
        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
        
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
    const button = minutes === 5 ? document.getElementById('fiveMinButton') : 
                  minutes === 10 ? document.getElementById('tenMinButton') :
                  document.getElementById('tenSecButton');
    
    if (timerId !== null && activeButton === button) {
        // If same button clicked while running, pause the meditation
        clearInterval(timerId);
        timerId = null;
        if (currentMusic) {
            currentMusic.pause();
        }
        button.textContent = minutes < 1 ? '10 Seconds' : `${minutes} Minutes`;
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
                const buttonText = activeButton === document.getElementById('tenSecButton') ? '10 Seconds' :
                                 activeButton === document.getElementById('fiveMinButton') ? '5 Minutes' : '10 Minutes';
                activeButton.textContent = buttonText;
            }
        }
        
        selectedMinutes = minutes;
        timeLeft = minutes * 60;
        currentMusic = minutes >= 5 ? (minutes === 5 ? fiveMinMusic : tenMinMusic) : fiveMinMusic;
        activeButton = button;
        button.textContent = 'Pause';
        stopButton.disabled = false;
        
        updateDisplay();
        startMeditation();
    }
}

function updateDisplay() {
    if (timeLeft <= 0) {
        timeLeft = 0;  // Prevent negative numbers
        minutesDisplay.textContent = '00';
        secondsDisplay.textContent = '00';
        return;
    }
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);  // Use Math.floor to avoid decimal numbers
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

        if (timeLeft <= 0) {  // Changed from === to <= for safety
            clearInterval(timerId);
            timerId = null;
            timeLeft = 0;  // Ensure timeLeft is exactly 0
            updateDisplay();
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
        const buttonText = activeButton === document.getElementById('tenSecButton') ? '10 Seconds' :
                          activeButton === document.getElementById('fiveMinButton') ? '5 Minutes' : '10 Minutes';
        activeButton.textContent = buttonText;
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
        const buttonText = activeButton === document.getElementById('tenSecButton') ? '10 Seconds' :
                          activeButton === document.getElementById('fiveMinButton') ? '5 Minutes' : '10 Minutes';
        activeButton.textContent = buttonText;
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
    const totalMinutes = Math.floor(totalMeditationMinutes / 60);
    const totalSeconds = totalMeditationMinutes % 60;
    document.getElementById('totalTime').textContent = 
        `Total Meditation in ${YEAR}: ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
}

window.addEventListener('load', displayTotalTime); 
