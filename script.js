let timeLeft = 0;
let timerId = null;
let selectedMinutes = 0;
const YEAR = '2025';
let totalMeditationMinutes = 0;

// JSONbin.io configuration
const JSONBIN_ACCESS_KEY = '677a2f4be41b4d34e4701fe2';
const BIN_ID = '677a2f6fe41b4d34e4701ff0';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM element references
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const stopButton = document.getElementById('stopButton');
    const musicToggle = document.getElementById('musicToggle');
    const fiveMinMusic = document.getElementById('fiveMinMusic');
    const tenMinMusic = document.getElementById('tenMinMusic');
    let currentMusic = null;
    let activeButton = null;

    // Move all DOM-dependent functions inside
    function updateDisplay() {
        if (timeLeft <= 0) {
            timeLeft = 0;
            minutesDisplay.textContent = '00';
            secondsDisplay.textContent = '00';
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

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
        
        // Update total time
        const seconds = Math.round(selectedMinutes * 60);
        totalMeditationMinutes += seconds;
        displayTotalTime();
        
        // Update cloud storage only
        updateCloudStorage();
    }

    // Add event listeners
    musicToggle.addEventListener('change', () => {
        if (!musicToggle.checked && currentMusic) {
            currentMusic.pause();
        } else if (timeLeft > 0 && !stopButton.disabled && currentMusic) {
            currentMusic.play();
        }
    });

    // Make functions available globally
    window.handleTimer = handleTimer;
    window.stopMeditation = stopMeditation;
});

// Keep async functions outside
async function fetchMeditationData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_ACCESS_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        // Use cloud data only
        totalMeditationMinutes = data[YEAR] || 0;
        displayTotalTime();
    } catch (error) {
        console.error('Error fetching data:', error);
        totalMeditationMinutes = 0;
        displayTotalTime();
    }
}

async function updateCloudStorage() {
    try {
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
        
        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
    } catch (error) {
        console.error('Error updating cloud storage:', error);
    }
}

function displayTotalTime() {
    const totalMinutes = Math.floor(totalMeditationMinutes / 60);
    const totalSeconds = totalMeditationMinutes % 60;
    document.getElementById('totalTime').textContent = 
        `Total Meditation in ${YEAR}: ${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
}

// Initialize
window.addEventListener('load', fetchMeditationData);
window.addEventListener('load', displayTotalTime);

// Add periodic sync
setInterval(fetchMeditationData, 30000);
