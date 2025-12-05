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
cd dist
cp -r WebGAL_Terre  ../../../release
rm WebGAL_Terre
cd ../
mkdir Exported_Games
cp -r public assets Exported_Games ../../release
cd ../../

# 进入 Origine 目录
cd packages/origine2
#npm install esbuild-darwin-arm64
export NODE_OPTIONS="--max-old-space-size=8192"
yarn run build
cp -rf dist/* ../../release/public/
cd ../../

# 进入 Electron 目录
cd packages/WebGAL-electron
yarn install --frozen-lockfile
yarn run build-universal
# 拷贝 mac Steam API 动态库
STEAM_API_DYLIB="node_modules/steamworks.js/dist/osx/libsteam_api.dylib"
if [ -f "$STEAM_API_DYLIB" ]; then
    TARGET_DIR="build/mac-universal/WebGAL.app/Contents/Resources/app/node_modules/steamworks.js/dist/osx"
    mkdir -p "$TARGET_DIR"
    cp "$STEAM_API_DYLIB" "$TARGET_DIR/"
else
    echo "warning: Steamworks redistributable not found at $STEAM_API_DYLIB" >&2
fi
mkdir ../../release/assets/templates/WebGAL_Electron_Template
cp -rf build/mac-universal/WebGAL.app/* ../../release/assets/templates/WebGAL_Electron_Template/
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

cd ..
mkdir release-mac
mv release release-mac
cd release-mac
mv release WebGAL
cd ..
mv release-mac release
cd release

# 写脚本
echo 'cd "$(dirname "$0")"' >> run-webgal-on-mac.command
echo 'cd WebGAL' >> run-webgal-on-mac.command
echo './WebGAL_Terre' >> run-webgal-on-mac.command
chmod +x run-webgal-on-mac.command
chmod +x WebGAL/WebGAL_Terre

# readme 多语言提示（现阶段说明）
echo '你需要为可执行文件设置正确的权限，并使用 run-webgal-on-mac.command 脚本才能正确使用 WebGAL Terre' > readme.txt
echo 'You need to set the correct permissions for the executable file and use the run-webgal-on-mac.command script to use WebGAL Terre correctly' >> readme.txt
echo 'WebGAL Terreを正しく使用するには、実行可能ファイルに正しいパーミッションを設定し、run-webgal-on-mac.command スクリプトを使用する必要があります。' >> readme.txt


echo "WebGAL Terre is now ready to be deployed."
