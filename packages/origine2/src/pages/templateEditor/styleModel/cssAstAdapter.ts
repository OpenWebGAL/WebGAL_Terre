import { compile, StylisElement } from 'stylis';
import { PSEUDO_STATES, PartRawRuleMap, PseudoState } from './types';

interface DeclNode {
  kind: 'decl';
  prop: string;
  value: string;
  line: number;
}

interface CommentNode {
  kind: 'comm';
  text: string;
  isLine: boolean;
  line: number;
}

interface RuleNode {
  kind: 'rule';
  header: string;
  resolvedSelectors: string[];
  children: ScssNode[];
  line: number;
}

interface AtRuleNode {
  kind: 'atrule';
  header: string;
  isStatement: boolean;
  children: ScssNode[];
  line: number;
}

type ScssNode = DeclNode | CommentNode | RuleNode | AtRuleNode;

const STATEMENT_AT_RULES = new Set(['@import', '@charset', '@namespace']);

export function normalizeSelector(selector: string): string {
  return selector
    .trim()
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*>\s*/g, ' > ')
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s*~\s*/g, ' ~ ')
    .replace(/\s+/g, ' ');
}

function cleanRuleHeader(rawValue: string): string {
  return rawValue
    .replace(/\f/g, '')
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

function convertCompiledList(elements: StylisElement[], ruleMap: Map<StylisElement, RuleNode>): ScssNode[] {
  const result: ScssNode[] = [];

  for (const elem of elements) {
    if (elem.type === 'decl') {
      const prop = typeof elem.props === 'string' ? elem.props.trim() : '';
      const value = typeof elem.children === 'string' ? elem.children.trim() : '';
      if (prop) {
        result.push({ kind: 'decl', prop, value, line: elem.line });
      }
      continue;
    }

    if (elem.type === 'comm') {
      const text = typeof elem.children === 'string' ? elem.children : '';
      result.push({ kind: 'comm', text, isLine: elem.props === '\n', line: elem.line });
      continue;
    }

    if (elem.type === 'rule') {
      const resolved = Array.isArray(elem.props) ? elem.props.map(normalizeSelector) : [];
      const childElements = Array.isArray(elem.children) ? elem.children : [];
      const node: RuleNode = {
        kind: 'rule',
        header: cleanRuleHeader(elem.value),
        resolvedSelectors: resolved,
        children: convertCompiledList(childElements, ruleMap),
        line: elem.line,
      };
      ruleMap.set(elem, node);

      const parentRule = elem.parent ? ruleMap.get(elem.parent) : undefined;
      if (parentRule) {
        parentRule.children.push(node);
      } else {
        result.push(node);
      }
      continue;
    }

    const childElements = Array.isArray(elem.children) ? elem.children : [];
    const isStatement =
      STATEMENT_AT_RULES.has(elem.type) ||
      (childElements.length === 0 && elem.value.trim().endsWith(';'));
    result.push({
      kind: 'atrule',
      header: elem.value.trim(),
      isStatement,
      children: isStatement ? [] : convertCompiledList(childElements, ruleMap),
      line: elem.line,
    });
  }

  return result;
}

function sortRuleChildrenByLine(nodes: ScssNode[]): void {
  for (const node of nodes) {
    if (node.kind === 'rule' || node.kind === 'atrule') {
      sortRuleChildrenByLine(node.children);
      if (node.kind === 'rule') {
        node.children.sort((a, b) => a.line - b.line);
      }
    }
  }
}

export function parseScssAst(scssText: string): ScssNode[] {
  if (!scssText.trim()) return [];
  const ruleMap = new Map<StylisElement, RuleNode>();
  const ast = convertCompiledList(compile(scssText), ruleMap);
  sortRuleChildrenByLine(ast);
  return ast;
}

function serializeNode(node: ScssNode, indentLevel: number): string {
  const indent = '  '.repeat(indentLevel);

  if (node.kind === 'decl') {
    return `${indent}${node.prop}: ${node.value};`;
  }

  if (node.kind === 'comm') {
    return node.isLine ? `${indent}//${node.text}` : `${indent}/*${node.text}*/`;
  }

  if (node.kind === 'atrule' && node.isStatement) {
    return `${indent}${node.header}`;
  }

  const body = node.children.map((child) => serializeNode(child, indentLevel + 1)).join('\n');
  if (!body) {
    return `${indent}${node.header} {}`;
  }
  return `${indent}${node.header} {\n${body}\n${indent}}`;
}

export function serializeScssAst(nodes: ScssNode[]): string {
  return nodes.map((node) => serializeNode(node, 0)).join('\n\n') + (nodes.length > 0 ? '\n' : '');
}

function getTargetSelector(selector: string, state: PseudoState): string {
  const base = normalizeSelector(selector);
  return state === 'default' ? base : `${base}:${state}`;
}

function ruleMatchesSelector(rule: RuleNode, targetSelector: string): boolean {
  return rule.resolvedSelectors.includes(targetSelector);
}

function collectRuleDeclarations(rule: RuleNode, out: Record<string, string>): void {
  for (const child of rule.children) {
    if (child.kind === 'decl') {
      out[child.prop.toLowerCase()] = child.value;
    }
  }
}

function walkMatchingRules(
  nodes: ScssNode[],
  targetSelector: string,
  recursive: boolean,
): RuleNode[] {
  const matched: RuleNode[] = [];
  for (const node of nodes) {
    if (node.kind !== 'rule') continue;
    if (ruleMatchesSelector(node, targetSelector)) {
      matched.push(node);
    }
    if (recursive) {
      matched.push(...walkMatchingRules(node.children, targetSelector, true));
    }
  }
  return matched;
}

function pickWritableRule(nodes: ScssNode[], selector: string, state: PseudoState): {
  baseRule?: RuleNode;
  targetRule?: RuleNode;
  parentRule?: RuleNode;
} {
  const baseSelector = normalizeSelector(selector);
  const targetSelector = getTargetSelector(selector, state);
  const baseRules: RuleNode[] = [];
  for (const node of nodes) {
    if (node.kind === 'rule' && ruleMatchesSelector(node, baseSelector)) {
      baseRules.push(node);
    }
  }
  const baseRule = baseRules[baseRules.length - 1];

  if (state === 'default') {
    return { baseRule, targetRule: baseRule };
  }

  let nestedPseudoRule: RuleNode | undefined;
  let nestedParentRule: RuleNode | undefined;
  for (const rule of baseRules) {
    for (const child of rule.children) {
      if (child.kind === 'rule' && ruleMatchesSelector(child, targetSelector)) {
        nestedPseudoRule = child;
        nestedParentRule = rule;
      }
    }
  }
  if (nestedPseudoRule) {
    return { baseRule: nestedParentRule, targetRule: nestedPseudoRule, parentRule: nestedParentRule };
  }

  let topLevelPseudoRule: RuleNode | undefined;
  for (const node of nodes) {
    if (node.kind === 'rule' && ruleMatchesSelector(node, targetSelector)) {
      topLevelPseudoRule = node;
    }
  }

  return { baseRule, targetRule: topLevelPseudoRule };
}

function applyDeclarationsToRule(
  rule: RuleNode,
  updates: Record<string, string | null | undefined>,
): boolean {
  let changed = false;

  for (const [rawProp, nextValue] of Object.entries(updates)) {
    if (nextValue === undefined) continue;
    const prop = rawProp.toLowerCase().trim();
    if (!prop) continue;

    const matchingIndexes: number[] = [];
    rule.children.forEach((child, idx) => {
      if (child.kind === 'decl' && child.prop.toLowerCase() === prop) {
        matchingIndexes.push(idx);
      }
    });

    if (nextValue === null) {
      if (matchingIndexes.length > 0) {
        const toRemove = new Set(matchingIndexes);
        rule.children = rule.children.filter((_, idx) => !toRemove.has(idx));
        changed = true;
      }
      continue;
    }

    if (matchingIndexes.length > 0) {
      const lastIdx = matchingIndexes[matchingIndexes.length - 1];
      const lastDecl = rule.children[lastIdx] as DeclNode;
      if (lastDecl.value !== nextValue || matchingIndexes.length > 1) {
        lastDecl.value = nextValue;
        if (matchingIndexes.length > 1) {
          const removeEarlier = new Set(matchingIndexes.slice(0, -1));
          rule.children = rule.children.filter((_, idx) => !removeEarlier.has(idx));
        }
        changed = true;
      }
    } else {
      const insertIdx = rule.children.findIndex((child) => child.kind === 'rule');
      const newDecl: DeclNode = { kind: 'decl', prop, value: nextValue, line: Number.MAX_SAFE_INTEGER };
      if (insertIdx === -1) {
        rule.children.push(newDecl);
      } else {
        rule.children.splice(insertIdx, 0, newDecl);
      }
      changed = true;
    }
  }

  return changed;
}

export function ensureEditableScss(defaultCssText: string, currentScssText: string): string {
  return currentScssText.trim() ? currentScssText : defaultCssText;
}

export function readRuleDeclarations(
  scssText: string,
  selector: string,
  state: PseudoState = 'default',
): Record<string, string> {
  const ast = parseScssAst(scssText);
  const targetSelector = getTargetSelector(selector, state);
  const matched = walkMatchingRules(ast, targetSelector, state !== 'default');

  const declarations: Record<string, string> = {};
  for (const rule of matched) {
    collectRuleDeclarations(rule, declarations);
  }
  return declarations;
}

export interface PatchRuleInput {
  scssText: string;
  selector: string;
  state: PseudoState;
  updates: Record<string, string | null | undefined>;
}

export function patchRuleDeclarations({ scssText, selector, state, updates }: PatchRuleInput): string {
  const ast = parseScssAst(scssText);
  const hasInsertOrUpdate = Object.values(updates).some((val) => typeof val === 'string');
  const resolved = pickWritableRule(ast, selector, state);
  let { baseRule, targetRule, parentRule } = resolved;

  if (!targetRule) {
    if (!hasInsertOrUpdate) return scssText;

    const baseSelector = normalizeSelector(selector);
    if (state === 'default') {
      targetRule = {
        kind: 'rule',
        header: selector.trim(),
        resolvedSelectors: [baseSelector],
        children: [],
        line: Number.MAX_SAFE_INTEGER,
      };
      ast.push(targetRule);
    } else {
      if (!baseRule) {
        baseRule = {
          kind: 'rule',
          header: selector.trim(),
          resolvedSelectors: [baseSelector],
          children: [],
          line: Number.MAX_SAFE_INTEGER,
        };
        ast.push(baseRule);
      }
      targetRule = {
        kind: 'rule',
        header: `&:${state}`,
        resolvedSelectors: [`${baseSelector}:${state}`],
        children: [],
        line: Number.MAX_SAFE_INTEGER,
      };
      baseRule.children.push(targetRule);
      parentRule = baseRule;
    }

    applyDeclarationsToRule(targetRule, updates);
    return serializeScssAst(ast);
  }

  const changed = applyDeclarationsToRule(targetRule, updates);
  if (!changed) return scssText;

  if (state !== 'default' && parentRule && targetRule.children.length === 0) {
    parentRule.children = parentRule.children.filter((child) => child !== targetRule);
  }

  return serializeScssAst(ast);
}

export function parsePartRawDeclarations(scssText: string, selector: string): PartRawRuleMap {
  return {
    default: readRuleDeclarations(scssText, selector, 'default'),
    hover: readRuleDeclarations(scssText, selector, 'hover'),
    active: readRuleDeclarations(scssText, selector, 'active'),
    disabled: readRuleDeclarations(scssText, selector, 'disabled'),
  };
}

export function replacePartRawDeclarations(
  scssText: string,
  selector: string,
  rules: PartRawRuleMap,
): string {
  let nextScss = scssText;

  for (const state of PSEUDO_STATES) {
    const existing = readRuleDeclarations(nextScss, selector, state);
    const nextDecls = rules[state];
    const updates: Record<string, string | null> = {};

    for (const prop of Object.keys(existing)) {
      if (!(prop in nextDecls)) {
        updates[prop] = null;
      }
    }
    for (const [prop, val] of Object.entries(nextDecls)) {
      const normalizedProp = prop.toLowerCase().trim();
      if (normalizedProp && val !== undefined) {
        updates[normalizedProp] = val.trim();
      }
    }

    nextScss = patchRuleDeclarations({ scssText: nextScss, selector, state, updates });
  }

  return nextScss;
}
