cd packages/WebGAL-electron
npm i
npm run build
cd ../terre2/assets/templates/
mkdir WebGAL_Electron_Template
cd ../../../WebGAL-electron
cp -rf build/win-unpacked/* ../../packages/terre2/assets/templates/WebGAL_Electron_Template/
