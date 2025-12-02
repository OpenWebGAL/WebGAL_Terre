import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Combobox,
  Option,
  Tooltip,
} from "@fluentui/react-components";
import { t } from "@lingui/macro";
import { bundleIcon, ArrowUp20Filled, ArrowUp20Regular, ArrowDown20Filled, ArrowDown20Regular, Delete20Filled, Delete20Regular, Add20Filled, Add20Regular } from "@fluentui/react-icons";
import styles from "./WGFontFamily.module.scss";
import { IPropertyEditorProps } from "@/pages/templateEditor/TemplateGraphicalEditor/WebgalClassEditor/editorTable";
import useEditorStore from "@/store/useEditorStore";
import { api } from "@/api";
import useSWR from "swr";

const DEFAULT_FONT_CHAIN = ["思源宋体", "LXGW", "WebgalUI"] as const;
// const GENERIC_FONTS = ["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"] as const;
const GENERIC_FONTS = [] as const;

const MoveUpIcon = bundleIcon(ArrowUp20Filled, ArrowUp20Regular);
const MoveDownIcon = bundleIcon(ArrowDown20Filled, ArrowDown20Regular);
const DeleteIcon = bundleIcon(Delete20Filled, Delete20Regular);
const AddIcon = bundleIcon(Add20Filled, Add20Regular);

const parseFontList = (value: string): string[] => {
  if (!value) return [];
  const matches = value.match(/"[^"]*"|'[^']*'|[^,]+/g);
  if (!matches) return [];
  return matches
    .map((item) => item.trim())
    .map((item) => item.replace(/^['"]|['"]$/g, ""))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter((item) => item.length > 0);
};

const stringifyFontList = (fonts: string[]): string => {
  const cleaned = fonts
    .map((font) => font.trim())
    .filter((font) => font.length > 0);
  if (!cleaned.length) return "";

  return cleaned
    .map((font) => {
      if (/["]/.test(font)) {
        return `"${font.replace(/"/g, '\\"')}"`;
      }
      if (/[\s,]/.test(font) || /[^\x20-\x7E]/.test(font)) {
        return `"${font}"`;
      }
      return font;
    })
    .join(", ");
};

const normalizeValue = (value: string): string => stringifyFontList(parseFontList(value));

export default function WGFontFamily({ prop, onSubmit }: IPropertyEditorProps) {
  const templateDir = useEditorStore.use.subPage();
  const { data: templateConfig } = useSWR(
    templateDir ? `/templateConfig/${templateDir}` : null,
    async () => (await api.manageTemplateControllerGetTemplateConfig(templateDir)).data,
    { revalidateOnFocus: false }
  );

  const [fonts, setFonts] = useState<string[]>(() => {
    const parsed = parseFontList(prop.propValue);
    return parsed.length ? parsed : [...DEFAULT_FONT_CHAIN];
  });

  const lastAppliedRef = useRef<string>(normalizeValue(prop.propValue));

  useEffect(() => {
    const normalized = normalizeValue(prop.propValue);
    if (normalized !== lastAppliedRef.current) {
      lastAppliedRef.current = normalized;
      const parsed = parseFontList(normalized);
      setFonts(parsed.length ? parsed : [...DEFAULT_FONT_CHAIN]);
    }
  }, [prop.propValue]);

  const templateFonts = useMemo(() => {
    return (
      templateConfig?.fonts?.map((item) => item["font-family"]?.trim()).filter((item): item is string => !!item && item.length > 0) ?? []
    );
  }, [templateConfig]);

  const suggestionOptions = useMemo(() => {
    const ordered = [
      ...DEFAULT_FONT_CHAIN,
      ...templateFonts,
      ...fonts,
      ...GENERIC_FONTS,
    ];
    const seen = new Set<string>();
    return ordered
      .map((item) => item.trim())
      .filter((item) => {
        if (!item) return false;
        if (seen.has(item)) return false;
        seen.add(item);
        return true;
      });
  }, [fonts, templateFonts]);

  const applyFonts = useCallback(
    (draft: string[]) => {
      setFonts(draft);
      const normalized = stringifyFontList(draft);
      lastAppliedRef.current = normalized;
      prop.propValue = normalized;
      onSubmit();
    },
    [onSubmit, prop]
  );

  const updateFontAt = (index: number, value: string) => {
    const draft = [...fonts];
    draft[index] = value;
    applyFonts(draft);
  };

  const handleRemove = (index: number) => {
    const draft = fonts.filter((_, i) => i !== index);
    applyFonts(draft);
  };

  const handleMove = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= fonts.length) return;
    const draft = [...fonts];
    const [item] = draft.splice(index, 1);
    draft.splice(target, 0, item);
    applyFonts(draft);
  };

  const handleAppend = () => {
    applyFonts([...fonts, ""]);
  };

  const effectiveFonts = fonts.length ? fonts : [...DEFAULT_FONT_CHAIN];

  return (
    <div className={styles.container}>
      <div className={styles.fontList}>
        {effectiveFonts.length === 0 && (
          <span className={styles.emptyHint}>{t`尚未添加任何字体`}</span>
        )}
        {effectiveFonts.map((font, index) => (
          <div key={`${index}-${font}`} className={styles.fontRow}>
            <Combobox
              className={styles.fontInput}
              freeform
              value={font}
              placeholder={t`请输入或选择字体名称`}
              onOptionSelect={(
                _event,
                data
              ) =>
                updateFontAt(
                  index,
                  data.optionValue ?? data.optionText ?? "",
                )
              }
              onChange={(event) =>
                updateFontAt(
                  index,
                  event.currentTarget.value,
                )
              }
            >
              {suggestionOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Combobox>
            <div className={styles.rowActions}>
              <Tooltip content={t`上移`} relationship="label">
                <Button
                  icon={<MoveUpIcon />}
                  appearance="subtle"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                />
              </Tooltip>
              <Tooltip content={t`下移`} relationship="label">
                <Button
                  icon={<MoveDownIcon />}
                  appearance="subtle"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === effectiveFonts.length - 1}
                />
              </Tooltip>
              <Tooltip content={t`删除`} relationship="label">
                <Button
                  icon={<DeleteIcon />}
                  appearance="subtle"
                  onClick={() => handleRemove(index)}
                />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.footerActions}>
        <Button
          appearance="secondary"
          icon={<AddIcon />}
          onClick={handleAppend}
        >
          {t`新增字体`}
        </Button>
      </div>
    </div>
  );
}
