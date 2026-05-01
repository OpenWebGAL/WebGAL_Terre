import s from './settings.module.scss';
import type { SettingCategory, SettingOption } from './constants';
import { renderSettingOption, renderTooltipSwitch } from './SettingRenderer';

export interface SettingCategoryRendererProps {
  category: SettingCategory;
}

export const SettingCategoryRenderer = ({ category }: SettingCategoryRendererProps) => {
  return (
    <div className={s.tabItem}>
      <div className={s.tabTitle}>{category.title}</div>
      {category.options.map((option: SettingOption) => {
        if (option.type === 'switch' && option.description) {
          return renderTooltipSwitch(option);
        }
        return renderSettingOption(option);
      })}
    </div>
  );
};

export interface SettingPageContentProps {
  categories: SettingCategory[];
}

export const SettingPageContent = ({ categories }: SettingPageContentProps) => {
  return (
    <div className={s.settingsTabs}>
      {categories
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((category) => (
          <SettingCategoryRenderer key={category.key} category={category} />
        ))}
    </div>
  );
};
