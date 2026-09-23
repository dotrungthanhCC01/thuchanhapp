import { Dimensions } from 'react-native';

export const { width, height } = Dimensions.get('window');

// Neobrutalism palette
export const COLORS = {
  light: {
    bg: '#F0ECD8',           // Warm cream background
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardYellow: '#FFE234',
    cardGreen: '#B8F252',
    cardPurple: '#7B2FFF',
    cardBlue: '#2FD9FF',
    primary: '#FFE234',      // Yellow accent
    primaryText: '#1A1A1A',
    text: '#1A1A1A',
    textSub: '#6B6655',
    textMuted: '#9E9880',
    border: '#1A1A1A',
    shadow: '#1A1A1A',
    navBg: '#F0ECD8',
    navActiveBg: '#FFE234',
    statCard1: '#FFE234',
    statCard2: '#B8F252',
    statCard3: '#7B2FFF',
    progressBg: '#D4D0BC',
    badgeHigh: '#FF4040',
    badgeMed: '#FFE234',
    badgeLow: '#B8F252',
    badgeDone: '#D4D0BC',
    separator: '#1A1A1A',
  },
  dark: {
    bg: '#1A1A1A',
    surface: '#252525',
    card: '#2D2D2D',
    cardYellow: '#C4A800',
    cardGreen: '#6FB800',
    cardPurple: '#6020D0',
    cardBlue: '#0098C0',
    primary: '#FFE234',
    primaryText: '#1A1A1A',
    text: '#F0ECD8',
    textSub: '#A8A490',
    textMuted: '#6B6655',
    border: '#F0ECD8',
    shadow: '#000000',
    navBg: '#252525',
    navActiveBg: '#FFE234',
    statCard1: '#C4A800',
    statCard2: '#6FB800',
    statCard3: '#6020D0',
    progressBg: '#3D3D3D',
    badgeHigh: '#CC2020',
    badgeMed: '#C4A800',
    badgeLow: '#6FB800',
    badgeDone: '#3D3D3D',
    separator: '#3D3D3D',
  },
};

export type Theme = typeof COLORS.light;
