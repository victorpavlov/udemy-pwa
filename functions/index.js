var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors = require('cors')({origin: true});
var webPush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
var serviceAccount = require('./pwa-app-6f249a9a6bd2.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwa-app-1da65.firebaseio.com/',
})

exports.newPostsData = functions.https.onRequest(function(request, response) {
  cors(request, response, function() {
    admin.database().ref('posts').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    })
      .then(function() {
        webPush.setVapidDetails(
          'mailto:vitekpavlov@gmail.com',
          'BFW7ARGlycmtGvNkrrTknHk94pdfZ6cQiK8aQDOVRFhyG7HqPupLOkHMBxlZZ2Cdt5cqDiQGsLl3D9N3k2NoY3s',
          'vmpcmtXYe8lT1-GgodFVqk8byynmL3YdpA1WhLUl4PI'
        );
        return admin.database().ref('subscriptions').once('value');
      })
      .then(function(subscriptions) {
        subscriptions.forEach(function(sub) {
          var pushConfig = {
            endpoint: sub.val().endpoint,
            keys: {
              auth: sub.val().keys.auth,
              p256dh: sub.val().keys.p256dh
            }
          };
          webPush.sendNotification(pushConfig, JSON.stringify({
            title: 'New Post',
            content: 'New Post Added!',
            openUrl: '/help'
          }));
        });
        response
          .status(201)
          .json({ message: 'Data Stored', id: request.body.id });
      })
      .catch(function(err) {
        response.status(500).json({message: err})
      });
  });
});
