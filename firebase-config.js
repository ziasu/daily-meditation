const firebaseConfig = {
    apiKey: "AIzaSyBt9Eya5gCsHC6u6Ae4qlHoSyV6i3dMbK8",
    authDomain: "meditation-app-9d3da.firebaseapp.com",
    projectId: "meditation-app-9d3da",
    storageBucket: "meditation-app-9d3da.firebasestorage.app",
    messagingSenderId: "968770663530",
    appId: "1:968770663530:web:6ee0c027a7813f482b0613",
    /*measurementId: "G-MNZSHM9L0E",*/
    databaseURL: "https://meditation-app-9d3da-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database and auth references
const db = firebase.database();
const auth = firebase.auth();

// Add Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Google Sign-in function
function signInWithGoogle() {
    auth.signInWithPopup(googleProvider)
        .catch((error) => {
            document.getElementById('authError').textContent = error.message;
        });
}

// Auth functions
function login() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            document.getElementById('authError').textContent = error.message;
        });
}

function signup() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .catch((error) => {
            document.getElementById('authError').textContent = error.message;
        });
}

function logout() {
    auth.signOut();
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    const userEmail = document.getElementById('userEmail');
    
    if (user) {
        console.log('User signed in:', user.uid); // Debug log
        // User is signed in
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        userEmail.textContent = user.email;
        
        // Initialize user's meditation data
        loadUserMeditationTime(user.uid);
    } else {
        console.log('User signed out'); // Debug log
        // User is signed out
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        userEmail.textContent = '';
    }
});

// Simplify format time function to only handle minutes
function formatTime(totalMinutes) {
    if (totalMinutes === 0) {
        return '0 minutes';
    } else {
        return `${totalMinutes} minute${totalMinutes !== 1 ? 's' : ''}`;
    }
}

// Add these helper functions at the top of firebase-config.js
function isConsecutiveDay(lastDate) {
    const today = new Date();
    const lastMeditation = new Date(lastDate);
    
    // Reset hours to compare just the dates
    today.setHours(0, 0, 0, 0);
    lastMeditation.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    const diffTime = today.getTime() - lastMeditation.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1; // Return true if it's consecutive
}

// Add these helper functions
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

function updateStatistics(userData) {
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const currentYear = today.getFullYear();

    // Initialize statistics if they don't exist
    if (!userData.statistics) {
        userData.statistics = {
            weekly: {},
            yearly: {}
        };
    }

    const weekKey = `${currentYear}-W${currentWeek}`;
    const yearKey = `${currentYear}`;

    // Initialize current periods if they don't exist
    if (!userData.statistics.weekly[weekKey]) {
        userData.statistics.weekly[weekKey] = {
            totalMinutes: 0,
            daysActive: []
        };
    }
    if (!userData.statistics.yearly[yearKey]) {
        userData.statistics.yearly[yearKey] = {
            totalMinutes: 0,
            daysActive: []
        };
    }

    return {
        weekKey,
        yearKey,
        currentWeek,
        currentYear
    };
}

