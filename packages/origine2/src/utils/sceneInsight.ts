export type SceneInsightSeverity = 'info' | 'warning' | 'error';

export type SceneInsightNodeKind =
  | 'label'
  | 'choice'
  | 'scene'
  | 'asset'
  | 'variable'
  | 'comment'
  | 'command';

export type SceneAssetKind =
  | 'background'
  | 'figure'
  | 'bgm'
  | 'vocal'
  | 'video'
  | 'scene'
  | 'style'
  | 'unknown';

export interface SceneInsightLocation {
  lineNumber: number;
  column: number;
  raw: string;
}

export interface SceneInsightNode {
  id: string;
  kind: SceneInsightNodeKind;
  title: string;
  subtitle: string;
  location: SceneInsightLocation;
  command: string;
  target?: string;
  assetKind?: SceneAssetKind;
}

export interface SceneInsightDiagnostic {
  id: string;
  severity: SceneInsightSeverity;
  code: string;
  message: string;
  location: SceneInsightLocation;
}

export interface SceneInsightLabel {
  name: string;
  lineNumber: number;
  duplicate: boolean;
}

export interface SceneInsightChoice {
  text: string;
  target: string;
  lineNumber: number;
  raw: string;
}

export interface SceneInsightAsset {
  name: string;
  kind: SceneAssetKind;
  lineNumber: number;
  command: string;
}

export interface SceneInsightVariable {
  name: string;
  mode: 'read' | 'write' | 'condition';
  lineNumber: number;
  expression: string;
}

export interface SceneInsightCommandCount {
  command: string;
  count: number;
  firstLine: number;
  lastLine: number;
}

export interface SceneInsight {
  sceneName: string;
  targetPath: string;
  lineCount: number;
  nodes: SceneInsightNode[];
  diagnostics: SceneInsightDiagnostic[];
  labels: SceneInsightLabel[];
  choices: SceneInsightChoice[];
  assets: SceneInsightAsset[];
  variables: SceneInsightVariable[];
  commandCounts: SceneInsightCommandCount[];
  referencedScenes: string[];
  referencedLabels: string[];
  summary: {
    labelCount: number;
    choiceCount: number;
    assetCount: number;
    variableCount: number;
    diagnosticCount: number;
  };
}

interface ParsedSceneLine {
  lineNumber: number;
  raw: string;
  command: string;
  content: string;
  args: SceneInsightArg[];
  inlineComment: string;
  isCommentOnly: boolean;
  isEmpty: boolean;
}

interface SceneInsightArg {
  key: string;
  value: string | boolean | number;
  raw: string;
}

interface SceneInsightBuildContext {
  sceneName: string;
  targetPath: string;
  lines: ParsedSceneLine[];
  nodes: SceneInsightNode[];
  diagnostics: SceneInsightDiagnostic[];
  labels: SceneInsightLabel[];
  choices: SceneInsightChoice[];
  assets: SceneInsightAsset[];
  variables: SceneInsightVariable[];
  commandCounts: Map<string, SceneInsightCommandCount>;
  labelLineMap: Map<string, SceneInsightLabel[]>;
  referencedScenes: Set<string>;
  referencedLabels: Set<string>;
}

const ASSET_COMMANDS: Record<string, SceneAssetKind> = {
  changeBg: 'background',
  changeFigure: 'figure',
  miniAvatar: 'figure',
  bgm: 'bgm',
  unlockBgm: 'bgm',
  playEffect: 'vocal',
  video: 'video',
  callScene: 'scene',
  changeScene: 'scene',
  applyStyle: 'style',
};

const SCENE_REFERENCE_COMMANDS = new Set(['callScene', 'changeScene']);
const LABEL_REFERENCE_COMMANDS = new Set(['jumpLabel', 'chooseLabel']);
const TERMINAL_COMMANDS = new Set(['end', 'changeScene']);
const VARIABLE_WRITE_COMMANDS = new Set(['setVar']);
const VARIABLE_CONDITION_COMMANDS = new Set(['if']);
const RESERVED_WORDS = new Set(['true', 'false', 'null', 'undefined', 'and', 'or', 'not']);
const VARIABLE_RE = /[A-Za-z_\u4e00-\u9fa5][\w\u4e00-\u9fa5]*/g;

