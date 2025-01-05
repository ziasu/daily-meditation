let timeLeft = 0;
let timerId = null;
let selectedMinutes = 0;
const YEAR = '2025';
let totalMeditationMinutes = 0;

// GitHub configuration
const GITHUB_USERNAME = 'ziasu';
const GITHUB_REPO = 'daily-meditation';
const GITHUB_TOKEN = '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';
const FILE_PATH = 'meditation_data.json';

// Function to fetch meditation data from GitHub
async function fetchMeditationData() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${FILE_PATH}`);
        const data = await response.json();
        const content = JSON.parse(atob(data.sha ? data.content : 'eyIyMDI1IjowfQ==')); // Default to {"2025":0} if file doesn't exist
        totalMeditationMinutes = content[YEAR] || 0;
        displayTotalTime();
    } catch (error) {
        console.error('Error fetching data:', error);
        totalMeditationMinutes = 0;
        displayTotalTime();
    }
}

// Function to update meditation data on GitHub
async function updateMeditationData(minutes) {
    try {
        // First get the current file to get its SHA
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${FILE_PATH}`);
        const fileData = await response.json();
        
        // Update the content
        totalMeditationMinutes += minutes;
        const content = JSON.parse(atob(fileData.content || 'eyIyMDI1IjowfQ=='));
        content[YEAR] = totalMeditationMinutes;
        
        // Prepare the update
        const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Update meditation minutes',
                content: btoa(JSON.stringify(content)),
                sha: fileData.sha
            })
        });
        
        if (updateResponse.ok) {
            displayTotalTime();
        }
    } catch (error) {
        console.error('Error updating data:', error);
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