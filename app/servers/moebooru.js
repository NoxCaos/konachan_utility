var baseUrl = 'http://konachan.com/';
var safemode = true;

module.exports = {

    getRequestUrl:function (tagString, page) {
        var path = baseUrl + 'post.json?' 
            + ((safemode || tagString != undefined)? 'tags=':'')
            + ((safemode)? 'rating%3As':'') 
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