export function createSceneInsight(sceneText: string, sceneName: string, targetPath: string): SceneInsight {
  const lines = parseSceneLines(sceneText);
  const context: SceneInsightBuildContext = {
    sceneName,
    targetPath,
    lines,
    nodes: [],
    diagnostics: [],
    labels: [],
    choices: [],
    assets: [],
    variables: [],
    commandCounts: new Map(),
    labelLineMap: new Map(),
    referencedScenes: new Set(),
    referencedLabels: new Set(),
  };

  collectCommandCounts(context);
  collectLabels(context);
  collectChoices(context);
  collectAssets(context);
  collectReferences(context);
  collectVariables(context);
  collectCommentNodes(context);
  collectCommandNodes(context);
  validateLabels(context);
  validateReferences(context);
  validateChoices(context);
  validateAssets(context);
  validateFlow(context);

  const diagnostics = sortDiagnostics(context.diagnostics);
  const nodes = sortNodes(context.nodes);
  const assets = sortAssets(context.assets);
  const variables = sortVariables(context.variables);
  const choices = sortChoices(context.choices);
  const labels = sortLabels(context.labels);
  const commandCounts = Array.from(context.commandCounts.values()).sort((a, b) => a.firstLine - b.firstLine);

  return {
    sceneName,
    targetPath,
    lineCount: lines.length,
    nodes,
    diagnostics,
    labels,
    choices,
    assets,
    variables,
    commandCounts,
    referencedScenes: Array.from(context.referencedScenes).sort(),
    referencedLabels: Array.from(context.referencedLabels).sort(),
    summary: {
      labelCount: labels.length,
      choiceCount: choices.length,
      assetCount: assets.length,
      variableCount: variables.length,
      diagnosticCount: diagnostics.length,
    },
  };
}

export function parseSceneLines(sceneText: string): ParsedSceneLine[] {
  return sceneText.split(/\r?\n/).map((rawLine, index) => {
    const lineNumber = index + 1;
    const trimmed = rawLine.trim();

    if (!trimmed) {
      return {
        lineNumber,
        raw: rawLine,
        command: '',
        content: '',
        args: [],
        inlineComment: '',
        isCommentOnly: false,
        isEmpty: true,
      };
    }

    if (trimmed.startsWith(';')) {
      return {
        lineNumber,
        raw: rawLine,
        command: 'comment',
        content: trimmed.slice(1).trim(),
        args: [],
        inlineComment: '',
        isCommentOnly: true,
        isEmpty: false,
      };
    }

    const { statement, inlineComment } = splitInlineComment(rawLine);
    const statementWithoutSemicolon = trimTrailingSemicolon(statement.trim());
    const colonIndex = findUnescaped(statementWithoutSemicolon, ':');

    if (colonIndex < 0) {
      return {
        lineNumber,
        raw: rawLine,
        command: statementWithoutSemicolon.trim(),
        content: '',
        args: [],
        inlineComment,
        isCommentOnly: false,
        isEmpty: false,
      };
    }

    const command = statementWithoutSemicolon.slice(0, colonIndex).trim();
    const rest = statementWithoutSemicolon.slice(colonIndex + 1);
    const { content, args } = splitContentAndArgs(rest);

    return {
      lineNumber,
      raw: rawLine,
      command,
      content,
      args,
      inlineComment,
      isCommentOnly: false,
      isEmpty: false,
    };
  });
}

function collectCommandCounts(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    if (!line.command || line.isEmpty) return;
    const key = line.command;
    const existing = context.commandCounts.get(key);
    if (existing) {
      existing.count += 1;
      existing.lastLine = line.lineNumber;
      return;
    }
    context.commandCounts.set(key, {
      command: key,
      count: 1,
      firstLine: line.lineNumber,
      lastLine: line.lineNumber,
    });
  });
}

function collectLabels(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    if (line.command !== 'label') return;
    const name = line.content.trim();
    const label: SceneInsightLabel = {
      name,
      lineNumber: line.lineNumber,
      duplicate: false,
    };
    context.labels.push(label);
    const list = context.labelLineMap.get(name) ?? [];
    list.push(label);
    context.labelLineMap.set(name, list);
    pushNode(context, {
      kind: 'label',
      title: name || '(empty label)',
      subtitle: 'Label',
      line,
      command: line.command,
      target: name,
    });
  });
}

function collectChoices(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    if (line.command !== 'choose') return;
    const choices = parseChoices(line.content);
    choices.forEach((choice) => {
      context.choices.push({
        text: choice.text,
        target: choice.target,
        lineNumber: line.lineNumber,
        raw: choice.raw,
      });
      if (choice.target) {
        context.referencedScenes.add(choice.target);
      }
      pushNode(context, {
        kind: 'choice',
        title: choice.text || '(empty choice)',
        subtitle: choice.target ? `Choice -> ${choice.target}` : 'Choice without target',
        line,
        command: line.command,
        target: choice.target,
      });
    });
  });
}

