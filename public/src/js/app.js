
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
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
  if ('serviceWorker' in navigator) {
    var options = {
      body: 'Some body text in the notification.',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };
    navigator.serviceWorker.ready
      .then(function(swreg) {
        swreg.showNotification('Successfully subscribed!', options);
      });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      if (sub === null) {
        var vapidPublicKey =
          'BFW7ARGlycmtGvNkrrTknHk94pdfZ6cQiK8aQDOVRFhyG7HqPupLOkHMBxlZZ2Cdt5cqDiQGsLl3D9N3k2NoY3s';
        var vapidPublicKeyConverted = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKeyConverted
        });
      } else {

      }
    })
    .then(function(newSub) {
      return fetch('https://pwa-app-1da65.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if (result !== 'granted') {
      console.log('No permission granted');
    } else {
      configurePushSub();
      //displayConfirmNotification();
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