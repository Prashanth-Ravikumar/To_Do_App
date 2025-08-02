import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const FilterTabs = ({ activeFilter, onFilterChange }) => {
  const filters = ['All', 'Active', 'Completed'];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.tab,
            activeFilter === filter && styles.activeTab,
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <Text
            style={[
              styles.tabText,
              activeFilter === filter && styles.activeTabText,
            ]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#E9F5F4',
  },
  activeTab: {
    backgroundColor: '#2A9D8F',
  },
  tabText: {
    color: '#264653',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
});

export default FilterTabs;
