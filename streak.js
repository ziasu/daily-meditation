// Create this new file to handle streak logic
function updateStreak(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const userRef = firebase.database().ref(`users/${userId}`);
    
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val() || {};
        const lastMeditation = userData.lastMeditation ? new Date(userData.lastMeditation) : null;
        let currentStreak = userData.currentStreak || 0;
        const longestStreak = userData.longestStreak || 0;
        
        if (lastMeditation) {
            lastMeditation.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today - lastMeditation) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                // Streak broken
                currentStreak = 1;
            } else if (diffDays === 1) {
                // Streak continues
                currentStreak++;
            }
            // If diffDays === 0, user has already meditated today
        } else {
            // First meditation
            currentStreak = 1;
        }
        
        // Update longest streak if necessary
        const newLongestStreak = Math.max(currentStreak, longestStreak);
        
        // Update database
        userRef.update({
            lastMeditation: today.toISOString(),
            currentStreak: currentStreak,
            longestStreak: newLongestStreak
        });
        
        // Update UI
        document.getElementById('currentStreak').textContent = currentStreak;
        document.getElementById('longestStreak').textContent = newLongestStreak;
        document.getElementById('lastMeditation').textContent = formatDate(today);
    });
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Load streak data when user logs in
function loadStreakData(userId) {
    const userRef = firebase.database().ref(`users/${userId}`);
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val() || {};
        document.getElementById('currentStreak').textContent = userData.currentStreak || 0;
        document.getElementById('longestStreak').textContent = userData.longestStreak || 0;
        document.getElementById('lastMeditation').textContent = userData.lastMeditation ? 
            formatDate(new Date(userData.lastMeditation)) : 'Never';
    });
} 