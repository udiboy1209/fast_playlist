var API_KEY = 'AIzaSyD67rIKHYPR-GMEs6K9dL6SnwIMlLxoIjM'
var YouTube;
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '250',
    width: '400',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    playNext();
  }
}

function onGoogleApiClientLoad () {
    gapi.client.setApiKey(API_KEY);
    gapi.client.load('youtube', 'v3').then(function() {
        console.log("Google API loaded")
        YouTube = gapi.client.youtube;
    });
}