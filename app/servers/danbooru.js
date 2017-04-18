var baseUrl = 'https://danbooru.donmai.us';
var safemode = true;

module.exports = {

    getRequestUrl:function (tagString, page) {
        var path = baseUrl + '/posts.json?' 
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
        return baseUrl + item.preview_file_url;
    },

    getSampleUrl:function (item) {
        return baseUrl + item.file_url;
    },

    getLargeFileUrl:function (item) {
        return baseUrl + item.large_file_url;
    },

    getResolution:function (item) {
        return item.image_width +'x'+ item.image_height;
    },

    getTags:function (item) {
        return item.tag_string;
    },
}