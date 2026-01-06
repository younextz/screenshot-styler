import { highlightCode, tagHighlighter, tags, Tag } from '@lezer/highlight';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { go } from '@codemirror/lang-go';
import { rust } from '@codemirror/lang-rust';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';

export interface HighlightedToken {
  text: string;
  color: string;
}

export interface ThemeColors {
  keyword: string;
  string: string;
  comment: string;
  function: string;
  variable: string;
  number: string;
  operator: string;
  punctuation: string;
  type: string;
  property: string;
  tag: string;
  attribute: string;
  default: string;
}

const themeColorMappings: Record<string, ThemeColors> = {
  dracula: {
    keyword: '#ff79c6',
    string: '#f1fa8c',
    comment: '#6272a4',
    function: '#50fa7b',
    variable: '#f8f8f2',
    number: '#bd93f9',
    operator: '#ff79c6',
    punctuation: '#f8f8f2',
    type: '#8be9fd',
    property: '#66d9ef',
    tag: '#ff79c6',
    attribute: '#50fa7b',
    default: '#f8f8f2',
  },
  'github-dark': {
    keyword: '#ff7b72',
    string: '#a5d6ff',
    comment: '#8b949e',
    function: '#d2a8ff',
    variable: '#c9d1d9',
    number: '#79c0ff',
    operator: '#ff7b72',
    punctuation: '#c9d1d9',
    type: '#ff7b72',
    property: '#79c0ff',
    tag: '#7ee787',
    attribute: '#79c0ff',
    default: '#c9d1d9',
  },
  'github-light': {
    keyword: '#cf222e',
    string: '#0a3069',
    comment: '#6e7781',
    function: '#8250df',
    variable: '#24292f',
    number: '#0550ae',
    operator: '#cf222e',
    punctuation: '#24292f',
    type: '#cf222e',
    property: '#0550ae',
    tag: '#116329',
    attribute: '#0550ae',
    default: '#24292f',
  },
  'material-dark': {
    keyword: '#c792ea',
    string: '#c3e88d',
    comment: '#546e7a',
    function: '#82aaff',
    variable: '#eeffff',
    number: '#f78c6c',
    operator: '#89ddff',
    punctuation: '#89ddff',
    type: '#ffcb6b',
    property: '#82aaff',
    tag: '#f07178',
    attribute: '#c792ea',
    default: '#eeffff',
  },
  'material-light': {
    keyword: '#7c4dff',
    string: '#91b859',
    comment: '#90a4ae',
    function: '#6182b8',
    variable: '#90a4ae',
    number: '#f76d47',
    operator: '#39adb5',
    punctuation: '#39adb5',
    type: '#ffb62c',
    property: '#6182b8',
    tag: '#e53935',
    attribute: '#7c4dff',
    default: '#90a4ae',
  },
  nord: {
    keyword: '#81a1c1',
    string: '#a3be8c',
    comment: '#616e88',
    function: '#88c0d0',
    variable: '#d8dee9',
    number: '#b48ead',
    operator: '#81a1c1',
    punctuation: '#eceff4',
    type: '#8fbcbb',
    property: '#88c0d0',
    tag: '#81a1c1',
    attribute: '#8fbcbb',
    default: '#d8dee9',
  },
  'one-dark': {
    keyword: '#c678dd',
    string: '#98c379',
    comment: '#5c6370',
    function: '#61afef',
    variable: '#abb2bf',
    number: '#d19a66',
    operator: '#56b6c2',
    punctuation: '#abb2bf',
    type: '#e5c07b',
    property: '#61afef',
    tag: '#e06c75',
    attribute: '#d19a66',
    default: '#abb2bf',
  },
  'solarized-dark': {
    keyword: '#859900',
    string: '#2aa198',
    comment: '#586e75',
    function: '#268bd2',
    variable: '#839496',
    number: '#d33682',
    operator: '#859900',
    punctuation: '#839496',
    type: '#b58900',
    property: '#268bd2',
    tag: '#268bd2',
    attribute: '#b58900',
    default: '#839496',
  },
  'solarized-light': {
    keyword: '#859900',
    string: '#2aa198',
    comment: '#93a1a1',
    function: '#268bd2',
    variable: '#657b83',
    number: '#d33682',
    operator: '#859900',
    punctuation: '#657b83',
    type: '#b58900',
    property: '#268bd2',
    tag: '#268bd2',
    attribute: '#b58900',
    default: '#657b83',
  },
  'tokyo-night': {
    keyword: '#bb9af7',
    string: '#9ece6a',
    comment: '#565f89',
    function: '#7aa2f7',
    variable: '#a9b1d6',
    number: '#ff9e64',
    operator: '#89ddff',
    punctuation: '#a9b1d6',
    type: '#2ac3de',
    property: '#7aa2f7',
    tag: '#f7768e',
    attribute: '#bb9af7',
    default: '#a9b1d6',
  },
};

