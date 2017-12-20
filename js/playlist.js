define(['ytDataAPI', 'ytIframeAPI', 'template','jquery'],
function(ytData,ytIframe,template,$) {
    var playlist=[];
    var durations=[];
    var repeat = [];
    var total_duration = 0;
    var playlistChangeListeners = [];
    var curr_id;
    var setup = function() {
        // Load playlist from cache/url
        if($.query.playlist!=undefined){
            ytData.api.videos.list({
                id:$.query.playlist,
                part:'snippet'
            }).execute(function(response){
                response.items.forEach(function(r){
                    playlist[curr_id].push({'id':{'videoId':r.id},'snippet':r.snippet});
                });

                console.log('fetched playlist');
                savePlaylist();
            });
        } else {
            if(JSON.parse(localStorage.getItem('new_playlist_saved'))) {
                playlist = JSON.parse(localStorage.getItem('playlist'));
                if (curr_id==undefined) curr_id=playlist.length-1;
                repeat = JSON.parse(localStorage.getItem('repeat'));
                var rptst = repeat[curr_id];
                durations=JSON.parse(localStorage.getItem('duration'));
                total_duration = durations[curr_id];
                updateDurationOnDisplay();
                addPlaylistDropdown();

                if(rptst=='one')
                    repeat_one=true;
                else if(rptst=='all')
                    repeat_all=true;
                else if(rptst=='shuffle')
                    shuffle=true;
                console.log("loaded playlist");
            }
        }
        if (playlist.length!=0){
            // Display all playlist songs
            for(var i=0; i<playlist[curr_id].length; i++){
                var vidrow=template.getVidRow(playlist[curr_id][i]);
                var id=playlist[curr_id][i].id.videoId;
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
        else addPlaylist();
        $('#playlist_header').text("Playlist "+(curr_id+1));
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
        durations[curr_id]=total_duration;
        localStorage.setItem('duration', JSON.stringify(durations));
    }

    var savePlaylist = function() {
        localStorage.setItem('playlist', JSON.stringify(playlist));
        localStorage.setItem('new_playlist_saved', JSON.stringify(true));
    }

    var saveRepeat = function(mode){
        repeat[curr_id] = mode;
        localStorage.setItem('repeat', JSON.stringify(repeat));
    }

    var addToPlaylist = function(viddata){
        // fetch length of video and add to playtime
        getContentDuration(viddata.id.videoId);

        var j=0;
        for(var i=0; i<playlist[curr_id].length; i++){
            if(viddata.id.videoId==playlist[curr_id][i].id.videoId)
                break;
            j++;
        }
        if(j<playlist[curr_id].length){
            Materialize.toast('Song already exists in playlist!', 2000);
            return;
        }

        playlist[curr_id].push(viddata);
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
        for(var i=0; i<playlist[curr_id].length; i++){
            if(id==playlist[curr_id][i].id.videoId)
                break;
            index++;
        }
        console.log("remove: "+index, id);
        getContentDuration(id, -1);

        playlist[curr_id].splice(index,1);
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
        playlist[curr_id].forEach(function(vid){
            ids.push(vid.id.videoId);
        });
        return ids;
    }

    var addListener = function(listener){
        playlistChangeListeners.push(listener);
    }

    var moveSong = function(from, to, song){
        playlist[curr_id].splice(from, 1);
        playlist[curr_id].splice(to, 0, song);
        savePlaylist();
    }

    var clearPlaylist = function(){ 
        ytIframe.player.stopVideo();
        playlist[curr_id]=[];
        total_duration = 0;
        $('#playlist li').remove();
        $('#totalDuration').text("00:00:00");
        savePlaylist();
        saveDuration();
        document.title= "Youtube Fast Playlist";
    }

    var addPlaylist = function(){
        if(ytIframe.player!=undefined) ytIframe.player.stopVideo();
        curr_id=playlist.length;
        total_duration = 0;
        $('#totalDuration').text("00:00:00");
        $('#playlist li').remove();
        playlist[curr_id]=[];
        savePlaylist();
        saveDuration();
        saveRepeat();
        localStorage.setItem('curr_id',curr_id);
        document.title= "Youtube Fast Playlist";
        setup();
    }

    var addPlaylistDropdown = function(){
        var lis=$('#playlists li').length;
        for (var i = lis ; i < playlist.length; i++) {
            $('#playlists').append('<li id='+i+'><br>Playlist'+(i+1)+'</br></li>');
            $($('#playlists li')[i]).on('click', function(){
                changePlaylist(event);
            });
        }

    }

    var changePlaylist= function(event){
        if(ytIframe.player!=undefined) ytIframe.player.stopVideo();
        curr_id=parseInt(event.target.id);
        localStorage.setItem('curr_id',curr_id);
        $('#playlist li').remove();
        localStorage.setItem('playing',-1);
        setup();
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
        clearPlaylist: clearPlaylist,
        addPlaylist: addPlaylist,
        saveRepeat: saveRepeat,
        size: function(){
            return playlist[curr_id].length;
        },
        get: function(index) {
            return playlist[curr_id][index];
        },
    }
});
