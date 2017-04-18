var prettyBytes = require('pretty-bytes');
var gui = require('nw.gui');
var fs = require('fs');
var userhome = require('userhome');
var request = require('request');
var progress = require('request-progress');

window.baseUrl = 'http://konachan.com/';
window.safemode = true;
var curServer = 'konachan';
var servers = {
    'konachan': require(fs.realpathSync('.') + '\\app\\servers\\konachan'),
    'moebooru': require(fs.realpathSync('.') + '\\app\\servers\\moebooru'),
    'danbooru': require(fs.realpathSync('.') + '\\app\\servers\\danbooru'),
}

var curTags;
var curItem;
var curColor = "EE8887"
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
var dlActive = false;
var serverListOpen = false;
var clipboard = gui.Clipboard.get();

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

    loadNextPage();
});

function loadNextPage(tags){
    var tagString = '';
    loadBar.show();
    
    for(var i in tags) {
        tagString += '+';
        tagString += tags[i];
    }

    var path = servers[curServer].getRequestUrl(tagString, page);
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
                var cont = $('<div></div>');

                img.attr( 'src', servers[curServer].getPreviewUrl(item) );
                img.attr( 'data-info', 'some-info' );

                text.attr('class', 'text-content');
                text.append($('<span style="font-size: 20px">' 
                    + servers[curServer].getResolution(item)
                    + '</span><br><span>'
                    + servers[curServer].getTags(item)
                    + '</span>'));

                cont.attr('class', 'container');

                var gridItem = $('<div></div>');
                cont.append(img);
                cont.append(text);
                gridItem.append(cont);
                gridItem.attr('class', 'grid-item');
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

    image.attr('src', servers[curServer].getPreviewUrl(e.data));
    image.attr('data-original', servers[curServer].getSampleUrl(e.data));
    image.lazyload();

    image.click(function(){
        notifyBar('info', 'Copied to clipboard');
        clipboard.set(servers[curServer].getSampleUrl(e.data), 'text');
    });

    var tags = servers[curServer].getTags(e.data).split(" ");
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

    closeServerWindow();
}

function searchByTag(tag){
    page = 1;
    resetGrid();
    closeImageView();
    curTags = [tag];
    path.empty();
    path.append(tag);
    loadNextPage(curTags);
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
    loadNextPage();
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
    if(!dlActive){
        var pics = userhome('Pictures');
        fs.exists(pics + '/MultichanImages/', function(exists){
            pics += '/MultichanImages/';
            if(!exists) fs.mkdirSync(pics);

            var filename = curServer + " - " + servers[curServer].getID(curItem) + ".png";
            var file = fs.createWriteStream(pics + filename);

            $('.download-button').addClass('active');
            $('.download-progress').addClass('active');
            dlActive = true;

            console.log(servers[curServer].getLargeFileUrl(curItem));
            progress(request(servers[curServer].getLargeFileUrl(curItem)), { 
                throttle: 50,
            })
            .on('progress', function (state) {
                updateProgress(state.percent);
            })
            .pipe(file)
            .on('close', function(err){
                if(err) notifyBar('error', 'Error occure while saving image: ' + err);
                else notifyBar('success', 'Image ' + servers[curServer].getID(curItem) + ' was saved');

                $('.download-progress').removeClass('active');
                updateProgress(1);
                setTimeout(function(){ 
                    $('.download-button').removeClass('active');
                    dlActive = false;
                    updateProgress(0); 
                }, 500);
            });
        });
    }
}

function toggleServerWindow() {
    if(serverListOpen) $('.server-dropdown').removeClass('active');
    else $('.server-dropdown').addClass('active');
    serverListOpen = !serverListOpen;
}

function closeServerWindow() {
    $('.server-dropdown').removeClass('active');
    serverListOpen = false;
}

function changeServer(engine, url, safe, color, id) {
    baseUrl = url;
    safeMode = safe;
    curServer = engine;
    curColor = color;
    page = 1;
    closeServerWindow();
    loadNew();

    $(".page-header .logo-image").attr('src', $("#" + id).attr('src'));
    $(".page-header").css("background-color", "#" + color);
}

var transform_styles = ['-webkit-transform', 'transform'];
function updateProgress(prog) {
    var rotation = clamp(Math.floor(prog * 180), 0, 180);
    var fill_rotation = rotation;
    var fix_rotation = rotation * 2;
    for (i in transform_styles) {
        $('.circle .fill, .circle .mask.full').css(transform_styles[i], 'rotate(' + fill_rotation + 'deg)');
        $('.circle .fill.fix').css(transform_styles[i], 'rotate(' + fix_rotation + 'deg)');
    }
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

$('.scroller').scroll(function() {
    if($('.scroller').scrollTop() + $('.scroller').height() >= grid.height() - 500) {
        if(!loading){ 
            loading = true;
            loadNextPage(curTags);
        }
    }
});