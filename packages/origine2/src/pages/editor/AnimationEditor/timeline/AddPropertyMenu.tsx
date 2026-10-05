import { Menu, MenuGroup, MenuGroupHeader, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { useAnimationProperties } from '../model/useAnimationProperties';
import styles from './timeline.module.scss';

interface IAddPropertyMenuProps {
  /** 时间轴上已有的属性，不再出现在菜单中 */
  shownPaths: string[];
  onAdd: (path: string) => void;
}

/**
 * 属性栏最后一行，整行就是按钮，点击后选择要添加的属性
 */
export function AddPropertyMenu({ shownPaths, onAdd }: IAddPropertyMenuProps) {
  const { groups } = useAnimationProperties();
  const availableGroups = groups
    .map((group) => ({ ...group, properties: group.properties.filter((property) => !shownPaths.includes(property.path)) }))
    .filter((group) => group.properties.length > 0);

  const row = (
    <div
      className={`${styles.header} ${styles.addPropertyRow}`}
      role="button"
      tabIndex={0}
      aria-disabled={availableGroups.length === 0}
    >
      <AddRegular className={styles.addPropertyIcon} />
      {t`添加属性`}
    </div>
  );

  // 所有属性都已添加时仍保留这一行，使属性栏与轨道区域等高
  if (availableGroups.length === 0) return row;

  return (
    <Menu>
      <MenuTrigger>{row}</MenuTrigger>
      <MenuPopover className={styles.addPropertyPopover}>
        <MenuList>
          {availableGroups.map((group) => (
            <MenuGroup key={group.title}>
              <MenuGroupHeader>{group.title}</MenuGroupHeader>
              {group.properties.map((property) => (
                <MenuItem key={property.path} onClick={() => onAdd(property.path)}>{property.shortLabel}</MenuItem>
              ))}
            </MenuGroup>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}
