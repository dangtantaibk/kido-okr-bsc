import { Perspective, perspectiveColors } from '@/data/mock-data';

// Theme helper to get consistent colors for perspectives
export const getThemeColors = (p: Perspective) => {
  const baseBg = perspectiveColors[p];
  // extract color name from 'bg-blue-500' -> 'blue'
  const colorName = baseBg.replace('bg-', '').replace('-500', '');

  return {
    solidBg: `bg-${colorName}-500`,
    lightBg: `bg-${colorName}-50`,
    borderColor: `border-${colorName}-500`,
    textColor: `text-${colorName}-700`,
    subTextColor: `text-${colorName}-600`,
    gradientFrom: `from-${colorName}-50`,
    badgeBg: `bg-${colorName}-100`,
    badgeText: `text-${colorName}-700`,
    progressBg: `bg-${colorName}-500`,
    iconColor: `text-${colorName}-600`,
    hoverBg: `hover:bg-${colorName}-50`,
  };
};
