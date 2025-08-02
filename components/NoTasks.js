import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NoTasks = () => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="checkbox-blank-off-outline" size={64} color="#ccc" />
      <Text style={styles.title}>No Tasks Yet</Text>
      <Text style={styles.subtitle}>Add your first task using the + button below</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NoTasks;
