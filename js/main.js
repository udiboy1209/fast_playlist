requirejs.config({
    baseUrl: 'js',
    paths: {
        'jquery': 'lib/jquery',
        'hammerjs': 'lib/hammerjs'
    },
    bundles: {
        'youtube': ['ytDataAPI', 'ytIframeAPI'],
    },
    shim: {
        'lib/materialize': {
            exports: ['Materialize','Velocity'],
            deps: ['jquery','hammerjs']
        }
    }
});

console.log('Booting up');

// Pre-load requirements
require(['jquery','lib/velocity'], function(jquery){
    window.jQuery = window.$ = require('jquery');
});

require(['search', 'player', 'playlist',
         'jquery', 'lib/dragula', 'lib/clipboard', 'lib/materialize'],
function(search, player, playlist, $, dragula, Clipboard) {
    console.log("Document Ready");
    var dragged_pos = null;
    var scrollDirection = "none";
    var scrollTrigger = null;

    $("#search").on("keyup keypress", search.triggerSearch);

    playlistDomTop = $("#playlist").offset()['top'];
    playlistDomBot = playlistDomTop + $("#playlist").height();

    var triggerScroll = function(){
        if(scrollTrigger != null)
            clearTimeout(scrollTrigger);

        scrollPlaylist();
    }

    var scrollPlaylist = function(){
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

    // Setup dragula
    dragula([document.getElementById("playlist")])
        .on("drop",function(el, target, source, sibling){
            var dropped_pos = -1;
            var currentPlaying = player.getCurrent();
            if(currentPlaying != undefined)
                var playing_id = currentPlaying.id.videoId;
            var dragged_data = playlist.get(dragged_pos);
            if(sibling == null){
                dropped_pos = playlist.size() - 1;
            } else {
                for(var i=0; i<playlist.size(); i++){
                    if(playlist.get(i).id.videoId == sibling.id){
                        if(dragged_pos < i)
                            dropped_pos = i-1;
                        else
                            dropped_pos = i;
                        break;
                    }
                }
            }
            playlist.moveSong(dragged_pos,dropped_pos,dragged_data);
            player.setPlaying(playing_id);
            dragged_pos = null;
        }).on("drag",function(el, source){
            for(var i=0; i<playlist.size(); i++){
                if(playlist.get(i).id.videoId == el.id){
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

    var getShareLink = function(element){
        base_url = window.location.origin + window.location.pathname;
        ids = playlist.getPlaylistIds();

        id_str = ids.join();
        if(playing>=0)
            id_str+="#"+playing;

        if(playing>=0)
            window.location.hash=playing;

        return base_url+"?playlist="+id_str
    }

    // Setup share copying
    new Clipboard('#share',{
        text: getShareLink,
    }).on('success', function(e){
        Materialize.toast('Share link was copied!', 1000);
    }).on('error', function(e){
        Materialize.toast('Failed to copy share link!', 1000);
    });
});
