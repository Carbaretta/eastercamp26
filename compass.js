document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const startScreen = document.getElementById('startScreen');
    const trackingScreen = document.getElementById('trackingScreen');
    const arrow = document.getElementById('arrow');
    const distanceDisplay = document.getElementById('distanceDisplay');
    const statusMessage = document.getElementById('statusMessage');

    // Target Coordinates
    const targetLat = 54.30281299461881;
    const targetLng = -1.53726231027667;

    let currentLat = null;
    let currentLng = null;
    let compassHeading = 0;
    let targetBearing = 0;

    startBtn.addEventListener('click', async () => {
        // Request DeviceOrientation permission if required (iOS 13+)
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceOrientationEvent.requestPermission();
                if (permissionState === 'granted') {
                    initTracking();
                } else {
                    alert('Compass permission was denied. The arrow will not rotate.');
                    initTracking(); // Try to get GPS anyway
                }
            } catch (err) {
                console.error(err);
                initTracking();
            }
        } else {
            // Non-iOS 13+ devices
            initTracking();
        }
    });

    function initTracking() {
        startScreen.classList.add('d-none');
        trackingScreen.classList.remove('d-none');

        statusMessage.textContent = 'Acquiring GPS signal...';

        // 1. Setup GPS Watch
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(
                (position) => {
                    currentLat = position.coords.latitude;
                    currentLng = position.coords.longitude;

                    updateCalculations();
                    statusMessage.textContent = `Location accurate to ${Math.round(position.coords.accuracy)}m`;
                },
                (error) => {
                    statusMessage.textContent = `GPS Error: ${error.message}`;
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        } else {
            statusMessage.textContent = "Geolocation is not supported by your browser.";
        }

        // 2. Setup Compass Listener
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);

        // Fallback for devices that don't support absolute
        window.addEventListener('deviceorientation', (e) => {
            if (e.webkitCompassHeading) {
                // iOS compass
                compassHeading = e.webkitCompassHeading;
                updateUI();
            } else if (!window.ondeviceorientationabsolute) {
                // Android standard if absolute event didn't fire
                if (e.alpha !== null) {
                    compassHeading = 360 - e.alpha;
                    updateUI();
                }
            }
        });
    }

    function handleOrientation(e) {
        if (e.alpha !== null) {
            // deviceorientationabsolute alpha represents degrees CCW from true north.
            // We want degrees CW like a standard compass.
            compassHeading = 360 - e.alpha;
            updateUI();
        }
    }

    function updateCalculations() {
        if (currentLat === null || currentLng === null) return;

        // Calculate Distance
        const distance = calculateDistance(currentLat, currentLng, targetLat, targetLng);
        distanceDisplay.textContent = `${Math.round(distance)} meters`;

        // Calculate Bearing
        targetBearing = calculateBearing(currentLat, currentLng, targetLat, targetLng);
        updateUI();
    }

    function updateUI() {
        // Rotate the arrow
        // The arrow needs to point to the bearing relative to the current device heading.
        // If bearing is 90 (East), and heading is 90 (East), we want arrow pointing straight up (0 deg rotation).
        // Therefore rotation = targetBearing - compassHeading
        const rotation = targetBearing - compassHeading;

        if (arrow) {
            arrow.style.transform = `rotate(${rotation}deg)`;
        }
    }

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

    // Helper: Initial bearing in degrees CW from North
    function calculateBearing(lat1, lon1, lat2, lon2) {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const λ1 = lon1 * Math.PI / 180;
        const λ2 = lon2 * Math.PI / 180;

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        const θ = Math.atan2(y, x);
        const brng = (θ * 180 / Math.PI + 360) % 360; // in degrees
        return brng;
    }
});
