define(['jquery'],function($) {
    var template=$('<li class="collection-item avatar valign-wrapper">'+
                '    <img id="img"/>'+
                    '<span id="title" class="title valign flow-text truncate">Title</span>'+
                    '<a id="action" class="secondary-content valign" title="Remove">'+
                    '    <i class="material-icons">add</i>'+
                    '</button>'+
                '</li>');

    return {
        getVidRow: function(data) {
            var vidrow=template.clone()
            $(vidrow).find("#title").html(data.snippet.title);
            $(vidrow).find("#img").attr("src",data.snippet.thumbnails.default.url);
            $(vidrow).attr("id",data.id.videoId);
            $(vidrow).attr('title',data.snippet.title);
            $(vidrow).css("opacity","0");
            $(vidrow).animate({"opacity":"1"},{always:function(){$(this).removeAttr("style")}});
            return vidrow;
        }
    }
});