function collectAssets(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    const assetKind = ASSET_COMMANDS[line.command];
    if (!assetKind) return;
    const assetName = line.content.trim();
    if (!assetName || assetName === 'none') return;
    const asset: SceneInsightAsset = {
      name: normalizePath(assetName),
      kind: assetKind,
      lineNumber: line.lineNumber,
      command: line.command,
    };
    context.assets.push(asset);
    pushNode(context, {
      kind: 'asset',
      title: asset.name,
      subtitle: `${asset.kind} asset`,
      line,
      command: line.command,
      target: asset.name,
      assetKind: asset.kind,
    });
  });
}

function collectReferences(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    if (SCENE_REFERENCE_COMMANDS.has(line.command)) {
      const sceneTarget = normalizePath(line.content);
      if (sceneTarget) {
        context.referencedScenes.add(sceneTarget);
        pushNode(context, {
          kind: 'scene',
          title: sceneTarget,
          subtitle: `${line.command} scene reference`,
          line,
          command: line.command,
          target: sceneTarget,
        });
      }
    }

    if (LABEL_REFERENCE_COMMANDS.has(line.command)) {
      const labelTarget = line.content.trim();
      if (labelTarget) {
        context.referencedLabels.add(labelTarget);
        pushNode(context, {
          kind: 'label',
          title: labelTarget,
          subtitle: `${line.command} label reference`,
          line,
          command: line.command,
          target: labelTarget,
        });
      }
    }
  });
}

function collectVariables(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    if (VARIABLE_WRITE_COMMANDS.has(line.command)) {
      collectWriteVariable(context, line);
    }

    if (VARIABLE_CONDITION_COMMANDS.has(line.command)) {
      collectExpressionVariables(context, line, line.content, 'condition');
    }

    line.args.forEach((arg) => {
      if (arg.key === 'when' && typeof arg.value === 'string') {
        collectExpressionVariables(context, line, arg.value, 'condition');
      }
    });
  });
}

function collectWriteVariable(context: SceneInsightBuildContext, line: ParsedSceneLine) {
  const expression = line.content.trim();
  const equalIndex = expression.indexOf('=');
  if (equalIndex < 0) {
    pushDiagnostic(context, 'warning', 'invalid-set-var', 'setVar expression does not contain "=".', line);
    return;
  }

  const name = expression.slice(0, equalIndex).trim();
  if (!name) {
    pushDiagnostic(context, 'warning', 'empty-var-name', 'setVar expression has an empty variable name.', line);
    return;
  }

  const variable: SceneInsightVariable = {
    name,
    mode: 'write',
    lineNumber: line.lineNumber,
    expression,
  };
  context.variables.push(variable);
  pushNode(context, {
    kind: 'variable',
    title: name,
    subtitle: 'Variable write',
    line,
    command: line.command,
    target: name,
  });

  collectExpressionVariables(context, line, expression.slice(equalIndex + 1), 'read');
}

function collectExpressionVariables(
  context: SceneInsightBuildContext,
  line: ParsedSceneLine,
  expression: string,
  mode: SceneInsightVariable['mode'],
) {
  extractVariableNames(expression).forEach((name) => {
    context.variables.push({
      name,
      mode,
      lineNumber: line.lineNumber,
      expression,
    });
    pushNode(context, {
      kind: 'variable',
      title: name,
      subtitle: mode === 'condition' ? 'Variable condition' : 'Variable read',
      line,
      command: line.command,
      target: name,
    });
  });
}

function collectCommentNodes(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    if (!line.isCommentOnly) return;
    pushNode(context, {
      kind: 'comment',
      title: line.content || '(empty comment)',
      subtitle: 'Comment',
      line,
      command: line.command,
    });
  });
}

function collectCommandNodes(context: SceneInsightBuildContext) {
  context.lines.forEach((line) => {
    if (!line.command || line.isCommentOnly || line.isEmpty) return;
    if (['label', 'choose', 'setVar', 'if'].includes(line.command)) return;
    if (ASSET_COMMANDS[line.command] || SCENE_REFERENCE_COMMANDS.has(line.command) || LABEL_REFERENCE_COMMANDS.has(line.command)) return;
    pushNode(context, {
      kind: 'command',
      title: line.command,
      subtitle: line.content || 'Command',
      line,
      command: line.command,
      target: line.content,
    });
  });
}

