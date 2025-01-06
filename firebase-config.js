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

// Load user's meditation time
function loadUserMeditationTime(userId) {
    console.log('Loading data for user:', userId);
    const userRef = db.ref('users/' + userId);
    
    // Remove any existing listeners first
    userRef.off();
    
    // Add new listener
    userRef.on('value', (snapshot) => {
        const userData = snapshot.val();
        console.log('Loaded user data:', userData);
        if (userData && userData.totalTime !== undefined) {
            console.log('Updating display with total time:', userData.totalTime);
            const totalTimeElement = document.getElementById('totalTime');
            if (totalTimeElement) {
                totalTimeElement.textContent = `Total Meditation in 2025: ${userData.totalTime} seconds`;
            }
        } else {
            console.log('No meditation data found, setting display to 0');
            const totalTimeElement = document.getElementById('totalTime');
            if (totalTimeElement) {
                totalTimeElement.textContent = `Total Meditation in 2025: 0 seconds`;
            }
        }
    });
}

// Save meditation time to Firebase
function saveMeditationTime(timeInSeconds) {
    const user = auth.currentUser;
    if (user) {
        const userRef = db.ref('users/' + user.uid);
        userRef.transaction((userData) => {
            console.log('Current user data:', userData); // Debug log
            if (userData === null) {
                return {
                    totalTime: timeInSeconds,
                    lastUpdated: Date.now()
                };
            }
            return {
                totalTime: (userData.totalTime || 0) + timeInSeconds,
                lastUpdated: Date.now()
            };
        }).then((result) => {
            console.log('Save successful:', result); // Debug log
            if (result.committed) {
                updateTotalTimeDisplay(result.snapshot.val().totalTime);
            }
        }).catch((error) => {
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
            totalTime: 0
        });
    }
}

// Update total time display
function updateTotalTimeDisplay(totalSeconds) {
    const totalTimeElement = document.getElementById('totalTime');
    console.log('Updating display element with seconds:', totalSeconds); // Debug log
    if (totalTimeElement) {
        totalTimeElement.textContent = `Total Meditation in 2025: ${totalSeconds} seconds`;
    } else {
        console.error('Total time element not found!');
    }
} 