
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Spritesmith = require('spritesmith');
const loaderUtils = require('loader-utils');
const spritesmith = new Spritesmith();

module.exports = function(content) {
    let item, assets = [],
        imagesPathMap = [],
        callback = this.async(),
        resourcePath = this.resourcePath,
        options = loaderUtils.getOptions(this) || {},
        mobile = options.mobile,
        spriteImageRegexp = /url\((?:"|')(\S+)\?\_sprite(?:"|')\)/g,
        context =  options.context || this.rootContext || this.options && this.options.context,
        sourceRoot = path.dirname(path.relative(context, resourcePath));
        
    while((item = spriteImageRegexp.exec(content))) {
        if(item && item[1]) {
           let assetPath = loaderUtils.stringifyRequest(this, item[1]);
           let absolutePath = path.resolve(context, sourceRoot, JSON.parse(assetPath));
           let dirPath =  path.dirname(assetPath);
           let curDirPath = dirPath.substr(dirPath.lastIndexOf('/')+1); 
           assets.push(absolutePath);
           imagesPathMap.push({
               path: absolutePath,
               url: item[0]
           })
        }
    }

    if(!assets.length) {
        callback(null, content);
        return;
    }
    let arrSprite=[],assetsArr=[];
    assets.forEach((element)=>{
        let dirPath = path.dirname(element);
        let curDirPath = dirPath.substr(dirPath.lastIndexOf('/')+1);
        if(arrSprite.indexOf(curDirPath)<0){
            arrSprite.push(curDirPath);
            assetsArr[arrSprite.length-1]=[];
        }
        assetsArr[arrSprite.length-1].push(element);

    })

    assetsArr.forEach(function(element,_index){
        Spritesmith.run({src: element,algorithm:'top-down',padding: 20}, function handleResult (err, result) {
            if(err) {
                callback(err, '');
                return;
            }
            let dirPath = path.dirname(element[0]);
            let curDirPath = dirPath.substr(dirPath.lastIndexOf('/')+1); 
            let outputPath = options.outputPath;
            if(outputPath) {
                outputPath = path.join(context, outputPath);
            }
            outputPath = outputPath || dirPath;
            mkdirp(outputPath, function(err) {
                if(err) {
                    callback(err, '')
                    return;
                }
                let name = curDirPath + '.png';
                let url = loaderUtils.interpolateName(this, name, {
                    context,
                    content: result.image
                });
        
                let spritesImgPath = path.join(outputPath, url);
                fs.writeFileSync(spritesImgPath, result.image);
                spriteImageRegexp.lastIndex = 0;
                let spriteRelativePath = path.relative(path.dirname(resourcePath), spritesImgPath);
                spriteRelativePath = loaderUtils.stringifyRequest(this, spriteRelativePath);
                spriteRelativePath = JSON.parse(spriteRelativePath);


                let match = null;
                let propWidth = result.properties.width;
                let propHeight = result.properties.height;
                if(mobile){
                    propWidth = propWidth/2;
                    propHeight = propHeight/2;
                }
                let backgroundSize = 'background-size:' + propWidth + 'px ' + propHeight + 'px;';
                let lastIndex = 0;
                imagesPathMap.forEach(function(item) {
                    if(element.indexOf(item.path)>=0){
                        let index = content.indexOf(item.url, lastIndex);
                        let len = item.url.length;
                        lastIndex = index + len;
                    
                        let preContent = content.substring(0, index);
                        let afterContent = content.substring(index);
                        let matchLength = len;
                        let i;
                        for(i = matchLength; i < afterContent.length; i++) {
                            if(afterContent.charAt(i) == ';' || afterContent.charAt(i) == '}') {
                                break;
                            }
                        }

                        let end;
                        
                        let absolutePathItem = item.path;
                        let coordinates = result.coordinates;
                        let image = coordinates[absolutePathItem];
                        let imageW = image.width;
                        let imageH = image.height;
                        if(mobile){
                            imageW = imageW/2;
                            imageH = imageH/2;
                        }
                        
                        let imgWidth = 'width:' + imageW + 'px;';
                        let imgHeight = 'height:' + imageH + 'px;';

                        if(i < afterContent.length) {
                            
                            if(afterContent[i] == ';') {
                                end = i + 1;
                                afterContent = afterContent.substring(0, end) + backgroundSize+ imgWidth+ '\n' + imgHeight + afterContent.substring(end);
                            } else {
                                end = i;
                                afterContent = afterContent.substring(0, end) + ';\n' +  backgroundSize +imgWidth+ '\n' + imgHeight+ afterContent.substring(end);
                            }
                            
                        } 
                        let imagePosX = image.x;
                        let imagePosY = image.y;
                        if(mobile){
                            imagePosX = imagePosX/2;
                            imagePosY = imagePosY/2;
                        }
                        let imageX = image.x == 0 ? ' 0' : ' -' + imagePosX + 'px';
                        let imageY = image.y == 0 ? ' 0' : ' -' + imagePosY + 'px';
                        let imagePosition = '';
                        if(image.x || image.y){
                            imagePosition = imageX + imageY;
                        }

                        let cssVal = 'url("' + spriteRelativePath + '")' + imagePosition;

                        afterContent = cssVal + afterContent.substring(matchLength);
                        content = preContent + afterContent;
                    }
                    
                    
                });
                if(_index==assetsArr.length-1){
                    callback(null, content);
                }
            })
        });
        
    })
    
}