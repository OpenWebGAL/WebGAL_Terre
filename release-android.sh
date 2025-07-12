echo "Welcome to build WebGAL Terre, the editor of WebGAL platform."

sh build-android-assets.sh

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