var search_res=[];
var playlist=[];
var playing=-1;

var repeat_all=false;
var repeat_one=false;

var template=$('<li class="collection-item avatar valign-wrapper">'+
            '    <img id="img" src="https://i.ytimg.com/vi/1y6smkh6c-0/default.jpg"/>'+
                '<span id="title" class="title valign flow-text">Title</span>'+
                '<button id="action" class="btn-floating red waves-effect waves-light secondary-content valign">'+
                '    <i class="material-icons">add</i>'+
                '</button>'+
            '</li>');

$(window).load(function() {
    console.log("Document Ready");
    loadPlaylist();
    toggleRepeatMode();

    for(var i=0; i<playlist.length; i++){
        var vidrow=getVidRow(playlist[i]);
        var id=playlist[i].id.videoId;
        $(vidrow).addClass("item-video waves-effect");
        $(vidrow).find("#title").attr("onclick","playSong('"+id+"')");
        $(vidrow).find("#action").attr("onclick","removeFromPlaylist('"+id+"')");
        $(vidrow).find("#action i").html("clear");
        vidrow.appendTo("#playlist");

        if(i==playing){
            $(vidrow).addClass("playing");
        }
    }
});


function getVidRow(data){
    var vidrow=template.clone()
    $(vidrow).find("#title").html(data.snippet.title);
    $(vidrow).find("#img").attr("src",data.snippet.thumbnails.default.url);
    $(vidrow).attr("id",data.id.videoId);
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

function displaySearchResults(){
    $("#search_res").empty()
    for(var i=0; i<search_res.length; i++){
        var vidrow=getVidRow(search_res[i]);
        $(vidrow).addClass("item-search");
        $(vidrow).find("#action").attr("onclick","addToPlaylist("+i+")");
        $(vidrow).find("#action i").html("add");
        vidrow.appendTo("#search_res");
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

function addToPlaylist(index){
    playlist.push(search_res[index]);
    savePlaylist();
    //displayPlaylist();
    
    var id=search_res[index].id.videoId;
    var vidrow=getVidRow(search_res[index]);
    $(vidrow).addClass("waves-effect item-video");
    $(vidrow).find("#title").attr("onclick","playSong('"+id+"')");
    $(vidrow).find("#action").attr("onclick","removeFromPlaylist('"+id+"')");
    $(vidrow).find("#action i").html("clear");
    $(vidrow).appendTo("#playlist");

    if(playing<0)
        playNext();
}

function removeFromPlaylist(id){
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

    $("#playlist #"+id).remove();

    if(playing>index) playing--;
    else if(playing==index) playSong();
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

function loadPlaylist() {
    console.log("load playlist");
    if(JSON.parse(localStorage.getItem('new_playlist_saved'))) {
        playlist = JSON.parse(localStorage.getItem('playlist'));
        var rptst = localStorage.getItem('repeat');
        if(rptst=='one')
            repeat_one=true;
        else if(rptst=='all')
            repeat_all=true;

        console.log("loaded playlist");
    }
}