<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zen Meditation Timer</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Zen Meditation Timer</h1>
        
        <div class="total-time">
            <p id="totalTime">Total Meditation in 2025: 0:00</p>
            <button id="resetTotalButton" onclick="resetTotalTime()">Reset Total Time</button>
        </div>
        
        <div class="timer-display">
            <span id="minutes">00</span>:<span id="seconds">00</span>
        </div>

        <div class="timer-controls">
            <button id="tenSecButton" onclick="handleTimer(0.167)">10 Seconds</button>
            <button id="fiveMinButton" onclick="handleTimer(5)">5 Minutes</button>
            <button id="tenMinButton" onclick="handleTimer(10)">10 Minutes</button>
        </div>

        <div class="meditation-controls">
            <button id="stopButton" onclick="stopMeditation()" disabled>Stop</button>
        </div>

        <div class="audio-controls">
            <label>
                <input type="checkbox" id="musicToggle" checked>
                Play Background Music
            </label>
        </div>
    </div>
    <audio id="fiveMinMusic" loop>
        <source src="music/5min-Meditation.mp3" type="audio/mpeg">
    </audio>
    <audio id="tenMinMusic" loop>
        <source src="music/10min-Meditation.mp3" type="audio/mpeg">
    </audio>
    <script src="script.js"></script>
</body>
</html> 
