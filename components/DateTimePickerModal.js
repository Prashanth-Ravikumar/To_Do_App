import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateTimePickerModal = ({ isVisible, onConfirm, onCancel, date }) => {
  const [selectedDate, setSelectedDate] = useState(date || new Date());

  const onChange = (event, selected) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set') {
        setSelectedDate(selected);
        onConfirm(selected);
      } else {
        onCancel();
      }
    } else {
      setSelectedDate(selected);
    }
  };

  if (Platform.OS === 'android') {
    return isVisible ? (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={onChange}
      />
    ) : null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(event, selected) => onChange(event, selected)}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonConfirm]}
              onPress={() => onConfirm(selectedDate)}
            >
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 8,
    padding: 10,
    width: '45%',
  },
  buttonCancel: {
    backgroundColor: '#ff4444',
  },
  buttonConfirm: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DateTimePickerModal;
