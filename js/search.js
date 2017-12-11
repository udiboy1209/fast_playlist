define(['ytDataAPI', 'playlist', 'template', 'jquery'],
function(ytData, playlist, template, $) {
    console.log(ytData, playlist, template, $);
    var searchTrigger = null;
    var searchRes = null;
    var searchPlaylist= null;

    var triggerSearch = function(e) {
        var key = e.keyCode || e.which;
        if(key === 13){ // Enter pressed
            e.preventDefault();
            return false;
        }
        if(searchTrigger != null)
            clearTimeout(searchTrigger);
        searchTrigger = setTimeout(function(){searchVid($("#search").val())}, 500);
    }

    var searchVid = function(params){
        if(params.length>0){
            searchPlaylist={};
            var pattern=new RegExp(params,'i');
            for(var si=0;si<playlist.size();si++){
                var song=playlist.get(si);
                var title=song.snippet.title;
                if(title.search(pattern)!==-1){
                    //console.log(song);
                    var id=song.id.videoId;
                    searchPlaylist[id]=song;
                }
            }
            ytData.api.search.list({
                q:params,
                part:'snippet',
                type:'video',
                videoEmbeddable:'true',
                maxResults:7
            }).execute(function(response){
                searchRes={};
                for(item in response.items){
                    var id = response.items[item].id.videoId;
                    searchRes[id] = response.items[item];
                }
                displaySearchResults();
                searchTrigger = null;
            });
        }
    }

    var displaySearchResults = function(){
        $("#search_res").empty();
        $("#search_res").append("<li><h6 class='ti'>Playlist</h6></li>");
        if(searchPlaylist===null){
            $("#search_res").append("<p>Nothing found</p>");
        }else{
            for(song in searchPlaylist){
                var vidrow=template.getVidRow(searchPlaylist[song]);
                $(vidrow).addClass("item-search");
                $(vidrow).on("click",function(){
                    //console.log('clicked '+this.id);
                    var hashId="#playlist > #"+this.id;
                    $("#playlist").animate({
                            scrollTop : $(hashId).offset().top
                        }, 2000);
                    $(hashId).css({'background-color':'#56BD81'});
                    setTimeout(function(){
                        $(hashId).css({'background-color':'#fff'});
                    },3000);
                });
                $(vidrow).find("#action").css({'display': 'none'});
                vidrow.appendTo("#search_res");
            }
        }
        $("#search_res").append("<li><h6 class='ti'>Youtube</h6></li>");
        for(result in searchRes){
            var vidrow=template.getVidRow(searchRes[result]);
            $(vidrow).addClass("item-search");
            $(vidrow).on("click",function(id){return function(){
                playlist.addToPlaylist(searchRes[id]);
            }}(result));
            $(vidrow).find("#action").css({'display':'none'});
            vidrow.appendTo("#search_res");
        }
    }

    return {
        triggerSearch: triggerSearch,
        searchVid: searchVid,
        displaySearchResults: displaySearchResults
    }
});
