import fs from 'fs';
import path from 'path';
import * as ResEdit from 'resedit';

const packageJsonPath = path.join(__dirname, './package.json');
const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
const packageJsonObj = JSON.parse(packageJson);
const version = packageJsonObj.version;

const exePath = path.join(__dirname, 'dist/WebGAL_Terre.exe');
const iconPath = path.join(__dirname, '../../assets/icon.ico');

const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath));
const res = ResEdit.NtExecutableResource.from(exe);
const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(iconPath));

ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
  res.entries,
  1,
  1033,
  iconFile.icons.map((item) => item.data),
);

const vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];

vi.setStringValues(
  { lang: 1033, codepage: 1200 },
  {
    ProductName: 'WebGAL Terre',
    FileDescription: 'WebGAL visual editor',
    CompanyName: 'OpenWebGAL',
    LegalCopyright: `Copyright © 2022 OpenWebGAL. All rights reserved.`,
  },
);
vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'OriginalFilename');
vi.removeStringValue({ lang: 1033, codepage: 1200 }, 'InternalName');
vi.setFileVersion(version);
vi.setProductVersion(version);
vi.outputToResourceEntries(res.entries);
res.outputResource(exe);
fs.writeFileSync(exePath, Buffer.from(exe.generate()));
