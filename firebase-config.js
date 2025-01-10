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
        loadUserData(user.uid);
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

// Load user data including streak
function loadUserData(userId) {
    const userRef = firebase.database().ref(`users/${userId}`);
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val() || {};
        
        // Update streak display
        document.getElementById('currentStreak').textContent = userData.currentStreak || 0;
        document.getElementById('longestStreak').textContent = userData.longestStreak || 0;
        document.getElementById('lastMeditation').textContent = userData.lastMeditation ? 
            formatDate(new Date(userData.lastMeditation)) : 'Never';
            
        // Update total time if it exists
        if (userData.totalTime) {
            document.getElementById('totalTime').textContent = 
                `Total Meditation in 2025: ${userData.totalTime} seconds`;
        }
    });
}

// Update streak when meditation completes
function updateMeditationStreak(userId, meditationTime) {
    const userRef = firebase.database().ref(`users/${userId}`);
    
    userRef.once('value').then((snapshot) => {
        const userData = snapshot.val() || {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastMeditation = userData.lastMeditation ? new Date(userData.lastMeditation) : null;
        let currentStreak = userData.currentStreak || 0;
        const longestStreak = userData.longestStreak || 0;
        
        if (lastMeditation) {
            lastMeditation.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today - lastMeditation) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                currentStreak = 1; // Streak broken
            } else if (diffDays === 1) {
                currentStreak++; // Streak continues
            }
            // If diffDays === 0, user has already meditated today
        } else {
            currentStreak = 1; // First meditation
        }
        
        // Update longest streak if necessary
        const newLongestStreak = Math.max(currentStreak, longestStreak);
        
        // Update total time
        const totalTime = (userData.totalTime || 0) + meditationTime;
        
        // Update database
        userRef.update({
            lastMeditation: today.toISOString(),
            currentStreak: currentStreak,
            longestStreak: newLongestStreak,
            totalTime: totalTime
        });
        
        // Update UI
        document.getElementById('currentStreak').textContent = currentStreak;
        document.getElementById('longestStreak').textContent = newLongestStreak;
        document.getElementById('lastMeditation').textContent = formatDate(today);
        document.getElementById('totalTime').textContent = 
            `Total Meditation in 2025: ${totalTime} seconds`;
    });
}

// Helper function to format dates
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Modify your existing meditation completion handler
function handleMeditationComplete(userId, duration) {
    updateMeditationStreak(userId, duration * 60); // Convert minutes to seconds
}

// Save meditation time to Firebase (now in minutes)
function saveMeditationTime(minutes) {
    const user = auth.currentUser;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        
        // First get the current value
        userRef.once('value')
            .then((snapshot) => {
                const userData = snapshot.val() || {};
                const currentTotal = userData.totalTime || 0;
                const newTotal = currentTotal + minutes;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Calculate streak
                const lastMeditation = userData.lastMeditation ? new Date(userData.lastMeditation) : null;
                let currentStreak = userData.currentStreak || 0;
                const longestStreak = userData.longestStreak || 0;
                
                if (lastMeditation) {
                    lastMeditation.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((today - lastMeditation) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays > 1) {
                        currentStreak = 1; // Streak broken
                    } else if (diffDays === 1) {
                        currentStreak++; // Streak continues
                    }
                    // If diffDays === 0, user has already meditated today
                } else {
                    currentStreak = 1; // First meditation
                }
                
                // Update longest streak if necessary
                const newLongestStreak = Math.max(currentStreak, longestStreak);
                
                // Then update with new values
                return userRef.update({
                    totalTime: newTotal,
                    lastUpdated: Date.now(),
                    lastMeditation: today.toISOString(),
                    currentStreak: currentStreak,
                    longestStreak: newLongestStreak
                });
            })
            .then(() => {
                console.log('Meditation time and streak saved successfully');
                // Update UI
                loadUserData(user.uid);
            })
            .catch((error) => {
                console.error('Save failed:', error);
            });
    } else {
        console.error('No user logged in');
    }
}

// Clear meditation time in Firebase
function clearMeditationTime() {
    const user = auth.currentUser;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        userRef.update({
            totalTime: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastMeditation: null
        })
        .then(() => {
            console.log('Meditation data cleared successfully');
            loadUserData(user.uid);
        })
        .catch((error) => {
            console.error('Clear failed:', error);
        });
    }
} 