import merge from 'lodash.merge';
import {
  darkTheme,
  Theme,
} from '@rainbow-me/rainbowkit';

export const rainbowTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#afac88',
  },
} as Theme);