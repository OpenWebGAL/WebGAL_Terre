const { readFile, writeFile } = require('node:fs/promises');

const sync = async () => {

  const package = await readFile('./package.json', { encoding: 'utf-8' });

  const version = JSON.parse(package).version;

  const info = await readFile('./src/config/info.ts', { encoding: 'utf-8' });

  const newInfo = info
    .replace(/version: '.*'/, `version: '${version}'`)
    .replace(/releaseTime: '.*'/, `releaseTime: '${new Date().toISOString()}'`);

  await writeFile('./src/config/info.ts', newInfo, { encoding: 'utf-8' });

};

sync();
