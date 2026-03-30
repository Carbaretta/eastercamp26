document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('startScreen');
    const processingScreen = document.getElementById('processingScreen');
    const errorScreen = document.getElementById('errorScreen');
    const countdownScreen = document.getElementById('countdownScreen');
    const patternScreen = document.getElementById('patternScreen');
    const exhaustedScreen = document.getElementById('exhaustedScreen');

    const acceptBtn = document.getElementById('acceptBtn');
    const retryBtn = document.getElementById('retryBtn');
    
    const errorMsgDetail = document.getElementById('errorMsgDetail');
    const countdownValue = document.getElementById('countdownValue');
    const imageTimerValue = document.getElementById('imageTimerValue');

    const TARGET_LAT = 54.29265038076779;
    const TARGET_LNG = -1.526807747185884;
    const MAX_DISTANCE_METERS = 20;
    const COOKIE_NAME = 'ch10_viewed';

    // Helper: Haversine distance in meters
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // Helper: Check if cookie exists
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    function setCookie(name, value, days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    // Initial check for exhausted
    if (getCookie(COOKIE_NAME)) {
        showScreen(exhaustedScreen);
        return;
    }

    function showScreen(screenEl) {
        [startScreen, processingScreen, errorScreen, countdownScreen, patternScreen, exhaustedScreen].forEach(el => {
            if (el) el.classList.add('d-none');
        });
        if (screenEl) screenEl.classList.remove('d-none');
    }

    function checkLocation() {
        showScreen(processingScreen);

        if (!("geolocation" in navigator)) {
            showError("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const distance = calculateDistance(position.coords.latitude, position.coords.longitude, TARGET_LAT, TARGET_LNG);
                if (distance <= MAX_DISTANCE_METERS) {
                    startSuccessFlow();
                } else {
                    showError(`You are ${Math.round(distance)} meters away from the objective.`);
                }
            },
            (error) => {
                showError("Unable to acquire your location. Please ensure location services are enabled.");
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000
            }
        );
    }

    function showError(detail) {
        if (errorMsgDetail) errorMsgDetail.textContent = detail;
        showScreen(errorScreen);
    }

    function startSuccessFlow() {
        setCookie(COOKIE_NAME, "true", 365); // Prevent refresh immediately
        showScreen(countdownScreen);

        let count = 3;
        if (countdownValue) countdownValue.textContent = count;

        const countInterval = setInterval(() => {
            count--;
            if (count > 0) {
                if (countdownValue) countdownValue.textContent = count;
            } else {
                clearInterval(countInterval);
                showPatternScreen();
            }
        }, 1000);
    }

    function showPatternScreen() {
        showScreen(patternScreen);
        let timeRemaining = 15;
        if (imageTimerValue) imageTimerValue.textContent = timeRemaining;

        const timerInterval = setInterval(() => {
            timeRemaining--;
            if (timeRemaining >= 0) {
                if (imageTimerValue) imageTimerValue.textContent = timeRemaining;
            } else {
                clearInterval(timerInterval);
                showScreen(exhaustedScreen);
            }
        }, 1000);
    }

    if (acceptBtn) acceptBtn.addEventListener('click', checkLocation);
    if (retryBtn) retryBtn.addEventListener('click', checkLocation);
});
