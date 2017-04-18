module.exports = {

    getRequestUrl:function (tagString, page) {
        var path = window.baseUrl + '/posts.json?' 
            + ((window.safemode || tagString != undefined)? 'tags=':'')
            + ((window.safemode)? 'rating%3As':'') 
            + tagString
            + '&page=' + page;
            console.log(path);
        return path;
    },

    getID:function (item) {
        return item.id;
    },

    getPreviewUrl:function (item) {
        return window.baseUrl + item.preview_file_url;
    },

    getSampleUrl:function (item) {
        return window.baseUrl + item.file_url;
    },

    getLargeFileUrl:function (item) {
        return window.baseUrl + item.large_file_url;
    },

    getResolution:function (item) {
        return item.image_width +'x'+ item.image_height;
    },

    getTags:function (item) {
        return item.tag_string;
    },
}