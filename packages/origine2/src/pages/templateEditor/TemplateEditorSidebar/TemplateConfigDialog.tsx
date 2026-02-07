import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  Select,
  Spinner,
} from '@fluentui/react-components';
import { t } from '@lingui/macro';
import { TemplateConfigDto, TemplateFontConfigDto } from '@/api/Api';
import { api } from '@/api';
import styles from './TemplateConfigDialog.module.scss';
import axios from 'axios';
import {
  AddCircle20Filled,
  AddCircle20Regular,
  ArrowUpload20Filled,
  ArrowUpload20Regular,
  Delete20Filled,
  Delete20Regular,
  bundleIcon,
} from '@fluentui/react-icons';

const AddCircleIcon = bundleIcon(AddCircle20Filled, AddCircle20Regular);
const DeleteIcon = bundleIcon(Delete20Filled, Delete20Regular);
const UploadIcon = bundleIcon(ArrowUpload20Filled, ArrowUpload20Regular);

const FONT_TYPE_OPTIONS = ['truetype', 'opentype', 'woff', 'woff2', 'embedded-opentype', 'svg'] as const;

type FontTypeOption = (typeof FONT_TYPE_OPTIONS)[number];

export interface TemplateConfigDialogProps {
  open: boolean;
  templateConfig?: TemplateConfigDto;
  templateDir: string;
  onOpenChange: (open: boolean) => void;
  onTemplateConfigUpdated?: () => void | Promise<void>;
}

type FontFormState = TemplateFontConfigDto;

export default function TemplateConfigDialog({
  open,
  templateConfig,
  templateDir,
  onOpenChange,
  onTemplateConfigUpdated,
}: TemplateConfigDialogProps) {
  const [name, setName] = useState('');
  const [fonts, setFonts] = useState<FontFormState[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const isLoading = open && !templateConfig;
  const defaultFontType: FontTypeOption = useMemo(() => FONT_TYPE_OPTIONS[0], []);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (!templateConfig) {
      setName('');
      setFonts([]);
      return;
    }
    setName(templateConfig.name ?? '');
    setFonts(
      (templateConfig.fonts ?? []).map((font) => ({
        'font-family': font['font-family'] ?? '',
        url: font.url ?? '',
        type: font.type ?? defaultFontType,
      }))
    );
    setErrorMessage(null);
  }, [open, templateConfig, defaultFontType]);

  const updateFont = (index: number, partial: Partial<FontFormState>) => {
    setFonts((prev) =>
      prev.map((font, idx) => (idx === index ? { ...font, ...partial } : font))
    );
  };

  const handleAddFont = () => {
    setFonts((prev) => [
      ...prev,
      {
        'font-family': '',
        url: '',
        type: defaultFontType,
      },
    ]);
    setErrorMessage(null);
  };

  const handleRemoveFont = (index: number) => {
    setFonts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFontFileSelected = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    setUploadingIndex(index);
    setErrorMessage(null);
    try {
      const targetDirectory = ['templates', templateDir, 'assets'].join('/');
      try {
        await api.assetsControllerCreateNewFolder({
          source: targetDirectory,
          name: '',
        });
      } catch {
        // ignore if creation fails (likely already exists)
      }

      const fileName = encodeURIComponent(file.name);
      const formData = new FormData();
      formData.append('targetDirectory', targetDirectory);
      formData.append('files', file, fileName);
      await axios.post('/api/assets/upload', formData);
      updateFont(index, { url: `assets/${file.name}` });
    } catch (error) {
      console.error(error);
      setErrorMessage(t`字体文件上传失败，请重试`);
    } finally {
      setUploadingIndex(null);
      const input = fileInputRefs.current[index];
      if (input) {
        input.value = '';
      }
    }
  };

  const handleSave = async () => {
    if (!templateConfig) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage(t`模板名称不能为空`);
      return;
    }

    const sanitizedFonts: TemplateFontConfigDto[] = fonts
      .map((font) => ({
        'font-family': font['font-family'].trim(),
        url: font.url.trim(),
        type: font.type,
      }))
      .filter((font) => font['font-family'] || font.url || font.type);

    const hasPartialFont = sanitizedFonts.some(
      (font) => !font['font-family'] || !font.url || !font.type
    );

    if (hasPartialFont) {
      setErrorMessage(t`请完整填写每个字体的信息`);
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      await api.manageTemplateControllerUpdateTemplateConfig({
        templateDir,
        newTemplateConfig: {
          ...templateConfig,
          name: trimmedName,
          fonts: sanitizedFonts.length ? sanitizedFonts : undefined,
        },
      });
      if (onTemplateConfigUpdated) {
        await onTemplateConfigUpdated();
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      setErrorMessage(t`保存模板配置失败，请稍后重试`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{t`配置模板`}</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {isLoading ? (
              <Spinner label={t`正在加载模板配置`} />
            ) : (
              <>
                <Field label={t`模板名称`} required>
                  <Input value={name} onChange={(_, data) => setName(data.value)} />
                </Field>
                <div className={styles.fontHeader}>
                  <span>{t`字体配置`}</span>
                  <Button
                    appearance="subtle"
                    icon={<AddCircleIcon />}
                    onClick={handleAddFont}
                  >
                    {t`新增字体`}
                  </Button>
                </div>
                {fonts.length === 0 ? (
                  <span className={styles.emptyHint}>{t`尚未配置任何字体`}</span>
                ) : (
                  <div className={styles.fontList}>
                    {fonts.map((font, index) => (
                      <div key={index} className={styles.fontItem}>
                        <div className={styles.fontFields}>
                          <Field label={t`font-family`} required>
                            <Input
                              value={font['font-family']}
                              onChange={(_, data) =>
                                updateFont(index, { 'font-family': data.value })
                              }
                              placeholder="ExampleFont"
                            />
                          </Field>
                          <Field label={t`字体文件 URL`} required>
                            <Input
                              value={font.url}
                              onChange={(_, data) => updateFont(index, { url: data.value })}
                              placeholder="assets/ExampleFont.ttf"
                            />
                          </Field>
                          <Field label={t`字体类型`} required>
                            <Select
                              value={font.type}
                              onChange={(_, data) =>
                                updateFont(index, { type: data.value as FontTypeOption })
                              }
                            >
                              {FONT_TYPE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        </div>
                        <div className={styles.fontActions}>
                          <input
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2,.svg"
                            style={{ display: 'none' }}
                            ref={(element) => {
                              fileInputRefs.current[index] = element;
                            }}
                            onChange={(event) => handleFontFileSelected(index, event.target.files)}
                          />
                          <Button
                            appearance="secondary"
                            icon={<UploadIcon />}
                            onClick={() => fileInputRefs.current[index]?.click()}
                            disabled={uploadingIndex === index}
                          >
                            {uploadingIndex === index ? t`正在上传` : t`上传字体文件`}
                          </Button>
                          <Button
                            appearance="secondary"
                            icon={<DeleteIcon />}
                            onClick={() => handleRemoveFont(index)}
                          >
                            {t`删除`}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errorMessage && (
                  <span className={styles.errorMessage}>{errorMessage}</span>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              {t`取消`}
            </Button>
            <Button appearance="primary" onClick={handleSave} disabled={saving || isLoading}>
              {saving ? t`保存中...` : t`保存`}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
