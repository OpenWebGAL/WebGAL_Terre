export interface CssDeclaration {
  prop: string;
  value: string;
}

interface ParsedRuleBlock {
  selector: string;
  decls: CssDeclaration[];
  nested: Array<{ suffix: string; decls: CssDeclaration[] }>;
}

const TEXT_PROPS = new Set([
  'color',
  '-webkit-text-fill-color',
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-shadow',
  '-webkit-text-stroke',
  '-webkit-text-stroke-width',
  '-webkit-text-stroke-color',
  'paint-order',
  'text-decoration',
]);

const TEXT_CLIP_BG_PROPS = new Set([
  'background',
  'background-image',
  'background-color',
  'background-clip',
  '-webkit-background-clip',
]);

const ROOT_LAYOUT_SKIP_PROPS = new Set([
  'width',
  'height',
  'position',
  'z-index',
]);

const TEXTBOX_BOX_GEOMETRY_PROPS = new Set([
  'left',
  'right',
  'top',
  'bottom',
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'border-radius',
]);

const SHOWNAME_GEOMETRY_PROPS = new Set([
  ...TEXTBOX_BOX_GEOMETRY_PROPS,
  'line-height',
  'padding',
  'font-size',
]);

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[\r\n])\s*\/\/[^\r\n]*/g, '$1');
}

