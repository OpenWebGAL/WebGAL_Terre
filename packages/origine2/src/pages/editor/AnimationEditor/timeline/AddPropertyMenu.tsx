import { Button, Menu, MenuGroup, MenuGroupHeader, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { t } from '@lingui/macro';
import { useAnimationProperties } from '../model/useAnimationProperties';
import styles from './timeline.module.scss';

interface IAddPropertyMenuProps {
  /** 时间轴上已有的属性，不再出现在菜单中 */
  shownPaths: string[];
  onAdd: (path: string) => void;
}

export function AddPropertyMenu({ shownPaths, onAdd }: IAddPropertyMenuProps) {
  const { groups } = useAnimationProperties();
  const availableGroups = groups
    .map((group) => ({ ...group, properties: group.properties.filter((property) => !shownPaths.includes(property.path)) }))
    .filter((group) => group.properties.length > 0);

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button size="small" appearance="subtle" icon={<AddRegular />} disabled={availableGroups.length === 0}>
          {t`添加属性`}
        </Button>
      </MenuTrigger>
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
