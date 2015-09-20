var fs = require('fs');
var userhome = require('userhome');

function addDownloadTask(imageObject) {
	var pics = userhome('Pictures');
    fs.exists(pics + '/KonachanImages', function(exists){
        pics += '/KonachanImages';
        if(!exists) fs.mkdirSync(pics);

        var filename = "/Konachan.com - " + curItem.id + ".png";
        var file = fs.createWriteStream(pics + filename);

        request(curItem.file_url).pipe(file).on('close', function(err){
            if(err) notifyBar('error', 'Error occure while saving image: ' + err);
            else notifyBar('success', 'Image ' + curItem.id + ' was saved');
        });
    });
}

function startIndexing() {

}