var search_res=[];
var suggestions=[];
var playlist=[];
var playlistReady=false;
var playing=-1;

var repeat_all=false;
var repeat_one=false;

var share_link_display=false;

var template=$('<li class="collection-item avatar valign-wrapper">'+
            '    <img id="img" src="https://i.ytimg.com/vi/1y6smkh6c-0/default.jpg"/>'+
                '<span id="title" class="title valign flow-text truncate">Title</span>'+
                '<button id="action" class="btn-floating red waves-effect waves-light secondary-content valign">'+
                '    <i class="material-icons">add</i>'+
                '</button>'+
            '</li>');

function loadWindow(){
    console.log("Document Ready");
    loadPlaylist(function(){
        toggleRepeatMode();

        if(window.location.hash!=undefined)
            playing=parseInt(window.location.hash.substr(1));

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
    });
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

function searchVid(params){
    if(params.length>0){
        YouTube.search.list({
            q:params,
            part:'snippet',
            type:'video',
            videoEmbeddable:'true'
        }).execute(function(response){
            search_res=response.items;
            displaySearchResults();
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
            maxResults:3
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
        $(vidrow).find("#action").attr("onclick","addToPlaylist("+i+",'search')");
        $(vidrow).find("#action i").html("add");
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
    updateShareLink();
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
    //displayPlaylist();

    $("#playlist #"+id).animate({'opacity':'0'},{duration:300,easing:'linear'});
    $("#playlist #"+id).slideUp(
        {duration:400,
        start: function(){
            $(this).attr("class","");
        },
        always:function(){
            this.remove()
        }});

    if(playing>index) playing--;
    else if(playing==index) playSong();

    event.stopPropagation();
    updateShareLink();
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
    if(mode=='all'){
        repeat_all = !repeat_all;
        if(repeat_all) repeat_one = false;
    } else if (mode=='one'){
        repeat_one = !repeat_one;
        if(repeat_one) repeat_all = false;
    }

    $("#repeat_all").removeClass("disabled");
    $("#repeat_one").removeClass("disabled");

    if(!repeat_all) $("#repeat_all").addClass("disabled");

    if(!repeat_one) $("#repeat_one").addClass("disabled");
}

function savePlaylist() {
    localStorage.setItem('playlist', JSON.stringify(playlist));

    var rptst = 'none';
    if(repeat_one) rptst='one';
    else if(repeat_all) rptst='all';

    localStorage.setItem('repeat', rptst);
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('new_playlist_saved', JSON.stringify(true));
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
            updateShareLink();
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

            console.log("loaded playlist");
            updateShareLink();
            done();
        }
    }
}

function updateShareLink(){
    base_url = window.location.origin + window.location.pathname;
    ids = [];

    playlist.forEach(function(vid){
        ids.push(vid.id.videoId);
    });
    id_str = ids.join();
    if(playing>=0)
        id_str += "#"+playing

    $("#share_link").attr("value",base_url+"?playlist="+id_str);
}

function toggleShareLink(){
    if(share_link_display){
        $("#share_link_box").animate({'opacity':'0'},{duration:300,easing:'linear'});
        $("#share_link_box div").slideUp(400);
    } else {
        $("#share_link_box div").removeAttr("style");
        $("#share_link_box").animate({'opacity':'1'},{duration:300,easing:'linear'});
    }

    share_link_display = !share_link_display;
}
