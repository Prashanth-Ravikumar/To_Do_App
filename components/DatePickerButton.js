import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const DatePickerButton = ({ onPress, dueDate }) => {
  const formatDate = (date) => {
    if (!date) return 'Set Due Date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{formatDate(dueDate)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: '#666',
    fontSize: 12,
  },
});

export default DatePickerButton;
