// Variables for date input, countdown display, and customization options
const dateInput = document.querySelector('#dateInput');
const countdownDisplay = document.querySelector('.countdown-display');
const darkModeToggle = document.querySelector('.toggle-btn');
const eventNameInput = document.querySelector('#eventNameInput');
let countdownInterval;


// Function to set dark mode based on user preference
function setDarkMode() {
    const body = document.body;
    const isDarkModeEnabled = localStorage.getItem('darkMode') === 'enabled';

    if (isDarkModeEnabled) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
}

// Call the setDarkMode function during page load
setDarkMode();

// Updated toggleDarkMode function
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');

    // Check if dark mode is currently enabled
    const isDarkModeEnabled = body.classList.contains('dark-mode');

    // Store the user's dark mode preference in localStorage
    localStorage.setItem('darkMode', isDarkModeEnabled ? 'enabled' : 'disabled');
}

// Function to calculate time difference
function calculateTimeDifference(eventDate) {
    const currentDate = moment();
    const eventDateTime = moment(eventDate);
    const timeDifference = eventDateTime.diff(currentDate);
    return timeDifference;
}

// Function to update the countdown display
function updateCountdownDisplay(timeDifference) {
    const duration = moment.duration(timeDifference);

    const days = Math.max(Math.floor(duration.asDays()), 0);
    const hours = Math.max(duration.hours(), 0);
    const minutes = Math.max(duration.minutes(), 0);
    const seconds = Math.max(duration.seconds(), 0);

    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// Initialize flatpickr on dateInput
const flatpickrInstance = flatpickr('#dateInput', {
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    time_24hr: true,
    onClose: function (selectedDates, dateStr, instance) {
        // Check if the event has already passed
        const timeDifference = calculateTimeDifference(dateStr);
        if (timeDifference <= 0) {
            // If the event has passed, stop the countdown
            clearInterval(countdownInterval);
            // Show notification only if the countdown has not already reached zero
            if (initialTimeDifference > 0) {
                showNotification();
            }
        } else {
            // Start or restart the countdown
            startCountdown();
        }
    }
});

// Function to get and display the custom event name
function getEventName() {
    return eventNameInput.value.trim() || 'Custom Event';
}

// Function to play notification sound
function playNotificationSound() {
    const notificationSound = new Audio('./tuturu_1.mp3');
    notificationSound.play();
}

function showInAppNotification(eventName) {
    const inAppNotification = document.createElement('div');
    inAppNotification.classList.add('in-app-notification');
    inAppNotification.textContent = `Countdown for "${eventName}" has reached zero!`;
    document.body.appendChild(inAppNotification);

    // Add 'show' class to trigger the animation
    setTimeout(() => {
        inAppNotification.classList.add('show');
    }, 100);

    // Remove the notification after 5 seconds
    setTimeout(() => {
        inAppNotification.remove();
    }, 5000);
}


function showNotification() {
    playNotificationSound();

    const eventName = getEventName();
    const notificationOptions = {
        body: `Countdown for "${eventName}" has reached zero!`,
    };

    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('Countdown Alert', notificationOptions);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function (permission) {
                if (permission === 'granted') {
                    new Notification('Countdown Alert', notificationOptions);
                }
            });
        }
    }

    // Show in-app notification when countdown reaches zero
    showInAppNotification(eventName);
}

// Periodically update the countdown display every second
function startCountdown() {
    let hasNotificationShown = false;

    countdownInterval = setInterval(function () {
        const ongoingTimeDifference = calculateTimeDifference(flatpickrInstance.selectedDates[0]);
        updateCountdownDisplay(ongoingTimeDifference);

        // Check if the event has already passed
        if (ongoingTimeDifference <= 0 && !hasNotificationShown) {
            // Stop the countdown and clear the interval
            clearInterval(countdownInterval);

            // Prevent further execution
            hasNotificationShown = true;

            // Show notification only once
            showNotification();
            showInAppNotification(getEventName());

        }
    }, 1000);
}


// Call startCountdown initially
startCountdown();

// Check and handle if the event date is in the past
const currentDate = moment();
const eventDateTime = moment(flatpickrInstance.selectedDates[0]);
const initialTimeDifference = eventDateTime.diff(currentDate);

// If the initial time difference is already negative, show notification and clear interval
if (initialTimeDifference <= 0) {
    clearInterval(countdownInterval);
    // Show notification only if the countdown has not already reached zero
    if (initialTimeDifference !== 0) {
        showNotification();
    }
}
