import { t } from '@lingui/macro';
import { api } from '@/api';
import { ICustomCreateAction } from '@/components/Assets/Assets';
import { IGameEditorSidebarTabs } from '@/types/gameEditor';

export interface ISidebarAssetTabConfig {
  basePath?: string[];
  customCreateAction?: ICustomCreateAction;
}

const VALID_TABS = new Set<IGameEditorSidebarTabs>(['asset', 'scene', 'animation', 'character']);

export function resolveSidebarTab(tab: string): IGameEditorSidebarTabs {
  return VALID_TABS.has(tab as IGameEditorSidebarTabs) ? (tab as IGameEditorSidebarTabs) : 'asset';
}

function stripOptionalExt(rawName: string, ext: string): string {
  return rawName.trim().replace(new RegExp(`${ext.replace('.', '\\.')}$`, 'i'), '');
}

export function getSidebarTabConfig(
  gameDir: string,
  tab: IGameEditorSidebarTabs,
): ISidebarAssetTabConfig {
  switch (tab) {
  case 'scene':
    return {
      basePath: ['scene'],
      customCreateAction: {
        title: t`新建场景`,
        placeholder: t`新场景名`,
        resolveEntryName: (raw) => {
          const base = stripOptionalExt(raw, '.txt');
          return base ? `${base}.txt` : '';
        },
        onCreate: async (subPath, raw) => {
          const sceneName = [...subPath, stripOptionalExt(raw, '.txt')].join('/');
          await api.manageGameControllerCreateNewScene({ gameName: gameDir, sceneName });
        },
      },
    };
  case 'animation':
    return {
      basePath: ['animation'],
      customCreateAction: {
        title: t`新建动画`,
        placeholder: t`新动画名`,
        resolveEntryName: (raw) => {
          const base = stripOptionalExt(raw, '.json');
          return base ? `${base}.json` : '';
        },
        isReservedName: (raw, subPath) =>
          subPath.length === 0 && stripOptionalExt(raw, '.json').toLowerCase() === 'animationtable',
        onCreate: async (subPath, raw) => {
          const animationName = [...subPath, stripOptionalExt(raw, '.json')].join('/');
          await api.manageGameControllerCreateNewAnimation({ gameName: gameDir, animationName });
        },
      },
    };
  case 'character':
    return {
      basePath: ['figure'],
      customCreateAction: {
        title: t`新建角色`,
        placeholder: t`新角色名`,
        resolveEntryName: (raw) => raw.trim(),
        isReservedName: (raw, subPath) =>
          subPath.length === 0 && raw.trim().toLowerCase() === 'none',
        onCreate: async (subPath, raw) => {
          const characterName = [...subPath, raw.trim()].join('/');
          await api.manageGameControllerCreateNewCharacter({ gameName: gameDir, characterName });
        },
      },
    };
  default:
    return {};
  }
}