function getParserForLanguage(languageId: string) {
  switch (languageId) {
    case 'javascript':
      return javascript().language.parser;
    case 'typescript':
      return javascript({ typescript: true }).language.parser;
    case 'python':
      return python().language.parser;
    case 'java':
      return java().language.parser;
    case 'cpp':
      return cpp().language.parser;
    case 'go':
      return go().language.parser;
    case 'rust':
      return rust().language.parser;
    case 'html':
      return html().language.parser;
    case 'css':
      return css().language.parser;
    default:
      return javascript().language.parser;
  }
}

function createHighlighter(themeId: string) {
  const colors = themeColorMappings[themeId] || themeColorMappings['dracula'];

  const tagMappings: { tag: Tag | readonly Tag[]; class: string }[] = [
    { tag: tags.keyword, class: 'keyword' },
    { tag: tags.controlKeyword, class: 'keyword' },
    { tag: tags.definitionKeyword, class: 'keyword' },
    { tag: tags.moduleKeyword, class: 'keyword' },
    { tag: tags.operatorKeyword, class: 'keyword' },
    { tag: tags.string, class: 'string' },
    { tag: tags.special(tags.string), class: 'string' },
    { tag: tags.comment, class: 'comment' },
    { tag: tags.lineComment, class: 'comment' },
    { tag: tags.blockComment, class: 'comment' },
    { tag: tags.docComment, class: 'comment' },
    { tag: tags.function(tags.variableName), class: 'function' },
    { tag: tags.function(tags.propertyName), class: 'function' },
    { tag: tags.definition(tags.function(tags.variableName)), class: 'function' },
    { tag: tags.variableName, class: 'variable' },
    { tag: tags.definition(tags.variableName), class: 'variable' },
    { tag: tags.number, class: 'number' },
    { tag: tags.integer, class: 'number' },
    { tag: tags.float, class: 'number' },
    { tag: tags.operator, class: 'operator' },
    { tag: tags.arithmeticOperator, class: 'operator' },
    { tag: tags.logicOperator, class: 'operator' },
    { tag: tags.compareOperator, class: 'operator' },
    { tag: tags.punctuation, class: 'punctuation' },
    { tag: tags.paren, class: 'punctuation' },
    { tag: tags.brace, class: 'punctuation' },
    { tag: tags.bracket, class: 'punctuation' },
    { tag: tags.typeName, class: 'type' },
    { tag: tags.className, class: 'type' },
    { tag: tags.propertyName, class: 'property' },
    { tag: tags.tagName, class: 'tag' },
    { tag: tags.attributeName, class: 'attribute' },
    { tag: tags.bool, class: 'keyword' },
    { tag: tags.null, class: 'keyword' },
    { tag: tags.self, class: 'keyword' },
  ];

  const highlighter = tagHighlighter(tagMappings);

  return { highlighter, colors };
}

export function highlightCodeToTokens(
  code: string,
  languageId: string,
  themeId: string
): HighlightedToken[][] {
  const parser = getParserForLanguage(languageId);
  const tree = parser.parse(code);
  const { highlighter, colors } = createHighlighter(themeId);

  const result: HighlightedToken[][] = [];
  let currentLine: HighlightedToken[] = [];

  const putText = (text: string, classes: string) => {
    const colorKey = classes as keyof ThemeColors;
    const color = classes ? (colors[colorKey] || colors.default) : colors.default;
    currentLine.push({ text, color });
  };

  const putBreak = () => {
    result.push(currentLine);
    currentLine = [];
  };

  highlightCode(code, tree, highlighter, putText, putBreak);

  if (currentLine.length > 0 || result.length === 0) {
    result.push(currentLine);
  }

  return result;
}

export function getThemeColors(themeId: string): ThemeColors {
  return themeColorMappings[themeId] || themeColorMappings['dracula'];
}
