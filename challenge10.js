document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('startScreen');
    const countdownScreen = document.getElementById('countdownScreen');
    const patternScreen = document.getElementById('patternScreen');
    const exhaustedScreen = document.getElementById('exhaustedScreen');

    const acceptBtn = document.getElementById('acceptBtn');

    const countdownValue = document.getElementById('countdownValue');
    const imageTimerValue = document.getElementById('imageTimerValue');

    const COOKIE_NAME = 'ch10_viewed';

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
        [startScreen, countdownScreen, patternScreen, exhaustedScreen].forEach(el => {
            if (el) el.classList.add('d-none');
        });
        if (screenEl) screenEl.classList.remove('d-none');
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
        let timeRemaining = 10;
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

    if (acceptBtn) acceptBtn.addEventListener('click', startSuccessFlow);
});
