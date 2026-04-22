import React from 'react';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  SafeAreaView,
  type Edge,
  type SafeAreaViewProps,
} from 'react-native-safe-area-context';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ReadonlyArray<Edge>;
  safeAreaProps?: Omit<SafeAreaViewProps, 'style'>;
  backgroundColor?: string;
}>;

export default function Screen({
  children,
  style,
  contentStyle,
  edges = ['top'],
  safeAreaProps,
  backgroundColor,
}: Props) {
  return (
    <SafeAreaView
      edges={edges}
      {...safeAreaProps}
      style={[
        styles.safeArea,
        backgroundColor ? { backgroundColor } : null,
        style,
      ]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

