#!/usr/bin/env node
var argvPath = process.argv[2] || '.' //传入的路径
var rootFolder = "照片整理"
var finder = require('findit')(argvPath); //查找文件/文件夹
var ExifImage = require('exif').ExifImage;//获取图片的Exif信息
var fs = require('fs-extra');//移动，复制，删除文件/文件夹
var path = require('path');

function createRootFolder(){
	//创建根目录文件夹
	finder.on("directory",function(dir,stat,stop){
		var base = path.basename(dir);
		if (base === '.git' || base === 'node_modules') stop()
		if(rootFolder !== dir){
			fs.mkdirs(rootFolder, function(err){
				if (err) return console.error(err);
			});
		}
		
		 if(rootFolder === dir){
			stop()
		}
	})
	finder.on('file', function (file, stat) {
		try {
			new ExifImage({ image : file }, function (error, exifData) {
				if (error){
					console.log('Error: '+error.message);
				}else{
					createPhotoFolder(exifData,file)
				}
			});
		}catch (error) {
			console.log('Error: ' + error.message);
		}
	});

}
function createPhotoFolder(data,name){
	var takenTime = data.exif.DateTimeOriginal || data.image.DateTimeOriginal
	console.log(data,'filename')
	if(!takenTime){
		console.log(name + ": no taken time")
		return false
	}	
	var temp = takenTime.split(":")
	takenTime = temp[0] + "-" + temp[1]
	fs.mkdirs("./" + rootFolder + "/" +takenTime, function(err){
		if (err) return console.error(err);
		var oldPath = argvPath + "/" + name
		var newPath = "./" + rootFolder + "/" + takenTime + "/" + name
		fs.move(oldPath,newPath, function(err){
  			if (err) return console.error(err);
  			console.log(name + " move success!")
		});
	});
}


createRootFolder()	
