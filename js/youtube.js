var API_KEY = 'AIzaSyD67rIKHYPR-GMEs6K9dL6SnwIMlLxoIjM'
var YouTube;
var player;
var playerReady=false;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '500',
    width: '800',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  //event.target.playVideo();
  console.log("player ready");

  playerReady=true;

  if(playlistReady)
      playSong();
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
        loadWindow();
    });
}