function validateLabels(context: SceneInsightBuildContext) {
  context.labelLineMap.forEach((labels, name) => {
    if (!name) {
      labels.forEach((label) => {
        pushDiagnosticAt(context, 'warning', 'empty-label', 'Label name is empty.', label.lineNumber, 1, '');
      });
      return;
    }

    if (labels.length > 1) {
      labels.forEach((label) => {
        label.duplicate = true;
        pushDiagnosticAt(
          context,
          'error',
          'duplicate-label',
          `Label "${name}" is defined ${labels.length} times.`,
          label.lineNumber,
          1,
          name,
        );
      });
    }
  });
}

function validateReferences(context: SceneInsightBuildContext) {
  context.referencedLabels.forEach((label) => {
    if (!context.labelLineMap.has(label)) {
      const node = context.nodes.find((item) => item.kind === 'label' && item.target === label);
      pushDiagnosticAt(
        context,
        'error',
        'missing-label',
        `Label "${label}" is referenced but not defined in this scene.`,
        node?.location.lineNumber ?? 1,
        node?.location.column ?? 1,
        node?.location.raw ?? label,
      );
    }
  });
}

function validateChoices(context: SceneInsightBuildContext) {
  context.choices.forEach((choice) => {
    if (!choice.text) {
      pushDiagnosticAt(context, 'warning', 'empty-choice-text', 'Choice text is empty.', choice.lineNumber, 1, choice.raw);
    }
    if (!choice.target) {
      pushDiagnosticAt(context, 'warning', 'empty-choice-target', 'Choice target scene is empty.', choice.lineNumber, 1, choice.raw);
    }
  });
}

function validateAssets(context: SceneInsightBuildContext) {
  context.assets.forEach((asset) => {
    if (asset.kind === 'scene') return;
    if (!asset.name.includes('.') && asset.kind !== 'unknown') {
      pushDiagnosticAt(
        context,
        'info',
        'asset-without-extension',
        `Asset "${asset.name}" has no file extension.`,
        asset.lineNumber,
        1,
        asset.name,
      );
    }
  });
}

function validateFlow(context: SceneInsightBuildContext) {
  context.lines.forEach((line, index) => {
    if (!TERMINAL_COMMANDS.has(line.command)) return;
    const next = findNextExecutableLine(context.lines, index + 1);
    if (!next || next.command === 'label') return;
    pushDiagnostic(context, 'info', 'unreachable-line', 'This line follows a terminal command before the next label.', next);
  });
}

function parseChoices(content: string): Array<{ text: string; target: string; raw: string }> {
  return splitEscaped(content, '|').map((rawChoice) => {
    const parts = splitEscaped(rawChoice, ':');
    const text = unescapeChoiceToken((parts.shift() ?? '').trim());
    const target = unescapeChoiceToken(parts.join(':').trim());
    return { text, target, raw: rawChoice };
  });
}

function splitContentAndArgs(input: string): { content: string; args: SceneInsightArg[] } {
  const tokens = splitArgs(input);
  const content = tokens.shift() ?? '';
  const args = tokens.map(parseArgToken).filter((arg): arg is SceneInsightArg => Boolean(arg));
  return { content: content.trim(), args };
}

function splitArgs(input: string): string[] {
  const result: string[] = [];
  let current = '';
  let escaped = false;
  let inQuote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }

    if ((char === '"' || char === "'") && !inQuote) {
      current += char;
      inQuote = char;
      continue;
    }

    if (char === inQuote) {
      current += char;
      inQuote = null;
      continue;
    }

    if (!inQuote && char === ' ' && next === '-') {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseArgToken(token: string): SceneInsightArg | null {
  const raw = token.trim();
  if (!raw.startsWith('-')) return null;
  const withoutDash = raw.slice(1);
  const equalIndex = withoutDash.indexOf('=');
  if (equalIndex < 0) {
    return { key: withoutDash.trim(), value: true, raw };
  }
  const key = withoutDash.slice(0, equalIndex).trim();
  const valueRaw = withoutDash.slice(equalIndex + 1).trim();
  return { key, value: parseArgValue(valueRaw), raw };
}

function parseArgValue(value: string): string | boolean | number {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value !== '' && !Number.isNaN(Number(value))) return Number(value);
  return stripWrappingQuotes(value);
}

function splitInlineComment(rawLine: string): { statement: string; inlineComment: string } {
  let escaped = false;
  for (let i = 0; i < rawLine.length; i++) {
    const char = rawLine[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '/' && rawLine[i + 1] === '/') {
      return {
        statement: rawLine.slice(0, i),
        inlineComment: rawLine.slice(i).trim(),
      };
    }
  }
  return { statement: rawLine, inlineComment: '' };
}

