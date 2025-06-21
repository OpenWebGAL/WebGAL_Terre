import { useState, useMemo, useCallback } from 'react';
import useEditorStore from '@/store/useEditorStore';
import { Popover, PopoverTrigger, PopoverSurface, Option } from '@fluentui/react-components';
import { getCascaderOptions, getCascaderLevels } from '../utils/getCascaderOptions';
import TerreToggle from '../../../../components/terreToggle/TerreToggle';
import CommonOptions from './CommonOption';
import WheelDropdown from './WheelDropdown';
import TagInputPicker from './TagInputPicker';
import styles from './searchableCascader.module.scss';
import stylesSe from "../SentenceEditor/sentenceEditor.module.scss";
import { debounce, escapeRegExp } from 'lodash';
import { t } from "@lingui/macro";

export interface CascaderOptionNode {
  value: string;
  children: Map<string, CascaderOptionNode>; // Map<label, node>
}

interface CascaderProps {
  optionList: string[];
  value: string;
  onValueChange: (newValue: string | undefined) => void;
}

const CASCADER_TRIGGER_THRESHOLD = 20; // 级联选择器触发阈值

export default function SearchableCascader ({
  optionList,
  value,
  onValueChange,
}: CascaderProps) {
  const [openPopover, setOpenPopover] = useState(false);
  const [levelLabels, setLevelLabels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const isCascaderDelimitersCustomizable = useEditorStore.use.isCascaderDelimitersCustomizable();
  const updateIsCascaderDelimitersCustomizable = useEditorStore.use.updateIsCascaderDelimitersCustomizable();
  const cascaderDelimiters = useEditorStore.use.cascaderDelimiters();
  const updateCascaderDelimiters = useEditorStore.use.updateCascaderDelimiters();

  // 生成级联选项数据
  const options = useMemo(() => getCascaderOptions(optionList, cascaderDelimiters), [optionList, cascaderDelimiters]);

  // 处理级联选择器节点点击事件
  const handleNodeClick = (
    level: number,
    newLevelLabel: string,
    node: CascaderOptionNode
  ) => {
    setLevelLabels(prev => {
      const newLevels = prev.slice(0, level); // 截断到当前层级
      newLevels[level] = newLevelLabel; // 添加新选择的值
      return newLevels;
    });
    if (node.children.size === 0) { // 如果是叶子节点，就触发更改
      onValueChange(node.value);
      !isPinned && setOpenPopover(false);
    }
  };
  // 生成级联选项元素
  const optionLevels = useMemo(() => {
    const levels = [];
    let currentOptions: Map<string, CascaderOptionNode> = options;
    for (let i = 0; ; i++) {
      if (levelLabels[i - 1]) {
        const next = currentOptions.get(levelLabels[i - 1]);
        if (next?.children && next.children.size > 0) {
          currentOptions = next.children;
        } else { break; }
      } else if (i !==0) { break; }
      if (!(currentOptions && currentOptions.size > 0)) { break; }
      levels.push(
        <div key={i} className={styles.cascadeLevel}>
          {Array
            .from(currentOptions.entries())
            .sort((a, b) => {
              const aHasChildren = a[1].children.size !== 0;
              const bHasChildren = b[1].children.size !== 0;
              if (aHasChildren !== bHasChildren) {
                return aHasChildren ? -1 : 1; // 有子元素的优先
              }
              const textA = a[0].trim().toLowerCase();
              const textB = b[0].trim().toLowerCase();
              return textA.localeCompare(textB);
            })
            .map(([label, node]) => (
              <Option
                key={label}
                value={node.value}
                text={label}
                className={
                  styles.cascadeOption +
                  (levelLabels[i] === label ? ' ' + styles.cascadeOptionActive : '')
                }
                onClick={() => handleNodeClick(i, label, node)}
              >
                <div className={styles.cascadeOptionContent}>
                  <div className={styles.cascadeOptionText}>{label}</div>
                  {node.children && node.children.size > 0 ? (
                    <div className={styles.arrow}>&gt;</div>
                  ) : null}
                </div>
              </Option>
            ))
          }
        </div>
      );
    }
    return levels;
  }, [options, levelLabels, isPinned]);
  
  // 处理搜索框输入变化
  const handleInputChange = debounce((input:string)=> {
    if (!input.trim()) {
      setSearchTerm('');
      return;
    }
    setSearchTerm(input);
  }, 300);
  // 高亮搜索结果
  const highlightText = useCallback((text: string, keywords: string[]) => {
    if (!keywords.length) return text;
    const pattern = new RegExp(`(${keywords.map(k => escapeRegExp(k)).join('|')})`, 'gi');
    const parts = text.split(pattern);
    return parts.map((part, i) =>
      keywords.some(k => k && part.toLowerCase() === k.toLowerCase())
        ? <span key={i} className={styles.highlight}>{part}</span>
        : part
    );
  }, []);
  // 处理搜索选项点击
  const handleSearchOptionClick = (option: string) => {
    onValueChange(option);
    !isPinned && setOpenPopover(false);
    setLevelLabels(getCascaderLevels(option, cascaderDelimiters));
  };
  // 生成搜索过滤后的选项
  const filteredOptions = useMemo(() => {
    if (!searchTerm) { return []; }
    const searchList = searchTerm.toLowerCase().split(' ').filter(Boolean);
    const result = [];
    for (let option of optionList) {
      const optionText = option.toLowerCase();
      if (searchList.length === 0 || searchList.every(term => optionText.includes(term))) {
        result.push(
          <Option
            key={option}
            value={option}
            text={option}
            className={
              styles.cascadeOption +
              (option===value ? ' ' + styles.cascadeOptionActive : '')
            }
            onClick={() => handleSearchOptionClick(option)}
          >
            <div className={styles.cascadeOptionContent}>
              <div className={styles.cascadeOptionText}>
                {highlightText(option, searchList)}
              </div>
            </div>
          </Option>
        );
      }
    }
    if (result.length === 0) {
      result.push(
        <div>{t`无匹配选项`}</div>
      );
    }
    return result;
  }, [searchTerm, optionList, value, isPinned]);

  return (
    <div className={styles.searchableCascader}>
      <WheelDropdown
        options={new Map(optionList.map(item => [item, item]))}
        value={value}
        onValueChange={(newValue) => onValueChange(newValue)}
      />
      <Popover
        open={openPopover}
        onOpenChange={(_, data) => {
          if(data.open){
            setOpenPopover(true);
            setSearchTerm(''); // 重置搜索状态
            // 将显示值设置为当前选中值
            setLevelLabels(getCascaderLevels(value, cascaderDelimiters));
          } else if (!isPinned) { setOpenPopover(false); }
        }}
        positioning="after"
        withArrow
      >
        <PopoverTrigger>
          {optionList.length > CASCADER_TRIGGER_THRESHOLD ? ( // 仅当选项数量超过阈值时才允许显示级联选择器
            <div
              className={styles.popoverTrigger}
              onClick={() => {
                if (!openPopover) { setOpenPopover(true); }
                else if (!isPinned) { setOpenPopover(false); }
              }}
            />
          ) : null}
        </PopoverTrigger>
        <PopoverSurface className={styles.popoverSurface}>
          <div className={styles.headerOptions}>
            <CommonOptions title={t`搜索选项`}>
              <input
                type="text"
                placeholder={t`请输入搜索提示词...`}
                onChange={(e) => { handleInputChange(e.target.value); }}
                className={stylesSe.sayInput + ' ' + styles.searchInput}
              />
            </CommonOptions>
            <CommonOptions title={t`自定义分隔符`}>
              <TerreToggle
                title={t`是否自定义分隔符`}
                onChange={() => {
                  const next = !isCascaderDelimitersCustomizable;
                  updateIsCascaderDelimitersCustomizable(next);
                  if (!next) {
                    updateCascaderDelimiters(['/']);
                    setLevelLabels(getCascaderLevels(value, ['/']));
                  }
                }}
                onText={t`启用`}
                offText={t`关闭`}
                isChecked={isCascaderDelimitersCustomizable}
              />
            </CommonOptions>
            <CommonOptions title={t`是否固定弹窗`}>
              <TerreToggle
                title={t`是否固定弹窗`}
                onChange={setIsPinned}
                onText={t`固定弹窗`}
                offText={t`取消固定`}
                isChecked={isPinned}
              />
            </CommonOptions>
          </div>
          {isCascaderDelimitersCustomizable ? (
            <CommonOptions title={t`设置自定义级联选择器分隔符（输入后按回车键确认）`}>
              <TagInputPicker
                onOptionSelect={(options) => {
                  updateCascaderDelimiters(options);
                  setLevelLabels(getCascaderLevels(value, options));
                }}
                selectedOptions={cascaderDelimiters}
              />
            </CommonOptions>
          ) : null}
          {searchTerm ? (
            <div className={styles.searchingCascader}>{filteredOptions}</div>
          ) : (
            <div className={styles.cascader}>{optionLevels}</div>
          )}
        </PopoverSurface>
      </Popover>
    </div>
  );
};
