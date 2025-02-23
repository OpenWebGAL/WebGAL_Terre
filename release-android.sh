echo "Welcome to build WebGAL Terre, the editor of WebGAL platform."
# 安装依赖
yarn install --frozen-lockfile --network-timeout=300000

# 清理
rm -rf release

mkdir release

# 进入 Terre 目录
cd packages/terre2
yarn run build-standalone:intl
cd dist
cp -r main.js  ../../../release
rm main.js
cd ../
mkdir Exported_Games
cp -r public assets Exported_Games ../../release
cd ../../

# 进入 Origine 目录
cd packages/origine2
yarn run build
cp -rf dist/* ../../release/public/
cd ../../

cd release

# 删除冗余文件
rm -rf Exported_Games/*
rm -rf public/games/*
rm -rf public/games/.gitkeep
rm -rf assets/templates/WebGAL_Template/game/video/*
rm -rf assets/templates/WebGAL_Template/game/video/.gitkeep

cd ../

# 复制文件
rm -rf packages/terre-android/app/src/main/assets/terre
mkdir -p packages/terre-android/app/src/main/assets/terre
cp -rf release/* packages/terre-android/app/src/main/assets/terre

cd packages/terre-android

# 检查 key.properties 是否存在
if [ -f "key.properties" ]; then
    echo "key.properties file exists, start build release apk..."
    ./gradlew assembleRelease
    cd ../../
    mv packages/terre-android/app/build/outputs/apk/release/app-release.apk release/WebGAL_Terre_Android.apk
else
    echo "key.properties file does not exist, start build debug apk..."
    ./gradlew assembleDebug
    cd ../../
    mv packages/terre-android/app/build/outputs/apk/debug/app-debug.apk release/WebGAL_Terre_Android_debug.apk
fi

echo "WebGAL Terre is now ready to be deployed."