function splitEscaped(input: string, separator: string): string[] {
  const parts: string[] = [];
  let current = '';
  let escaped = false;

  for (const char of input) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }
    if (char === separator) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  parts.push(current);
  return parts;
}

function findUnescaped(input: string, target: string): number {
  let escaped = false;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === target) return i;
  }
  return -1;
}

function trimTrailingSemicolon(input: string): string {
  let escaped = false;
  for (let i = input.length - 1; i >= 0; i--) {
    const char = input[i];
    if (char.trim() === '') continue;
    if (char === ';' && !escaped) return input.slice(0, i);
    break;
  }
  return input;
}

function extractVariableNames(expression: string): string[] {
  const names = new Set<string>();
  const cleanExpression = expression.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, ' ');
  let match: RegExpExecArray | null;
  while ((match = VARIABLE_RE.exec(cleanExpression)) !== null) {
    const token = match[0];
    if (!RESERVED_WORDS.has(token.toLowerCase())) {
      names.add(token);
    }
  }
  return Array.from(names);
}

function findNextExecutableLine(lines: ParsedSceneLine[], startIndex: number): ParsedSceneLine | null {
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (line.isEmpty || line.isCommentOnly) continue;
    return line;
  }
  return null;
}

function pushNode(
  context: SceneInsightBuildContext,
  input: {
    kind: SceneInsightNodeKind;
    title: string;
    subtitle: string;
    line: ParsedSceneLine;
    command: string;
    target?: string;
    assetKind?: SceneAssetKind;
  },
) {
  context.nodes.push({
    id: `${input.kind}:${input.line.lineNumber}:${context.nodes.length}`,
    kind: input.kind,
    title: input.title,
    subtitle: input.subtitle,
    location: {
      lineNumber: input.line.lineNumber,
      column: 1,
      raw: input.line.raw,
    },
    command: input.command,
    target: input.target,
    assetKind: input.assetKind,
  });
}

function pushDiagnostic(
  context: SceneInsightBuildContext,
  severity: SceneInsightSeverity,
  code: string,
  message: string,
  line: ParsedSceneLine,
) {
  pushDiagnosticAt(context, severity, code, message, line.lineNumber, 1, line.raw);
}

function pushDiagnosticAt(
  context: SceneInsightBuildContext,
  severity: SceneInsightSeverity,
  code: string,
  message: string,
  lineNumber: number,
  column: number,
  raw: string,
) {
  context.diagnostics.push({
    id: `${code}:${lineNumber}:${context.diagnostics.length}`,
    severity,
    code,
    message,
    location: {
      lineNumber,
      column,
      raw,
    },
  });
}

function sortNodes(nodes: SceneInsightNode[]): SceneInsightNode[] {
  return [...nodes].sort((a, b) => a.location.lineNumber - b.location.lineNumber || a.title.localeCompare(b.title));
}

function sortDiagnostics(diagnostics: SceneInsightDiagnostic[]): SceneInsightDiagnostic[] {
  const severityWeight: Record<SceneInsightSeverity, number> = {
    error: 0,
    warning: 1,
    info: 2,
  };
  return [...diagnostics].sort(
    (a, b) => severityWeight[a.severity] - severityWeight[b.severity] || a.location.lineNumber - b.location.lineNumber,
  );
}

function sortLabels(labels: SceneInsightLabel[]): SceneInsightLabel[] {
  return [...labels].sort((a, b) => a.lineNumber - b.lineNumber);
}

function sortChoices(choices: SceneInsightChoice[]): SceneInsightChoice[] {
  return [...choices].sort((a, b) => a.lineNumber - b.lineNumber);
}

function sortAssets(assets: SceneInsightAsset[]): SceneInsightAsset[] {
  return [...assets].sort((a, b) => a.lineNumber - b.lineNumber || a.name.localeCompare(b.name));
}

function sortVariables(variables: SceneInsightVariable[]): SceneInsightVariable[] {
  return [...variables].sort((a, b) => a.lineNumber - b.lineNumber || a.name.localeCompare(b.name));
}

function normalizePath(path: string): string {
  return path.trim().replace(/\\/g, '/');
}

function stripWrappingQuotes(input: string): string {
  if ((input.startsWith('"') && input.endsWith('"')) || (input.startsWith("'") && input.endsWith("'"))) {
    return input.slice(1, -1);
  }
  return input;
}

function unescapeChoiceToken(input: string): string {
  return input.replace(/\\([|:])/g, '$1');
}
