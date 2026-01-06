import { Extension } from '@codemirror/state';
import {
  dracula,
  githubDark,
  githubLight,
  materialDark,
  materialLight,
  nord,
  atomone,
  solarizedDark,
  solarizedLight,
  tokyoNight,
} from '@uiw/codemirror-themes-all';

export interface CodeTheme {
  id: string;
  label: string;
  extension: Extension;
  isDark: boolean;
  background: string;
  foreground: string;
}

export const codeThemes: CodeTheme[] = [
  {
    id: 'dracula',
    label: 'Dracula',
    extension: dracula,
    isDark: true,
    background: '#282a36',
    foreground: '#f8f8f2',
  },
  {
    id: 'github-dark',
    label: 'GitHub Dark',
    extension: githubDark,
    isDark: true,
    background: '#0d1117',
    foreground: '#c9d1d9',
  },
  {
    id: 'github-light',
    label: 'GitHub Light',
    extension: githubLight,
    isDark: false,
    background: '#ffffff',
    foreground: '#24292f',
  },
  {
    id: 'material-dark',
    label: 'Material Dark',
    extension: materialDark,
    isDark: true,
    background: '#263238',
    foreground: '#eeffff',
  },
  {
    id: 'material-light',
    label: 'Material Light',
    extension: materialLight,
    isDark: false,
    background: '#fafafa',
    foreground: '#90a4ae',
  },
  {
    id: 'nord',
    label: 'Nord',
    extension: nord,
    isDark: true,
    background: '#2e3440',
    foreground: '#d8dee9',
  },
  {
    id: 'one-dark',
    label: 'One Dark',
    extension: atomone,
    isDark: true,
    background: '#282c34',
    foreground: '#abb2bf',
  },
  {
    id: 'solarized-dark',
    label: 'Solarized Dark',
    extension: solarizedDark,
    isDark: true,
    background: '#002b36',
    foreground: '#839496',
  },
  {
    id: 'solarized-light',
    label: 'Solarized Light',
    extension: solarizedLight,
    isDark: false,
    background: '#fdf6e3',
    foreground: '#657b83',
  },
  {
    id: 'tokyo-night',
    label: 'Tokyo Night',
    extension: tokyoNight,
    isDark: true,
    background: '#1a1b26',
    foreground: '#a9b1d6',
  },
];

export function getCodeThemeById(id: string): CodeTheme {
  return codeThemes.find((theme) => theme.id === id) || codeThemes[0];
}
