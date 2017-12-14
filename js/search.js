define(['ytDataAPI', 'playlist', 'template', 'jquery'],
function(ytData, playlist, template, $) {
    console.log(ytData, playlist, template, $);
    var searchTrigger = null;
    var searchRes = null;
    var searchPlaylist= null;
    var template1=$("<li><h6 class='ti'>title</h6></li>");

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
        if(!$.isEmptyObject(searchPlaylist)){
            var tirow=template1.clone();
            $(tirow).find('.ti').html('playlist');
            tirow.appendTo('#search_res');
            for(song in searchPlaylist){
                var vidrow=template.getVidRow(searchPlaylist[song]);
                $(vidrow).addClass("item-search");
                $(vidrow).on("click",function(){
                    //console.log('clicked '+this.id);
                    var hashId="#playlist > #"+this.id;
                    var target=$(hashId).offset().top-$("#playlist > li:nth-child(1)").offset().top;
                    $("#playlist").animate({
                            scrollTop : target
                        }, 2000);
                    $(hashId).addClass('green lighten-2');
                    setTimeout(function(){
                        $(hashId).removeClass('green lighten-2');
                    },3000);
                });
                $(vidrow).find("#action").css({'display': 'none'});
                vidrow.appendTo("#search_res");
            }
        }
        var tirow=template1.clone();
        $(tirow).find('.ti').html('youtube');
        tirow.appendTo('#search_res');
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
