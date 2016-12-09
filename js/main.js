var search_res=[];
var suggestions=[];
var playlist=[];
var playlistReady=false;
var playing=-1;

var repeat_all=false;
var repeat_one=false;
var shuffle=false;

var dragged_pos=null;
var dragged_playing=false;

var template=$('<li class="collection-item avatar valign-wrapper">'+
            '    <img id="img"/>'+
                '<span id="title" class="title valign flow-text truncate">Title</span>'+
                '<a id="action" class="secondary-content valign" title="Remove">'+
                '    <i class="material-icons">add</i>'+
                '</button>'+
            '</li>');

var searchTrigger = null;

var playlistDomTop = null;
var scrollDirection = "none";
var scrollTrigger = null;

function loadWindow(){
    console.log("Document Ready");

    $("#search").on("keyup keypress", triggerSearch);

    playlistDomTop = $("#playlist").offset()['top'];
    playlistDomBot = playlistDomTop + $("#playlist").height();

    loadPlaylist(function(){
        toggleRepeatMode();

        playing=parseInt(localStorage.getItem('playing'));

        if(window.location.hash!="")
            playing=parseInt(window.location.hash.substr(1));

        if(isNaN(playing))
            playing=-1;
        if(playing>=playlist.length)
            playing=-1;

        for(var i=0; i<playlist.length; i++){
            var vidrow=getVidRow(playlist[i]);
            var id=playlist[i].id.videoId;
            $(vidrow).addClass("item-video waves-effect");
            $(vidrow).attr("onclick","playSong('"+id+"')");
            $(vidrow).find("#action").attr("onclick","removeFromPlaylist(event,'"+id+"')");
            $(vidrow).find("#action i").html("clear");
            vidrow.appendTo("#playlist");

            if(i==playing){
                $(vidrow).addClass("playing");
            }
        }

        playlistReady=true;
        if(playerReady)
            playSong();

        dragula([document.getElementById("playlist")])
            .on("drop",function(el, target, source, sibling){
                var dropped_pos = -1;
                var playing_id = playlist[playing].id.videoId;
                var dragged_data = playlist[dragged_pos];
                if(sibling == null){
                    dropped_pos = playlist.length - 1;
                } else {
                    for(var i=0; i<playlist.length; i++){
                        if(playlist[i].id.videoId == sibling.id){
                            if(dragged_pos < i)
                                dropped_pos = i-1;
                            else 
                                dropped_pos = i;
                            break;
                        }
                    }
                }
                playlist.splice(dragged_pos, 1);
                playlist.splice(dropped_pos, 0, dragged_data);

                for(var i=0; i<playlist.length; i++){
                    if(playlist[i].id.videoId == playing_id){
                        playing = i;
                        break;
                    }
                }
                dragged_pos = null;

                savePlaylist();
            }).on("drag",function(el, source){
                for(var i=0; i<playlist.length; i++){
                    if(playlist[i].id.videoId == el.id){
                        dragged_pos = i;
                        break;
                    }
                }
            }).on("out",function(el,container,source){
                var posTop = $(".gu-mirror").offset()['top'];
                var posBot = $(".gu-mirror").height() + posTop;

                if(posTop < playlistDomTop) scrollDirection = "up";
                if(posBot > playlistDomBot) scrollDirection = "down";

                triggerScroll();
            }).on("over", function(el,container,source){
                scrollDirection = "none";
            });

        setupShareCopy();
    });
}

function triggerScroll(){
    if(scrollTrigger != null)
        clearTimeout(scrollTrigger);

    scrollPlaylist();
}

function scrollPlaylist(){
    if(scrollDirection == "none"){
        scrollTrigger = null;
    } else {
        var p = $("#playlist");
        var curr = p.scrollTop();

        if(scrollDirection == "up")
            curr -= 10;
        if(scrollDirection == "down")
            curr += 10;
        p.scrollTop(curr);

        scrollTrigger = setTimeout(scrollPlaylist, 30);
    }
}

function getVidRow(data){
    var vidrow=template.clone()
    $(vidrow).find("#title").html(data.snippet.title);
    $(vidrow).find("#img").attr("src",data.snippet.thumbnails.default.url);
    $(vidrow).attr("id",data.id.videoId);
    $(vidrow).attr('title',data.snippet.title);
    $(vidrow).css("opacity","0");
    $(vidrow).animate({"opacity":"1"},{always:function(){$(this).removeAttr("style")}});
    return vidrow;
}

function triggerSearch(e){
    var key = e.keyCode || e.which;
    if(key === 13){ // Enter pressed
        e.preventDefault();
        return false;
    }

    if(searchTrigger != null)
        clearTimeout(searchTrigger);

    searchTrigger = setTimeout(function(){searchVid($("#search").val())}, 500);
}

function searchVid(params){
    if(params.length>0){
        YouTube.search.list({
            q:params,
            part:'snippet',
            type:'video',
            videoEmbeddable:'true',
            maxResults:7
        }).execute(function(response){
            search_res=response.items;
            displaySearchResults();
            searchTrigger = null;
        });
    }
}

function getSuggestions(vidId){
    if(vidId.length>0){
        YouTube.search.list({
            relatedToVideoId:vidId,
            part:'snippet',
            type:'video',
            videoEmbeddable:'true',
            maxResults:7
        }).execute(function(response){
            suggestions=response.items;
            displaySuggestions();
        });
    }
}

