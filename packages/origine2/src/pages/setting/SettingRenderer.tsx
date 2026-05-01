import s from './settings.module.scss';
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Tooltip,
  Input,
  Combobox,
  Option,
  Switch,
  Button,
} from '@fluentui/react-components';
import { SettingOption } from './constants';

export const renderSettingOption = (option: SettingOption) => {
  switch (option.type) {
  case 'switch':
    return (
      <div className={s.settingRow} key={option.key}>
        {option.icon && <div className={s.settingIcon}>{option.icon}</div>}
        <div className={s.settingText}>{option.label}</div>
        <div className={s.settingControl}>
          <Switch
            checked={option.checked}
            onChange={() => option.onChange(!option.checked)}
            disabled={option.disabled}
          />
        </div>
      </div>
    );
  case 'select':
    return (
      <div className={s.settingRow} key={option.key}>
        {option.icon && <div className={s.settingIcon}>{option.icon}</div>}
        <div className={s.settingText}>{option.label}</div>
        <div className={s.settingControl}>
          <Menu>
            <MenuTrigger>
              <Button appearance="transparent">
                <span>{option.value}</span>
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                {option.options.map((opt: { label: string; value: string }) => (
                  <MenuItem key={opt.value} onClick={() => option.onChange(opt.value)}>
                    {opt.label}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      </div>
    );
  case 'input':
    return (
      <div className={s.settingRow} key={option.key}>
        {option.icon && <div className={s.settingIcon}>{option.icon}</div>}
        <div className={s.settingText}>{option.label}</div>
        <div className={s.settingControl}>
          <Input
            className={`${s.fontFamilyInput}`}
            value={option.value}
            onChange={(ev) => option.onChange(ev.target.value)}
            placeholder={option.placeholder}
          />
        </div>
      </div>
    );
  case 'combo':
    return (
      <div className={s.settingRow} key={option.key}>
        {option.icon && <div className={s.settingIcon}>{option.icon}</div>}
        <div className={s.settingText}>{option.label}</div>
        <div className={s.settingControl}>
          <Combobox
            freeform
            style={{ minWidth: 'unset' }}
            input={{ style: { width: '40px' } }}
            value={option.value}
            onChange={(ev) => option.onChange(ev.target.value)}
            onOptionSelect={(_, data) => option.onChange(data.optionValue ?? '')}
          >
            {option.options.map((opt) => (
              <Option key={opt}>{opt.toString()}</Option>
            ))}
          </Combobox>
        </div>
      </div>
    );
  case 'custom':
    return <div key={option.key}>{option.render()}</div>;
  default:
    return null;
  }
};

export const renderTooltipSwitch = (option: SettingOption & { type: 'switch' }) => {
  if (!option.description) {
    return renderSettingOption(option);
  }
  return (
    <div className={s.settingRow} key={option.key}>
      {option.icon && <div className={s.settingIcon}>{option.icon}</div>}
      <div className={s.settingText}>{option.label}</div>
      <div className={s.settingControl}>
        <Tooltip
          content={<div className={s.previewTips}>{option.description}</div>}
          relationship="description"
          showDelay={0}
          hideDelay={0}
        >
          <Switch checked={option.checked} onChange={() => option.onChange(!option.checked)} />
        </Tooltip>
      </div>
    </div>
  );
};
