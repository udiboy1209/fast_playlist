define('ytIframeAPI',['jquery'], function($) {
    var player = {

        playerStateChangeListeners: [],
        playerReadyListeners: [],

        registerStateChangeListener: function(listener) {
            player.playerStateChangeListeners.push(listener);
        },

        registerReadyListener: function(listener) {
            player.playerReadyListeners.push(listener);
            if(player.playerReady)
                listener();
        },
    };

    var loadPlayer = function() {
        player.player = new YT.Player('player', {
            height: '500',
            width: '800',
            events: {
                'onReady': function(event) {
                    console.log("player ready");
                    player.playerReady=true;
                    for(listener in player.playerReadyListeners){
                        player.playerReadyListeners[listener](event);
                    }
                },
                'onStateChange': function(event) {
                    for(listener in player.playerStateChangeListeners){
                        player.playerStateChangeListeners[listener](event);
                    }
                }
            }
        });
    };

    if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {
        window.onYouTubeIframeAPIReady = function() {
            loadPlayer();
        };
        $.getScript('//www.youtube.com/iframe_api');
    } else {
        loadPlayer();
    }

    return player;
});

define('ytDataAPI',['jquery'],
function($) {
    console.log('Load data API');
    var API_KEY = 'AIzaSyD67rIKHYPR-GMEs6K9dL6SnwIMlLxoIjM';
    var ytdata = {
        api: null,
        ready: false
    }

    var loadGClient = function() {
        gapi.client.setApiKey(API_KEY);
        gapi.client.load('youtube', 'v3', function() {
            ytdata.api = gapi.client.youtube;
            ytdata.ready = true;
        });
    }

    if(typeof(gapi) == 'undefined') {
        window.onGoogleApiClientLoad = function() {
            loadGClient();
        }
        $.getScript('//apis.google.com/js/client.js?onload=onGoogleApiClientLoad');
    } else {
        loadGClient();
    }

    return ytdata;
});