// Update saveMeditationTime function
function saveMeditationTime(minutes) {
    const user = auth.currentUser;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        userRef.once('value')
            .then((snapshot) => {
                const userData = snapshot.val() || {};
                const stats = updateStatistics(userData);
                
                // Get today's date in YYYY-MM-DD format
                const dayKey = today.toISOString().split('T')[0];
                
                // Initialize statistics if they don't exist
                if (!userData.statistics) {
                    userData.statistics = {
                        weekly: {},
                        yearly: {}
                    };
                }
                
                // Ensure arrays exist
                if (!userData.statistics.weekly[stats.weekKey]) {
                    userData.statistics.weekly[stats.weekKey] = { 
                        totalMinutes: 0, 
                        daysActive: [] 
                    };
                }
                if (!userData.statistics.yearly[stats.yearKey]) {
                    userData.statistics.yearly[stats.yearKey] = { 
                        totalMinutes: 0, 
                        daysActive: [] 
                    };
                }

                // Ensure daysActive is an array
                if (!Array.isArray(userData.statistics.weekly[stats.weekKey].daysActive)) {
                    userData.statistics.weekly[stats.weekKey].daysActive = [];
                }
                if (!Array.isArray(userData.statistics.yearly[stats.yearKey].daysActive)) {
                    userData.statistics.yearly[stats.yearKey].daysActive = [];
                }

                // Update weekly statistics
                userData.statistics.weekly[stats.weekKey].totalMinutes += minutes;
                if (!userData.statistics.weekly[stats.weekKey].daysActive.includes(dayKey)) {
                    userData.statistics.weekly[stats.weekKey].daysActive.push(dayKey);
                }
                
                // Update yearly statistics
                userData.statistics.yearly[stats.yearKey].totalMinutes += minutes;
                if (!userData.statistics.yearly[stats.yearKey].daysActive.includes(dayKey)) {
                    userData.statistics.yearly[stats.yearKey].daysActive.push(dayKey);
                }

                console.log('Saving statistics:', {
                    weekly: userData.statistics.weekly[stats.weekKey],
                    yearly: userData.statistics.yearly[stats.yearKey]
                });

                // Rest of your existing streak logic...
                const lastMeditationDate = userData.lastMeditationDate;
                let currentStreak = userData.currentStreak || 0;
                let bestStreak = userData.bestStreak || 0;

                if (lastMeditationDate) {
                    const lastDate = new Date(lastMeditationDate);
                    lastDate.setHours(0, 0, 0, 0);
                    
                    if (today.getTime() === lastDate.getTime()) {
                        // Same day meditation, don't update streak
                    } else if (isConsecutiveDay(lastMeditationDate)) {
                        // Consecutive day, increase streak
                        currentStreak++;
                        bestStreak = Math.max(currentStreak, bestStreak);
                    } else {
                        // Streak broken, start new streak
                        currentStreak = 1;
                    }
                } else {
                    // First meditation ever
                    currentStreak = 1;
                    bestStreak = 1;
                }

                // Update all values
                return userRef.set({
                    totalTime: (userData.totalTime || 0) + minutes,
                    lastMeditationDate: today.toISOString(),
                    currentStreak: currentStreak,
                    bestStreak: bestStreak,
                    statistics: userData.statistics,
                    lastUpdated: Date.now()
                });
            })
            .then(() => {
                console.log('Meditation time and streak saved successfully');
            })
            .catch((error) => {
                console.error('Save failed:', error);
            });
    }
}

// Update loadUserMeditationTime to display statistics
function loadUserMeditationTime(userId) {
    console.log('Loading data for user:', userId);
    const userRef = db.ref('users/' + userId);
    
    userRef.off();
    
    userRef.on('value', (snapshot) => {
        const userData = snapshot.val();
        console.log('Loaded user data:', userData);
        
        if (userData) {
            // Update total time display
            const totalTimeElement = document.getElementById('totalTime');
            if (totalTimeElement) {
                const totalMinutes = userData.totalTime || 0;
                const formattedTime = formatTime(totalMinutes);
                totalTimeElement.textContent = `Total Meditation in 2025: ${formattedTime}`;
            }
            
            // Update streak display
            const streakElement = document.getElementById('streakCount');
            if (streakElement) {
                const currentStreak = userData.currentStreak || 0;
                const bestStreak = userData.bestStreak || 0;
                streakElement.textContent = `Current Streak: ${currentStreak} days | Best Streak: ${bestStreak} days`;
            }

            // Update statistics
            if (userData.statistics) {
                const stats = updateStatistics(userData);
                const weekKey = stats.weekKey;
                const yearKey = stats.yearKey;

                const weeklyStats = userData.statistics.weekly[weekKey] || { totalMinutes: 0, daysActive: [] };
                const yearlyStats = userData.statistics.yearly[yearKey] || { totalMinutes: 0, daysActive: [] };

                document.getElementById('weeklyStats').textContent = `${weeklyStats.totalMinutes} minutes`;
                document.getElementById('yearlyStats').textContent = `${yearlyStats.totalMinutes} minutes`;
                document.getElementById('weeklyDays').textContent = `${weeklyStats.daysActive.length}/7 days`;
                document.getElementById('yearlyDays').textContent = `${yearlyStats.daysActive.length}/365 days`;

                // Update streak flame visibility
                const streakFlame = document.getElementById('streakFlame');
                if (userData.currentStreak > 1) {
                    streakFlame.style.display = 'inline';
                } else {
                    streakFlame.style.display = 'none';
                }
            }
        }
    });
}

// Clear meditation time in Firebase
function clearMeditationTime() {
    const user = auth.currentUser;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        userRef.remove()
            .then(() => {
                console.log('Meditation time cleared successfully');
                const totalTimeElement = document.getElementById('totalTime');
                if (totalTimeElement) {
                    totalTimeElement.textContent = 'Total Meditation in 2025: 0 minutes';
                }
            })
            .catch((error) => {
                console.error('Clear failed:', error);
            });
    }
} 