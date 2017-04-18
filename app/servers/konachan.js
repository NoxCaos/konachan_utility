module.exports = {

    getRequestUrl:function (tagString, page) {
        console.log(window.baseUrl);
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
        return 'http:' + item.preview_url;
    },

    getSampleUrl:function (item) {
        return 'http:' + item.sample_url;
    },

    getLargeFileUrl:function (item) {
        return 'http:' + item.file_url;
    },

    getResolution:function (item) {
        return item.width +'x'+ item.height;
    },

    getTags:function (item) {
        return item.tags;
    },
}