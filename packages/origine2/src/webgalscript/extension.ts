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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore id type problem
      {
        label: 'WebGAL White',
        path: '/white.json',
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
registerFileUrl('/hl.json', new URL('../config/highlighting/hl.json', import.meta.url).href);
