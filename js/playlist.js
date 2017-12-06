define(['ytDataAPI', 'ytIframeAPI', 'template','jquery'],
function(ytData,ytIframe,template,$) {
    var playlist=[];
    var total_duration = 0;
    var playlistChangeListeners = []

    var setup = function() {
        // Load playlist from cache/url
        if($.query.playlist!=undefined){
            ytData.api.videos.list({
                id:$.query.playlist,
                part:'snippet'
            }).execute(function(response){
                response.items.forEach(function(r){
                    playlist.push({'id':{'videoId':r.id},'snippet':r.snippet});
                });

                console.log('fetched playlist');
                savePlaylist();
            });
        } else {
            if(JSON.parse(localStorage.getItem('new_playlist_saved'))) {
                playlist = JSON.parse(localStorage.getItem('playlist'));
                var rptst = localStorage.getItem('repeat');

                total_duration = JSON.parse(localStorage.getItem('total_duration'));
                updateDurationOnDisplay();

                if(rptst=='one')
                    repeat_one=true;
                else if(rptst=='all')
                    repeat_all=true;
                else if(rptst=='shuffle')
                    shuffle=true;

                console.log("loaded playlist");
            }
        }

        // Display all playlist songs
        for(var i=0; i<playlist.length; i++){
            var vidrow=template.getVidRow(playlist[i]);
            var id=playlist[i].id.videoId;
            $(vidrow).addClass("item-video waves-effect");
            $(vidrow).on("click", function(id){return function(event){
                require('player').playSong(id);
            }}(id));
            $(vidrow).find("#action").on("click",function(id){return function(event){
                removeFromPlaylist(event,id);
            }}(id));
            $(vidrow).find("#action i").html("clear");
            vidrow.appendTo("#playlist");
        }
    }

    var parseDuration = function(duration, sign){
        // Fix a backward compatibility bug which leads to negative time
        if(sign < 0 && total_duration==0) return;

        var array=duration.match(/(\d+)(?=[MHS])/ig)||[];

        var formatted=array.map(function(item){
                if(item.length<2) return '0'+item;
                    return item;
        });
        var multiplier=1;
        for(var i=formatted.length-1;i>=0;i--){
            total_duration=total_duration + sign*parseInt(formatted[i])*multiplier;
            multiplier *=60;
        }

        updateDurationOnDisplay();
        saveDuration();
    }

    var getContentDuration = function(id, sign=1){
        ytData.api.videos.list({
            id:id,
            part:'contentDetails',
        }).execute(function(response){
            if(response.items.length){
                duration=response.items[0].contentDetails.duration;
                parseDuration(duration, sign);
            }
        });
    }

    var updateDurationOnDisplay = function() {
        var date=new Date(null);
        date.setSeconds(total_duration);
        var result=date.toISOString().substr(11, 8);

        $("#totalDuration").html(result);
    }

    var saveDuration = function() {
        localStorage.setItem('total_duration', JSON.stringify(total_duration));
    }

    var savePlaylist = function() {
        localStorage.setItem('playlist', JSON.stringify(playlist));
        localStorage.setItem('new_playlist_saved', JSON.stringify(true));
    }

    var addToPlaylist = function(viddata){
        // fetch length of video and add to playtime
        getContentDuration(viddata.id.videoId);

        var j=0;
        for(var i=0; i<playlist.length; i++){
            if(viddata.id.videoId==playlist[i].id.videoId)
                break;
            j++;
        }
        if(j<playlist.length){
            Materialize.toast('Song already exists in playlist!', 2000);
            return;
        }

        playlist.push(viddata);
        savePlaylist();
        //displayPlaylist();

        var id=viddata.id.videoId;
        var vidrow=template.getVidRow(viddata);
        $(vidrow).addClass("waves-effect item-video");
        $(vidrow).on("click", function(event){
            require('player').playSong(id);
        });
        $(vidrow).find("#action").on("click",function(event){
            removeFromPlaylist(event,id);
        });
        $(vidrow).find("#action i").html("clear");
        $(vidrow).appendTo("#playlist");

        for(listener in playlistChangeListeners){
            playlistChangeListeners[listener].songAdded();
        }
        //getSuggestions(id);
    }

    var removeFromPlaylist = function(event,id){
        var index=0;
        for(var i=0; i<playlist.length; i++){
            if(id==playlist[i].id.videoId)
                break;
            index++;
        }
        console.log("remove: "+index, id);
        getContentDuration(id, -1);

        playlist.splice(index,1);
        savePlaylist();

        $("#playlist #"+id).animate({'opacity':'0'},{duration:300,easing:'linear'});
        $("#playlist #"+id).slideUp(
            {duration:400,
            start: function(){
                $(this).attr("class","");
            },
            always:function(){
                this.remove()
            }});

        for(listener in playlistChangeListeners){
            playlistChangeListeners[listener].songRemoved(index);
        }

        event.stopPropagation();
    }

    var getPlaylistIds = function(){
        var ids = [];
        playlist.forEach(function(vid){
            ids.push(vid.id.videoId);
        });
        return ids;
    }

    var addListener = function(listener){
        playlistChangeListeners.push(listener);
    }

    var moveSong = function(from, to, song){
        playlist.splice(from, 1);
        playlist.splice(to, 0, song);
        savePlaylist();
    }




    setup();

    return {
        savePlaylist: savePlaylist,
        removeFromPlaylist: removeFromPlaylist,
        addToPlaylist: addToPlaylist,
        saveDuration: saveDuration,
        getPlaylistIds: getPlaylistIds,
        addListener: addListener,
        moveSong: moveSong,
        size: function() {
            return playlist.length;
        },
        get: function(index) {
            return playlist[index];
        }
    }
});
