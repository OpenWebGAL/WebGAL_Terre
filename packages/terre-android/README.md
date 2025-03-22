# WebGAL Terre Android

Running with [nodejs-mobile](https://github.com/nodejs-mobile/nodejs-mobile)

## Building

Open `packages/terre-android/` folder on Android studio, select  `build` -> `Generate Signed Bundle or APK` -> `APK`, create a `keystore.jks` file on `packages/terre-android/` folder.

Create a `key.properties` file on `packages/terre-android/` folder.

```
storePassword=<paaaword>
keyPassword=<password>
keyAlias=<alias>
storeFile=D:/xxx/WebGAL_Terre/packages/terre-android/keystore.jks
```

**Important:** If you do not provide keystore and key properties, the build process will default to creating a debug APK.

Open a Shell in the project root directory and run:

``` shell
sh release-android.sh
```