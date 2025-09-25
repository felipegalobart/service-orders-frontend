/**
 * 🎨 Mitsuwa Design System - Color Configuration
 * 
 * Este arquivo define todas as cores e variantes do sistema de design da Mitsuwa.
 * Use estas constantes para manter consistência em todo o projeto.
 */

// 🎯 Cores Primárias
export const MITSUWA_COLORS = {
  // Vermelho (Cor principal da marca)
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',  // Links hover
    400: '#F87171',  // Links
    500: '#EF4444',
    600: '#DC2626',  // Principal
    700: '#B91C1C',  // Hover
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Cinza (Elementos secundários)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',  // Texto secundário
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',  // Bordas
    700: '#374151',  // Botões
    800: '#1F2937',  // Cards
    900: '#111827',  // Background secundário
  },
  
  // Preto e Branco
  black: '#000000',  // Background principal
  white: '#FFFFFF',  // Texto principal
} as const;

// 🎯 Cores de Estado
export const STATE_COLORS = {
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',  // Principal
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',  // Principal
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',  // Principal
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',  // Principal
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const;

// 🎯 Paletas de Uso Específico
export const PALETTES = {
  // Página de Login
  login: {
    background: 'bg-gradient-to-br from-black via-gray-900 to-black',
    card: 'bg-gray-800 border-gray-600 shadow-2xl',
    cardHeader: 'border-b border-gray-600',
    title: 'text-white',
    subtitle: 'text-gray-300',
    button: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:border-gray-500',
    link: 'text-red-400 hover:text-red-300',
  },
  
  // Header
  header: {
    background: 'bg-white shadow-sm border-b border-gray-200',
    logo: 'h-20 w-20 sm:h-24 sm:w-24 object-contain',
    title: 'text-xl font-bold text-gray-900',
    nav: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    navActive: 'bg-blue-100 text-blue-700',
  },
  
  // Cards
  card: {
    default: 'bg-white border-gray-200 shadow-sm',
    dark: 'bg-gray-800 border-gray-600 shadow-2xl',
    header: 'border-b border-gray-200',
    headerDark: 'border-b border-gray-600',
  },
  
  // Botões
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    mitsuwa: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:border-gray-500',
  },
  
  // Inputs
  input: {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    dark: 'bg-gray-700 border-gray-600 text-white focus:border-gray-500 focus:ring-gray-500',
  },
  
  // Alertas
  alert: {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    successDark: 'bg-green-900/20 border-green-700/50 text-green-300',
    warningDark: 'bg-yellow-900/20 border-yellow-700/50 text-yellow-300',
    errorDark: 'bg-red-900/30 border-red-700/50 text-red-300',
    infoDark: 'bg-blue-900/20 border-blue-700/50 text-blue-300',
  },
} as const;

// 🎯 Gradientes
export const GRADIENTS = {
  primary: 'bg-gradient-to-br from-black via-gray-900 to-black',
  secondary: 'bg-gradient-to-r from-gray-800 to-gray-700',
  subtle: 'bg-gradient-to-b from-gray-50 to-gray-100',
  accent: 'bg-gradient-to-r from-red-600 to-red-700',
} as const;

// 🎯 Sombras
export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  red: 'hover:shadow-red-500/25',
  gray: 'hover:shadow-gray-500/25',
  blue: 'hover:shadow-blue-500/25',
} as const;

// 🎯 Bordas
export const BORDERS = {
  default: 'border-gray-200',
  dark: 'border-gray-600',
  light: 'border-gray-300',
  red: 'border-red-600',
  green: 'border-green-600',
  yellow: 'border-yellow-600',
  blue: 'border-blue-600',
} as const;

// 🎯 Transições
export const TRANSITIONS = {
  fast: 'transition-all duration-150',
  normal: 'transition-all duration-300',
  slow: 'transition-all duration-500',
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
} as const;

// 🎯 Espaçamentos
export const SPACING = {
  xs: 'p-1',      // 4px
  sm: 'p-2',      // 8px
  md: 'p-4',      // 16px
  lg: 'p-6',      // 24px
  xl: 'p-8',      // 32px
  '2xl': 'p-12',  // 48px
} as const;

