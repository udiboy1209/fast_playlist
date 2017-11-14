define(['jquery','playlist', 'ytIframeAPI'],
function($, playlist, ytIframe){
    var playing = -1;
    var repeat_all = false;
    var repeat_one = false;
    var shuffle = false;

    var displayPlaying = function() {
        for(var i=0; i<playlist.size(); i++){
            if(i==playing){
                $("#playlist").children().eq(i).addClass("playing");
            } else {
                $("#playlist").children().eq(i).removeClass("playing");
            }
        }
    }

    var playSong = function(id){
        if(playing>=0 && playing<playlist.size() && id==playlist.get(playing).id.videoId)
            return;

        if(id !=undefined){
            var index=0;
            for(var i=0; i<playlist.size(); i++){
                if(id==playlist.get(i).id.videoId)
                    break;
                index++;
            }
            console.log("play: "+index);
            playing=index;
        }

        ytIframe.player.stopVideo();

        if(playing>=0 && playing<playlist.size()){
            ytIframe.player.loadVideoById(playlist.get(playing).id.videoId);
            document.title=playlist.get(playing).snippet.title;
        }

        displayPlaying();
        // if(typeof playlist.get(playing)!='undefined')
        //     getSuggestions(playlist.get(playing).id.videoId);
        savePlaying();
    }

    var playNext = function(){
        if(!repeat_one){
            playing++;
            if(playing>=playlist.size())
                if(repeat_all)
                    playing=0;
                else
                    playing=-1;
        }

        playSong();
    }

    var playPrev = function(){
        if(!repeat_one){
            if(playing>-1)
                playing--;
            else
                playing=playlist.size()-1;
        }

        playSong();
    }

    var toggleRepeatMode = function(mode){
        console.log('toggle repeat')

        if (mode !=undefined) {
            repeat_all=false;
            repeat_one=false;
            shuffle=false;

            if (mode=='all'){
                repeat_all=true;
            } else if (mode=='one'){
                repeat_one=true;
            } else if (mode=='shuffle'){
                shuffle=true;
            }

            localStorage.setItem('repeat', mode);
        }

        if(repeat_all)
            $("#play_selected").html('repeat');
        else if(repeat_one)
            $("#play_selected").html('repeat_one');
        else if(shuffle)
            $("#play_selected").html('shuffle');
        else
            $("#play_selected").html('trending_flat');
    }

    var savePlaying = function(){
        localStorage.setItem('playing', playing);
    }

    var songAdded = function() {
        if(playing<0){
            playing = playlist.length-2;
            playNext();
        }
    }

    var songRemoved = function(index) {
        if(playing>index) playing--;
        else if(playing==index) playSong();
    }

    var setPlaying = function(playing_id){
        for(var i=0; i<playlist.length; i++){
            if(playlist[i].id.videoId == playing_id){
                playing = i;
                break;
            }
        }
    }

    playlist.addListener({songAdded: songAdded, songRemoved: songRemoved});
    ytIframe.registerReadyListener(playSong);
    ytIframe.registerStateChangeListener(function(event) {
          if(event.data == YT.PlayerState.ENDED) {
              playNext();
          }
    });
    displayPlaying();

    return {
        displayPlaying: displayPlaying,
        playSong: playSong,
        playNext: playNext,
        playPrev: playPrev,
        toggleRepeatMode: toggleRepeatMode,
        savePlaying: savePlaying,
        setPlaying: setPlaying,
        getCurrent: function() {
            return playlist.get(playing);
        }
    }
});
