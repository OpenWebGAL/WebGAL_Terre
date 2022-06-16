# 注意：在运行前应全局安装pkg
mkdir release

# 进入 Terre 目录
cd packages/Terre
pkg index.js  -o WebGAL_Origine
cp -r Exported_Games public uploads WebGAL_Electron_template WebGAL_Template WebGAL_Origine.exe  ../../release
rm WebGAL_Origine.exe
cd ../../

# 进入 Origine 目录
cd packages/Origine
yarn build
cp -r -f dist/ ../../release/public
cd ../../

# 进入 Electron 目录
cd packages/WebGAL-electron
yarn
yarn build
cp -r -f build/ ../../release/WebGAL_Electron_template
cd ../../

cd release