function findMatchingBrace(text: string, openIndex: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function normalizeLegacyUrl(value: string): string {
  return value.replace(
    /url\(\s*(['"]?)(?:\.\.\/)+assets\/([^'")]+)\1\s*\)/g,
    'url("./game/template/assets/$2")',
  );
}

function parseDeclarations(raw: string): CssDeclaration[] {
  const decls: CssDeclaration[] = [];
  let buf = '';
  let parenDepth = 0;
  let quote: string | null = null;

  const flush = (chunk: string) => {
    const trimmed = chunk.trim();
    if (!trimmed) return;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) return;
    const prop = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const value = normalizeLegacyUrl(trimmed.slice(colonIdx + 1).trim());
    if (prop && value) {
      decls.push({ prop, value });
    }
  };

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (quote) {
      buf += ch;
      if (ch === '\\' && i + 1 < raw.length) buf += raw[++i];
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
    } else if (ch === '(') {
      parenDepth += 1;
      buf += ch;
    } else if (ch === ')' && parenDepth > 0) {
      parenDepth -= 1;
      buf += ch;
    } else if (ch === ';' && parenDepth === 0) {
      flush(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  flush(buf);
  return decls;
}

export function parseLegacyScssBlocks(scss: string): ParsedRuleBlock[] {
  const cleaned = stripComments(scss);
  const rules: ParsedRuleBlock[] = [];
  let cursor = 0;

  while (cursor < cleaned.length) {
    const openIdx = cleaned.indexOf('{', cursor);
    if (openIdx < 0) break;
    const closeIdx = findMatchingBrace(cleaned, openIdx);
    if (closeIdx < 0) break;

    const selector = cleaned.slice(cursor, openIdx).trim();
    const body = cleaned.slice(openIdx + 1, closeIdx);
    cursor = closeIdx + 1;

    if (!selector || selector.startsWith('@')) continue;

    const nested: Array<{ suffix: string; decls: CssDeclaration[] }> = [];
    let flatBody = '';
    let innerCursor = 0;
    while (innerCursor < body.length) {
      const innerOpen = body.indexOf('{', innerCursor);
      if (innerOpen < 0) {
        flatBody += body.slice(innerCursor);
        break;
      }
      const innerClose = findMatchingBrace(body, innerOpen);
      if (innerClose < 0) break;

      const before = body.slice(innerCursor, innerOpen);
      const lastSemi = before.lastIndexOf(';');
      flatBody += lastSemi >= 0 ? before.slice(0, lastSemi + 1) : '';
      const nestedSel = (
        lastSemi >= 0 ? before.slice(lastSemi + 1) : before
      ).trim();
      if (nestedSel.startsWith('&')) {
        nested.push({
          suffix: nestedSel.slice(1).trim(),
          decls: parseDeclarations(body.slice(innerOpen + 1, innerClose)),
        });
      }
      innerCursor = innerClose + 1;
    }

    rules.push({
      selector,
      decls: parseDeclarations(flatBody),
      nested,
    });
  }

  return rules;
}

function splitBoxAndTextDecls(decls: CssDeclaration[]): {
  box: CssDeclaration[];
  text: CssDeclaration[];
} {
  const hasTextClip = decls.some(
    (d) =>
      (d.prop === 'background-clip' || d.prop === '-webkit-background-clip') &&
      d.value.includes('text'),
  );
  const box: CssDeclaration[] = [];
  const text: CssDeclaration[] = [];

  for (const decl of decls) {
    if (
      TEXT_PROPS.has(decl.prop) ||
      (hasTextClip && TEXT_CLIP_BG_PROPS.has(decl.prop))
    ) {
      text.push(decl);
    } else {
      box.push(decl);
    }
  }
  if (hasTextClip && !text.some((d) => d.prop === 'background-clip')) {
    text.push({ prop: 'background-clip', value: 'text' });
  }
  return { box, text };
}

class RuleAccumulator {
  private readonly map = new Map<string, Map<string, string>>();

  add(selector: string, decls: CssDeclaration[]) {
    if (decls.length === 0) return;
    let bucket = this.map.get(selector);
    if (!bucket) {
      bucket = new Map<string, string>();
      this.map.set(selector, bucket);
    }
    for (const { prop, value } of decls) {
      bucket.set(prop, value);
    }
  }

  format(): string {
    const blocks: string[] = [];
    for (const [selector, bucket] of this.map.entries()) {
      if (bucket.size === 0) continue;
      const lines = Array.from(bucket.entries()).map(
        ([prop, value]) => `  ${prop}: ${value};`,
      );
      blocks.push(`${selector} {\n${lines.join('\n')}\n}`);
    }
    return blocks.length > 0
      ? `\n/* Migrated from legacy template */\n${blocks.join('\n\n')}\n`
      : '';
  }
}

export function migrateLegacyTitleScss(scss: string): string {
  const acc = new RuleAccumulator();
  for (const block of parseLegacyScssBlocks(scss)) {
    if (block.selector === '.Title_main') {
      acc.add(
        '.Title_main',
        block.decls.filter((d) => !ROOT_LAYOUT_SKIP_PROPS.has(d.prop)),
      );
    } else if (block.selector === '.Title_buttonList') {
      acc.add(
        '.Title_buttonList',
        block.decls.map((d) => {
          if (d.prop === 'height' && d.value === '100%')
            return { prop: 'height', value: '1440px' };
          if (d.prop === 'min-width' && d.value === '25%')
            return { prop: 'min-width', value: '640px' };
          return d;
        }),
      );
      for (const n of block.nested) {
        acc.add(`.Title_buttonList${n.suffix}`, n.decls);
      }
    } else if (block.selector === '.Title_button') {
      const { box, text } = splitBoxAndTextDecls(block.decls);
      acc.add('.Title_button', box);
      acc.add('.Title_button_text', text);
      for (const n of block.nested) {
        const splitNested = splitBoxAndTextDecls(n.decls);
        acc.add(`.Title_button${n.suffix}`, splitNested.box);
        acc.add(
          `.Title_button${n.suffix} .Title_button_text`,
          splitNested.text,
        );
      }
    } else if (block.selector === '.Title_button_disabled') {
      const { box, text } = splitBoxAndTextDecls(block.decls);
      acc.add(
        '.Title_button:disabled, .Title_button.Title_button_disabled',
        box,
      );
      acc.add(
        '.Title_button:disabled .Title_button_text, .Title_button.Title_button_disabled .Title_button_text',
        text,
      );
    } else if (block.selector === '.Title_button_text') {
      const { box, text } = splitBoxAndTextDecls(block.decls);
      acc.add('.Title_button_text', [...box, ...text]);
    }
  }
  return acc.format();
}

export function migrateLegacyChooseScss(scss: string): string {
  const acc = new RuleAccumulator();
  for (const block of parseLegacyScssBlocks(scss)) {
    if (block.selector === '.Choose_Main') {
      acc.add(
        '.Choose_Main',
        block.decls.filter((d) => !ROOT_LAYOUT_SKIP_PROPS.has(d.prop)),
      );
    } else if (block.selector === '.Choose_item') {
      const { box, text } = splitBoxAndTextDecls(block.decls);
      acc.add('.Choose_item', box);
      acc.add('.Choose_item_text', text);
      for (const n of block.nested) {
        const splitNested = splitBoxAndTextDecls(n.decls);
        acc.add(`.Choose_item${n.suffix}`, splitNested.box);
        acc.add(`.Choose_item${n.suffix} .Choose_item_text`, splitNested.text);
      }
    } else if (block.selector === '.Choose_item_disabled') {
      const { box, text } = splitBoxAndTextDecls(block.decls);
      acc.add('.Choose_item:disabled, .Choose_item.Choose_item_disabled', box);
      acc.add(
        '.Choose_item:disabled .Choose_item_text, .Choose_item.Choose_item_disabled .Choose_item_text',
        text,
      );
    }
  }
  return acc.format();
}

export function migrateLegacyTextboxScss(scss: string): string {
  const acc = new RuleAccumulator();
  for (const block of parseLegacyScssBlocks(scss)) {
    switch (block.selector) {
      case '.TextBox_main': {
        const { box, text } = splitBoxAndTextDecls(block.decls);
        acc.add('.TextBox_main', box);
        acc.add(
          '.TextBox_Background',
          box.filter((d) => TEXTBOX_BOX_GEOMETRY_PROPS.has(d.prop)),
        );
        acc.add(
          '.TextBox_text',
          text.filter((d) => d.prop !== 'color'),
        );
        break;
      }
      case '.TextBox_main_miniavatarOff':
        acc.add('.TextBox_main.TextBox_main_miniavatarOff', block.decls);
        acc.add('.TextBox_Background.TextBox_main_miniavatarOff', block.decls);
        break;
      case '.TextBox_Background': {
        const hasMask = block.decls.some(
          (d) => d.prop === 'mask-image' || d.prop === '-webkit-mask-image',
        );
        const hasBg = block.decls.some((d) => d.prop.startsWith('background'));
        const extras: CssDeclaration[] =
          hasBg && !hasMask
            ? [
                { prop: '-webkit-mask-image', value: 'none' },
                { prop: 'mask-image', value: 'none' },
              ]
            : [];
        acc.add('.TextBox_Background', [...block.decls, ...extras]);
        break;
      }
      case '.TextBox_showName':
        acc.add('.TextBox_showName', block.decls);
        acc.add(
          '.TextBox_ShowName_Background',
          block.decls.filter((d) => SHOWNAME_GEOMETRY_PROPS.has(d.prop)),
        );
        break;
      case '.TextBox_ShowName_Background': {
        const hasBorderImg = block.decls.some((d) => d.prop === 'border-image');
        const extras: CssDeclaration[] = hasBorderImg
          ? []
          : [{ prop: 'border-image', value: 'none' }];
        acc.add('.TextBox_ShowName_Background', [...block.decls, ...extras]);
        break;
      }
      case '.miniAvatarContainer':
        acc.add('.TextBox_miniAvatarContainer', block.decls);
        break;
      case '.miniAvatarImg':
        acc.add('.TextBox_miniAvatarImg', block.decls);
        break;
      case '.text':
        acc.add(
          '.TextBox_text',
          block.decls.filter((d) => TEXT_PROPS.has(d.prop)),
        );
        break;
      case '.outer':
      case '.inner': {
        const { text } = splitBoxAndTextDecls(block.decls);
        acc.add('.TextBox_text', text);
        break;
      }
      case '.outerName':
      case '.innerName': {
        const { text } = splitBoxAndTextDecls(block.decls);
        acc.add('.TextBox_showName', text);
        break;
      }
      case '.readText':
      case '.readTextOuter': {
        const { text } = splitBoxAndTextDecls(block.decls);
        acc.add('.TextBox_text.TextBox_text_read', text);
        break;
      }
    }
  }
  return acc.format();
}
