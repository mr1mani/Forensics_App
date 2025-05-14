// In @/components/Collapsible.tsx or wherever your Collapsible is defined
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { MaterialIcons } from '@expo/vector-icons';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  initialCollapsed?: boolean; // Added the missing prop with optional flag
}

export function Collapsible({ title, children, initialCollapsed = true }: CollapsibleProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={() => setIsCollapsed(!isCollapsed)} style={styles.header}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <MaterialIcons name={isCollapsed ? "expand-more" : "expand-less"} size={24} />
      </TouchableOpacity>
      
      {!isCollapsed && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  }
});