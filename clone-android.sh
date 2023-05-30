# 克隆 WebGAL Android 模板
cd release/assets/templates/
rm -rf WebGAL_Android_Template
git clone https://github.com/nini22P/WebGAL-Android.git
mv WebGAL-Android WebGAL_Android_Template
# MainActivity.kt 移动到主文件夹防止误删
mv WebGAL_Android_Template/app/src/main/java/com/openwebgal/demo/MainActivity.kt WebGAL_Android_Template/app/src/main/java/MainActivity.kt

cd ../../../
cd release

# 删除冗余文件
rm -rf assets/templates/WebGAL_Android_Template/.github
rm -rf assets/templates/WebGAL_Android_Template/.git
rm -rf assets/templates/WebGAL_Android_Template/.gitattributes
rm -rf assets/templates/WebGAL_Android_Template/app/src/main/assets/webgal/.gitkeep
rm -rf assets/templates/WebGAL_Android_Template/app/src/main/java/com