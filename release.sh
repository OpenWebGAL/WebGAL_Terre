echo "Welcome to build WebGAL Terre, the editor of WebGAL platform."
# 安装依赖
yarn install --frozen-lockfile --network-timeout=300000

# 清理
rm -rf release

mkdir release

# 进入 Terre 目录
cd packages/terre2
yarn run build
yarn run pkg
yarn run update-exe-resources
cd dist
cp -r WebGAL_Terre.exe  ../../../release
rm WebGAL_Terre.exe
cd ../
mkdir Exported_Games
cp -r public assets Exported_Games ../../release
cd ../../

# 下载 rcedit
mkdir release/lib
curl -L https://github.com/electron/rcedit/releases/latest/download/rcedit-x64.exe -o release/lib/rcedit-x64.exe

# 进入 Origine 目录
cd packages/origine2
yarn run build
cp -rf dist/* ../../release/public/
cd ../../

# 进入 Electron 目录
cd packages/WebGAL-electron
yarn install --frozen-lockfile
yarn run build
mkdir ../../release/assets/templates/WebGAL_Electron_Template
cp -rf build/win-unpacked/* ../../release/assets/templates/WebGAL_Electron_Template/
cd ../../

# 克隆 WebGAL Android 模板
cd release/assets/templates/
git clone https://github.com/nini22P/WebGAL-Android.git
mv WebGAL-Android WebGAL_Android_Template
# MainActivity.kt 移动到主文件夹防止误删
mv WebGAL_Android_Template/app/src/main/java/com/openwebgal/demo/MainActivity.kt WebGAL_Android_Template/app/src/main/java/MainActivity.kt
cd ../../../

cd release

# 删除冗余文件
rm -rf Exported_Games/*
rm -rf public/games/*
rm -rf public/games/.gitkeep
rm -rf assets/templates/WebGAL_Template/game/video/*
rm -rf assets/templates/WebGAL_Template/game/video/.gitkeep
rm -rf assets/templates/WebGAL_Android_Template/.github
rm -rf assets/templates/WebGAL_Android_Template/.git
rm -rf assets/templates/WebGAL_Android_Template/.gitattributes
rm -rf assets/templates/WebGAL_Android_Template/app/src/main/assets/webgal/.gitkeep
rm -rf assets/templates/WebGAL_Android_Template/app/src/main/java/com

echo "WebGAL Terre is now ready to be deployed."
