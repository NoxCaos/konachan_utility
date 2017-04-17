var prettyBytes = require('pretty-bytes');
var gui = require('nw.gui');
var fs = require('fs');
var userhome = require('userhome');
var request = require('request');

var baseUrl = 'http://konachan.com/';
var modes = {
    newest: "post.json?",
    popular: "post/popular_recent.json?",
    loacal: "post.json?"
}
var curType = modes.newest;
var curTags;
var curItem;
var safemode = true;

var page = 1;
var newItems = 0;
var loadedItems = 0;
var loading = false;
var imOpened = false;
var scrollto = 0;
var windoWidth = $(window).width;

var path = $('#cur-path');
var loadBar = $('#content-loader');
var grid = $('.grid');
var $grid = grid.masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        percentPosition: true,
    });

$(document).ready(function(){

    $('*').on('contextmenu', closeImageView);
    $('#quick-search').hide();
    $('#no-internet').hide();

    $('#quick-search').focusout(function(){
        $('#quick-search').hide();
        $('#cur-path').show();
    });

    $('#quick-search').keypress(function(e){
        if(e.which == 13) {
            searchByTag($('#quick-search').val().replace(' ', '_'));
            $('#quick-search').val('');
            $('#quick-search').hide();
            $('#cur-path').show();
        }
    });

    loadNextPage(modes.newest);
});

function loadNextPage(type, tags){
    var tagString = '';
    loadBar.show();
    
    for(var i in tags) {
        tagString += '+';
        tagString += tags[i];
    }

    var path = baseUrl + type 
    + ((safemode || tags != undefined)? 'tags=':'')
    + ((safemode)? 'rating%3As':'') 
    + tagString
    + '&page=' + page;

    request(path, function(error, response, body){
        
        if (error) {
            $('#no-internet').show();
            loadBar.hide();
            grid.hide();
            console.log(error);
            return;
        }

        grid.show();
        $('#no-internet').hide();

        var obj = JSON.parse(response.body);
        newItems = 0;
        loadedItems = 0;

        for(var i in obj) {
            var item = obj[i];

            if (item) {

                var img = $('<img>');
                var text = $('<div></div>');

                img.attr( 'src', 'http:' + item.preview_url );
                img.attr( 'data-info', 'some-info' );

                text.attr('class', 'text-content');
                text.append($('<span style="font-size: 20px">' 
                    + item.width +'x'+ item.height 
                    + '</span><br><span>'
                    + item.tags
                    + '</span>'));

                var gridItem = $('<div></div>');
                gridItem.append(img);
                gridItem.append(text);
                gridItem.attr('class', 'grid-item');
                //gridItem.attr('style', 'height: '
                //    + item.actual_preview_height + ';');
                gridItem.click(item, loadImagePreview);
                newItems+=1;

                img.load(function(){
                    loadedItems+=1;
                    if(loadedItems >= newItems){
                        grid.masonry();
                        loading = false;
                        loadBar.hide();
                    }
                });

                grid.append(gridItem).masonry('appended', gridItem);
            }
        }

        page+=1;
    });
}

function loadImagePreview(e){
    loading = true;
    curItem = e.data;
    var image = $('#large-image');
    var container = $('.full-image');
    var tagContainer = $('.tags');
    var ferroMenu = $('#ferromenu-controller-0');

    scrollto = $('.scroller').scrollTop();
    windoWidth = $('.scroller').width;

    image.attr('src', 'http:' + e.data.preview_url);
    image.attr('data-original', 'http:' + e.data.sample_url);
    image.lazyload();

    image.click(function(){
        notifyBar('info', 'Right click to close');
    });

    var tags = e.data.tags.split(" ");
    tagContainer.empty();

    for(var i in tags) {
        var li = $('<li></li>');
        var a = $('<a>' + tags[i] + '</a>');

        li.click(tags[i], function(e){
            searchByTag(e.data);
        });

        li.append(a);
        tagContainer.append(li);
        tagContainer.append($('<br><br>'));
    }

    container.show();
    container.fadeTo("slow", 1);
    ferroMenu.show();
    ferroMenu.fadeTo("slow", 1);
    
    grid.fadeTo(0, 0)
    grid.hide();
}

function searchByTag(tag){
    page = 1;
    resetGrid();
    closeImageView();
    curTags = [tag];
    path.empty();
    path.append(tag);
    loadNextPage(modes.newest, curTags);
    removeSidebarActiveState();
}

function resetGrid(){
    grid.empty();
    scrollto = 0;
    $('.scroller').scrollTop(0);
    grid.append($('<div class="grid-sizer"></div>'));
}

function closeImageView(){
    $('.full-image').fadeTo(0, 0);
    $('.full-image').hide();
    $('#ferromenu-controller-0').hide();
    grid.show();
    grid.fadeTo("slow", 1);
    if(windoWidth != $(window).width) grid.masonry();
    $('.scroller').scrollTop(scrollto);
    loading = false;
    closePictureMenu();
}

function openPictureMenu(){
    if(imOpened) {
        closePictureMenu();
    } else {
        imOpened = true;
        $('.image-menu').addClass('open');
        $('.image-menu #delay1').addClass('active');
        $('.image-menu #delay2').addClass('active');
        $('.image-menu #delay3').addClass('active');
        $('.image-menu #delay4').addClass('active');
    }
}

function closePictureMenu(){
    $('.image-menu').removeClass('open');
    $('.image-menu #delay1').removeClass('active');
    $('.image-menu #delay2').removeClass('active');
    $('.image-menu #delay3').removeClass('active');
    $('.image-menu #delay4').removeClass('active');
    imOpened = false;
}

function loadNew() {
    page = 1;
    loading = true;
    resetGrid();
    loadNextPage(modes.newest);
    path.empty();
    path.append('MAIN');

    removeSidebarActiveState();
    $('.button#loadnew').addClass('active');
}

function removeSidebarActiveState(){
    $('.button#loadnew').removeClass('active');
}

function quickTagSearch() {
    $('#quick-search').show();
    $('#cur-path').hide();
    $('#quick-search').focus();
}

function notifyBar(type, message) {
    if(! $('.alert-box').length) {
        $('<div class="alert-box '+ type 
            +'"" >'+ message
            +'</div>').prependTo('body').delay(2500).fadeOut(1000, function() {
            $('.alert-box').remove();
        });
    };
}

function rate() {

}

function download() {
    var pics = userhome('Pictures');
    fs.exists(pics + '/KonachanImages', function(exists){
        pics += '/KonachanImages';
        if(!exists) fs.mkdirSync(pics);

        var filename = "/Konachan.com - " + curItem.id + ".png";
        var file = fs.createWriteStream(pics + filename);

        request('http:' + curItem.file_url).pipe(file).on('close', function(err){
            if(err) notifyBar('error', 'Error occure while saving image: ' + err);
            else notifyBar('success', 'Image ' + curItem.id + ' was saved');
        });
    });
}

function showStats() {

}

function cropAndCopy() {

}

$('.scroller').scroll(function() {
    if($('.scroller').scrollTop() + $('.scroller').height() >= grid.height() - 200) {
        if(!loading){ 
            loading = true;
            loadNextPage(curType, curTags);
            console.log(page);
        }
    }
});