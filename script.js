let timer;
let timeLeft;
let isRunning = false;
let currentAudio = null;

// JSONBin.io API functions
async function saveMeditationTime(minutes) {
    try {
        // Get current data first
        const currentData = await getMeditationData();
        const totalMinutes = (currentData?.totalMinutes || 0) + minutes;
        
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({ totalMinutes })
        });

        if (!response.ok) throw new Error('Failed to save data');
        
        updateSyncStatus('Saved ✓');
        updateTotalTimeDisplay(totalMinutes);
    } catch (error) {
        console.error('Error saving meditation time:', error);
        updateSyncStatus('Save failed ✗');
    }
}

async function getMeditationData() {
    try {
        updateSyncStatus('Loading...');
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });

        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        updateSyncStatus('Loaded ✓');
        updateTotalTimeDisplay(data.record.totalMinutes || 0);
        return data.record;
    } catch (error) {
        console.error('Error fetching meditation data:', error);
        updateSyncStatus('Load failed ✗');
        return { totalMinutes: 0 };
    }
}

function updateSyncStatus(message) {
    const syncStatus = document.getElementById('syncStatus');
    syncStatus.textContent = message;
}

function updateTotalTimeDisplay(totalMinutes) {
    const totalTimeElement = document.getElementById('totalTime');
    totalTimeElement.textContent = `Total Meditation in 2025: ${totalMinutes} minutes`;
}

// Timer functions
function handleTimer(duration) {
    if (isRunning) return;
    
    timeLeft = duration * 60;
    isRunning = true;
    
    // Update UI
    document.getElementById('stopButton').disabled = false;
    document.getElementById('fiveMinButton').disabled = true;
    document.getElementById('tenMinButton').disabled = true;
    
    // Handle music
    if (document.getElementById('musicToggle').checked) {
        currentAudio = document.getElementById(`${duration}MinMusic`);
        currentAudio.play();
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
    
    // Calculate completed minutes
    const originalDuration = currentAudio?.id === 'fiveMinMusic' ? 5 : 10;
    const completedSeconds = (originalDuration * 60) - timeLeft;
    const completedMinutes = Math.ceil(completedSeconds / 60);
    
    clearInterval(timer);
    resetTimer();
    
    if (completedSeconds > 30) { // Only save if meditated for more than 30 seconds
        saveMeditationTime(completedMinutes);
    }
}

function completeMeditation() {
    const duration = currentAudio?.id === 'fiveMinMusic' ? 5 : 10;
    clearInterval(timer);
    resetTimer();
    saveMeditationTime(duration);
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
    
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
}

// Initialize
window.addEventListener('load', () => {
    getMeditationData();
}); 