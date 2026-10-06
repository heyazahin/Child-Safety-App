import { Platform } from 'react-native';

export const COLORS = {
  // Deep teal and warm cream palette
  background: '#F8FAF7',
  card: '#FFFFFF',
  cardHeader: '#F0F4EF',
  border: '#DDE7E2',
  borderHighlight: '#C6D5CF',

  // Status & accent colors
  primary: '#0F766E',
  secondary: '#14B8A6',
  mint: '#0F766E',
  mintBg: '#E6F4F1',

  distress: '#EF4444', // Coral Red (emergency, distress, critical)
  distressBg: '#FEF2F2',

  amber: '#F59E0B', // Warm Amber (warnings, attention)
  amberBg: '#FFFBEB',

  safe: '#0F766E',
  safeBg: '#E6F4F1',

  // Text hierarchy
  textPrimary: '#17211F',
  textSecondary: '#51615D',
  textMuted: '#73817D',

  // Monospace & System fonts
  fontMono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const GLOBAL_STYLES = {
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  button: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonOutlined: {
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonOutlinedText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  monoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  }
};
