import { Platform } from 'react-native';

export const COLORS = {
  // Figma Light Theme Palette
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardHeader: '#F1F5F9',
  border: '#E2E8F0',
  borderHighlight: '#CBD5E1',

  // Status & accent colors
  primary: '#10B981', // Emerald Green (active, safe, connected)
  mint: '#10B981',
  mintBg: '#ECFDF5',

  distress: '#EF4444', // Coral Red (emergency, distress, critical)
  distressBg: '#FEF2F2',

  amber: '#F59E0B', // Warm Amber (warnings, attention)
  amberBg: '#FFFBEB',

  safe: '#10B981',
  safeBg: '#ECFDF5',

  // Text hierarchy
  textPrimary: '#111827',   // Dark Charcoal / Black
  textSecondary: '#4B5563', // Slate Medium Gray
  textMuted: '#9CA3AF',     // Muted Light Slate

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
    backgroundColor: '#FFFFFF',
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
