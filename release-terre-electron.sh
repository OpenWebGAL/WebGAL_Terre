echo "WebGAL Terre is OK, now build terre electron."

mkdir terre-electron
rm -r terre-electron/*
cp -r packages/terre-electron/* terre-electron
mkdir terre-electron/dist
cp -r packages/terre2/dist/* terre-electron/dist
cd terre-electron || exit
yarn
yarn build
cd ..
cp -r release/* terre-electron/build/win-unpacked
rm terre-electron/build/win-unpacked/WebGAL_Terre.exe