// 🎯 Tipografia
export const TYPOGRAPHY = {
  sizes: {
    xs: 'text-xs',     // 12px
    sm: 'text-sm',     // 14px
    base: 'text-base', // 16px
    lg: 'text-lg',     // 18px
    xl: 'text-xl',     // 20px
    '2xl': 'text-2xl', // 24px
    '3xl': 'text-3xl', // 30px
  },
  weights: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  },
  colors: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-red-400',
    accentHover: 'text-red-300',
  },
} as const;

// 🎯 Utilitários de Classe
export const CLASS_UTILITIES = {
  // Botão Mitsuwa completo
  buttonMitsuwa: [
    'bg-gray-700',
    'hover:bg-gray-600',
    'text-white',
    'border-gray-600',
    'hover:border-gray-500',
    'shadow-lg',
    'hover:shadow-gray-500/25',
    'transition-all',
    'duration-300',
    'focus:ring-gray-500',
    'focus:ring-2',
    'focus:ring-offset-2',
    'active:bg-gray-800',
    'active:border-gray-700',
    'active:scale-95',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
  ].join(' '),
  
  // Card Mitsuwa completo
  cardMitsuwa: [
    'bg-gray-800',
    'border-gray-600',
    'shadow-2xl',
    'rounded-lg',
  ].join(' '),
  
  // Input Mitsuwa completo
  inputMitsuwa: [
    'bg-gray-700',
    'border-gray-600',
    'text-white',
    'focus:border-gray-500',
    'focus:ring-gray-500',
    'hover:border-gray-500',
    'transition-all',
    'duration-300',
  ].join(' '),
  
  // Link Mitsuwa completo
  linkMitsuwa: [
    'text-red-400',
    'hover:text-red-300',
    'transition-colors',
    'duration-200',
  ].join(' '),
} as const;

// 🎯 Tipos TypeScript
export type MitsuwaColor = keyof typeof MITSUWA_COLORS;
export type StateColor = keyof typeof STATE_COLORS;
export type PaletteKey = keyof typeof PALETTES;
export type GradientKey = keyof typeof GRADIENTS;
export type ShadowKey = keyof typeof SHADOWS;
export type BorderKey = keyof typeof BORDERS;
export type TransitionKey = keyof typeof TRANSITIONS;
export type SpacingKey = keyof typeof SPACING;
export type TypographySize = keyof typeof TYPOGRAPHY.sizes;
export type TypographyWeight = keyof typeof TYPOGRAPHY.weights;
export type TypographyColor = keyof typeof TYPOGRAPHY.colors;

// 🎯 Funções Utilitárias
export const getColor = (color: MitsuwaColor, shade: keyof typeof MITSUWA_COLORS.red = 600) => {
  return MITSUWA_COLORS[color][shade];
};

export const getStateColor = (state: StateColor, shade: keyof typeof STATE_COLORS.success = 600) => {
  return STATE_COLORS[state][shade];
};

export const getPalette = (palette: PaletteKey) => {
  return PALETTES[palette];
};

export const getGradient = (gradient: GradientKey) => {
  return GRADIENTS[gradient];
};

export const getShadow = (shadow: ShadowKey) => {
  return SHADOWS[shadow];
};

export const getBorder = (border: BorderKey) => {
  return BORDERS[border];
};

export const getTransition = (transition: TransitionKey) => {
  return TRANSITIONS[transition];
};

export const getSpacing = (spacing: SpacingKey) => {
  return SPACING[spacing];
};

export const getTypography = (size: TypographySize, weight: TypographyWeight = 'medium', color: TypographyColor = 'primary') => {
  return `${TYPOGRAPHY.sizes[size]} ${TYPOGRAPHY.weights[weight]} ${TYPOGRAPHY.colors[color]}`;
};

// 🎯 Exemplo de uso:
/*
import { PALETTES, CLASS_UTILITIES, getColor } from '@/config/colors';

// Usar paleta específica
const loginClasses = PALETTES.login.background;

// Usar classe utilitária
const buttonClasses = CLASS_UTILITIES.buttonMitsuwa;

// Usar função de cor
const redColor = getColor('red', 600); // '#DC2626'
*/