function displaySearchResults(){
    $("#search_res").empty()
    for(var i=0; i<search_res.length; i++){
        var vidrow=getVidRow(search_res[i]);
        $(vidrow).addClass("item-search");
        $(vidrow).attr("onclick","addToPlaylist("+i+",'search')");
        $(vidrow).find("#action").css({'display':'none'});
        vidrow.appendTo("#search_res");
    }
}

function displaySuggestions(){
    $("#suggestions").empty()
    for(var i=0; i<suggestions.length; i++){
        var vidrow=getVidRow(suggestions[i]);
        $(vidrow).addClass("item-search");
        $(vidrow).find("#action").attr("onclick","addToPlaylist("+i+",'suggestion')");
        $(vidrow).find("#action i").html("add");
        vidrow.appendTo("#suggestions");
    }
}

function displayPlaying(){
    //$("#playlist").empty()
    for(var i=0; i<playlist.length; i++){
        if(i==playing){
            $("#playlist").children().eq(i).addClass("playing");
        } else {
            $("#playlist").children().eq(i).removeClass("playing");
        }
    }
}

function addToPlaylist(index, from){
    var viddata;
    if(from == 'search')
        viddata = search_res[index];
    else if(from == 'suggestion')
        viddata = suggestions[index];

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
    var vidrow=getVidRow(viddata);
    $(vidrow).addClass("waves-effect item-video");
    $(vidrow).attr("onclick","playSong('"+id+"')");
    $(vidrow).find("#action").attr("onclick","removeFromPlaylist(event,'"+id+"')");
    $(vidrow).find("#action i").html("clear");
    $(vidrow).appendTo("#playlist");

    if(playing<0)
        playNext();

    getSuggestions(id);
}

function removeFromPlaylist(event,id){
    var index=0;
    for(var i=0; i<playlist.length; i++){
        if(id==playlist[i].id.videoId)
            break;
        index++;
    }
    console.log("remove: "+index);

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
            displayPlaying();
        }});

    if(playing>index) playing--;
    else if(playing==index) playSong();

    event.stopPropagation();
}

function playSong(id){
    if(playing>=0 && playing<playlist.length && id==playlist[playing].id.videoId)
        return;

    if(id != undefined){
        var index=0;
        for(var i=0; i<playlist.length; i++){
            if(id==playlist[i].id.videoId)
                break;
            index++;
        }
        console.log("play: "+index);
        playing=index;
    }

    player.stopVideo();

    if(playing>=0 && playing<playlist.length){
        player.loadVideoById(playlist[playing].id.videoId);
        document.title=playlist[playing].snippet.title;
    }

    displayPlaying();
    getSuggestions(playlist[playing].id.videoId);
    savePlaying();
}

function playNext(){
    if(!repeat_one){
        playing++;
        if(playing>=playlist.length)
            if(repeat_all)
                playing=0;
            else
                playing=-1;
    }

    playSong();
}

function playPrev(){
    if(!repeat_one){
        if(playing>-1)
            playing--;
        else
            playing=playlist.length-1;
    }

    playSong();
}

function toggleRepeatMode(mode){
    console.log('toggle repeat')

    if (mode != undefined) {
        repeat_all = false;
        repeat_one = false;
        shuffle = false;

        if (mode == 'all'){
            repeat_all = true;
        } else if (mode == 'one'){
            repeat_one = true;
        } else if (mode == 'shuffle'){
            shuffle = true;
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

function reorderPlaylist(el, target, source, sibling){
}

function savePlaylist() {
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('new_playlist_saved', JSON.stringify(true));
}

function savePlaying(){
    localStorage.setItem('playing', playing);
}

function loadPlaylist(done) {
    console.log("load playlist");
    if($.query.playlist!=undefined){
        YouTube.videos.list({
            id:$.query.playlist,
            part:'snippet'
        }).execute(function(response){
            response.items.forEach(function(r){
                playlist.push({'id':{'videoId':r.id},'snippet':r.snippet});
            });
            
            console.log('fetched playlist');
            done();
            savePlaylist();
        });
    } else {
        if(JSON.parse(localStorage.getItem('new_playlist_saved'))) {
            playlist = JSON.parse(localStorage.getItem('playlist'));
            var rptst = localStorage.getItem('repeat');

            if(rptst=='one')
                repeat_one=true;
            else if(rptst=='all')
                repeat_all=true;
            else if(rptst=='shuffle')
                shuffle=true;

            console.log("loaded playlist");
            done();
        }
    }
}

function getShareLink(element){
    base_url = window.location.origin + window.location.pathname;
    ids = [];

    playlist.forEach(function(vid){
        ids.push(vid.id.videoId);
    });
    id_str = ids.join();
    if(playing>=0)
        id_str+="#"+playing;

    if(playing>=0)
        window.location.hash=playing;

    return base_url+"?playlist="+id_str
}

function setupShareCopy(){
    new Clipboard('#share',{
        text: getShareLink,
    }).on('success', function(e){
        Materialize.toast('Share link was copied!', 1000);
    }).on('error', function(e){
        Materialize.toast('Failed to copy share link!', 1000);
    });
}
