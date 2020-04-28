
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  var options = {
    body: 'Some body text in the notification.'
  };
  new Notification('Successfully Subscribed!', options);
}

function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No permission granted');
    } else {
      displayConfirmNotification();
    }
  });
}

if ('Notification' in window) {
  for (var i = 0; i < enableNotificationsButtons.length; i += 1) {
    var button = enableNotificationsButtons[i];
    button.style.display = 'inline-block';
    button.addEventListener('click', askForNotificationPermission);
  }
}