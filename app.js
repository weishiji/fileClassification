#!/usr/bin/env node
//var argvPath = process.argv[2] || '.' //传入的路径
var rootFolder = "1688"
//var finder = require('findit')(argvPath); //查找文件/文件夹
var ExifImage = require('exif').ExifImage;//获取图片的Exif信息
var fs = require('fs-extra');//移动，复制，删除文件/文件夹
var path = require('path');


(function(){
	function ClassFication(){
			this.createRootFolder();
			this.args = process.argv.slice(2);
	}
	ClassFication.prototype.createRootFolder = function(){
		fs.ensureDir(rootFolder,function(err){
			if(err) console.error('create rootFoler error');
			this.scanDir();
		}.bind(this));
	}
	ClassFication.prototype.scanDir = function(){
		//扫描文件夹
		var finder = this.args[0] ? require('findit')('./'+this.args[0]) : require('findit')('.');
		finder.on('file',function(filePath, stat){
			this.isPicture(filePath);
		}.bind(this));
		finder.on('directory',function(dir,stat,stop){
			var base = path.basename(dir);
	    if (base === '.git' || base === 'node_modules') stop()
			else if (!this.args[0] && base === rootFolder) stop()
	    else console.log(dir + '/')
		}.bind(this))
	}
	ClassFication.prototype.isPicture = function(filePath){
		var CF = this;
		try {
			new ExifImage({ image : filePath }, function (error, exifData) {
				if (error){
					console.log('Error: '+error.message);
				}else{
					CF.createPhotoFolder(exifData,filePath)
				}
			});
		}catch (error) {
			//console.log('Error: ' + error.message);
		}
	}
	ClassFication.prototype.createPhotoFolder = function(exifData,filePath){
		var fileName = this.getFileName(filePath);

		//TODO:改变规则，进行分类
		//var categoryDir = this.makeCategoryDirByTakenTime(exifData);
		var categoryDir = this.makeCategoryDirByFileName(fileName);

		var pathArr = [rootFolder];
		if(this.args[0]) pathArr.push(this.args[0]);
		if(categoryDir) pathArr.push(categoryDir);

		var newPath = pathArr.join('/')
		fs.mkdirsSync(newPath);

		fs.move(filePath,newPath+'/'+fileName,function(err){
			if (err) return console.error(err);
			console.log(fileName + " move success!")
		})
	}
	ClassFication.prototype.makeCategoryDirByTakenTime = function(data){
		//通过照片的拍照时间创建图片
		var takenTime = data.exif.DateTimeOriginal || data.image.DateTimeOriginal;
		if(!takenTime){
			return false;
		}
		var temp = takenTime.split(":");
		takenTime = temp[0] + "-" + temp[1];
		return takenTime;
	}
	ClassFication.prototype.getFileName = function(filePath){
		return path.basename(filePath)
	}
	ClassFication.prototype.makeCategoryDirByFileName = function(fileName){
		if(!fileName.match(/.*(-.*)+?/)){
			console.log(fileName + ': this is image name is illegal ');
			return '';
		}
		return fileName.split('-')[0];
	}
	new ClassFication();
}());
