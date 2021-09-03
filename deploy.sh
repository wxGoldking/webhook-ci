#!/bin/bash

WEB_NAME="$1"
# 服务器上的项目代码库路径
PROJECT_PATH="/root/project/${WEB_NAME}/"
# 项目发布的地址，我用的nginx的静态目录
DEPLOY_PATH="/usr/share/nginx/html/${WEB_NAME}/"

cd $PROJECT_PATH
MD5=`md5sum package.json | cut -d' ' -f1`
rm -rf dist
git pull
NEW_MD5=`md5sum package.json | cut -d' ' -f1`

# 利用前后package.json文件MD5值是否变化来决定是否重新npm install

if [ $MD5 == $NEW_MD5 ]; then
    echo '未检测到依赖项改变'
else
	echo "change install"
	npm install
fi
npm run build
if [[ ! -d "dist" ]]; then
	echo "build error"
	exit 1
fi
rm -rf $DEPLOY_PATH*
cp -rf dist/* $DEPLOY_PATH 
echo "build success $WEB_NAME"