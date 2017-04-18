module.exports = {

    getRequestUrl:function (tagString, page) {
        var path = window.baseUrl + 'post.json?' 
            + ((window.safemode || tagString != undefined)? 'tags=':'')
            + ((window.safemode)? 'rating%3As':'') 
            + tagString
            + '&page=' + page;
        return path;
    },

    getID:function (item) {
        return item.id;
    },

    getPreviewUrl:function (item) {
        return item.preview_url;
    },

    getSampleUrl:function (item) {
        return item.sample_url;
    },

    getLargeFileUrl:function (item) {
        return item.file_url;
    },

    getResolution:function (item) {
        return item.width +'x'+ item.height;
    },

    getTags:function (item) {
        return item.tags;
    },
}