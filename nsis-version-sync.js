const { readFile, writeFile } = require('fs/promises');
const {encode, decode} = require('iconv-lite');

(async () => {
    const packageFile = await readFile('./package.json', { encoding: 'utf-8' });
    const packageJson = JSON.parse(packageFile);

    const version = packageJson.version;

    if (!version) throw new Error('Get version failed.');

    console.log("ver: ", version);

    const nsisInstallerFilePath = './installer.nsi';

    const nsisInstallerFileData = decode(await readFile(nsisInstallerFilePath), 'GB2312');
    const newNsisInstallerFileData = encode(nsisInstallerFileData.replace(/^!define VERSION \".*\"/m, `!define VERSION "${version}"`), 'GB2312');
    await writeFile(nsisInstallerFilePath, newNsisInstallerFileData);

    console.log('已更新 nsis 配置文件版本号');
})();