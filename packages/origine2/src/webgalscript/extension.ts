import { registerExtension, IExtensionManifest, ExtensionHostKind } from 'vscode/extensions';

const manifest: IExtensionManifest = {
  name: 'webgal',
  version: '3.16.2',
  publisher: 'webgal',
  engines: {
    vscode: '*',
  },
  contributes: {
    themes: [
      {
        id: 'webgal-white',
        label: 'WebGAL White',
        path: '/white.json',
        uiTheme: 'vs',
      },
      {
        id: 'webgal-black',
        label: 'WebGAL Black',
        path: '/black.json',
        uiTheme: 'vs',
      },
    ],
    grammars: [
      {
        language: 'webgal',
        scopeName: 'source.webgal',
        path: '/hl.json',
        injectTo: ['source.txt'],
      },
    ],
  },
};

const { registerFileUrl } = registerExtension(manifest, ExtensionHostKind.LocalProcess);

registerFileUrl('/white.json', new URL('../config/themes/monokai-light-vs.json', import.meta.url).href);
registerFileUrl('/black.json', new URL('../config/themes/vscode-dark-modern.json', import.meta.url).href);
registerFileUrl('/hl.json', new URL('../config/highlighting/hl.json', import.meta.url).href);
