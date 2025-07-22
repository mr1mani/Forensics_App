import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSettings } from '@/contexts/SettingsContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { fontScale } = useSettings();
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Define base sizes
  const baseSizes = {
    default: 16,
    defaultSemiBold: 16,
    title: 32,
    subtitle: 20,
    link: 16,
  };

  // Create scaled styles
  const scaledStyles = StyleSheet.create({
    default: {
      fontSize: baseSizes.default * fontScale,
      lineHeight: 24 * fontScale,
    },
    defaultSemiBold: {
      fontSize: baseSizes.defaultSemiBold * fontScale,
      lineHeight: 24 * fontScale,
      fontWeight: '600',
    },
    title: {
      fontSize: baseSizes.title * fontScale,
      fontWeight: 'bold',
      lineHeight: 32 * fontScale,
    },
    subtitle: {
      fontSize: baseSizes.subtitle * fontScale,
      fontWeight: 'bold',
      lineHeight: 24 * fontScale,
    },
    link: {
      fontSize: baseSizes.link * fontScale,
      lineHeight: 30 * fontScale,
      color: '#0a7ea4',
    },
  });

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type ? scaledStyles[type] : scaledStyles.default,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
