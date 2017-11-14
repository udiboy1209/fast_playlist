define(['ytDataAPI', 'playlist', 'template', 'jquery'],
function(ytData, playlist, template, $) {
    var searchTrigger = null;
    var searchRes = null;

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
        $("#search_res").empty()
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
