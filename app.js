#!/usr/bin/env node
var finder = require('findit')(process.argv[2] || '.'); //查找文件/文件夹
var ExifImage = require('exif').ExifImage;//获取图片的Exif信息
var fs = require('fs-extra');//移动，复制，删除文件/文件夹
var path = require('path');

finder.on('directory', function (dir, stat, stop) {
    var base = path.basename(dir);
    if (base === '.git' || base === 'node_modules') stop()
    else console.log(dir + '/')
});

finder.on('file', function (file, stat) {
	try {
		new ExifImage({ image : file }, function (error, exifData) {
			if (error){
				console.log('Error: '+error.message);
			}else{
				console.log(exifData.exif.DateTimeOriginal); // Do something with your data!
			}
		});
	}catch (error) {
		console.log('Error: ' + error.message);
	}
});

