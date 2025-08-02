import React, { useState, useEffect } from "react";
import SafeViewAndroid from "../components/SafeViewAndroid";
import DatePickerButton from "../components/DatePickerButton";
import DateTimePickerModal from "../components/DateTimePickerModal";
import FAB from "../components/FAB";
import NoTasks from "../components/NoTasks";
import SearchBar from "../components/SearchBar";
import FilterTabs from "../components/FilterTabs";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";

const HomeScreen = () => {
  const [todoInput, setTodoInput] = useState("");
  const [todoDescription, setTodoDescription] = useState("");
  const [todos, setTodos] = useState([]);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "todos"),
      where("userId", "==", auth.currentUser.uid)
      // orderBy("createdAt", "desc") // Temporarily removed until index is built
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoList = [];
      snapshot.forEach((doc) => {
        todoList.push({ id: doc.id, ...doc.data() });
      });
      // Sort todos by creation date until the Firestore index is ready
      todoList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setTodos(todoList);
    });

    return () => unsubscribe();
  }, []);

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
    switch (activeFilter) {
      case "Active":
        return !todo.completed && matchesSearch;
      case "Completed":
        return todo.completed && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const addTodo = async () => {
    if (todoInput.trim() === "") return;

    try {
      await addDoc(collection(db, "todos"), {
        title: todoInput,
        description: todoDescription.trim(),
        completed: false,
        userId: auth.currentUser.uid,
        createdAt: new Date(),
        dueDate: null,
      });
      setTodoInput("");
      setTodoDescription("");
      setAddModalVisible(false);
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const toggleTodo = async (id, completed) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await updateDoc(doc(db, "todos", id), {
        completed: !completed,
      });
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(async () => {
        await deleteDoc(doc(db, "todos", id));
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const showDatePicker = (todo) => {
    setSelectedTodo(todo);
    setDatePickerVisible(true);
  };

  const handleConfirmDate = async (date) => {
    try {
      await updateDoc(doc(db, "todos", selectedTodo.id), {
        dueDate: date,
      });
      setDatePickerVisible(false);
      setSelectedTodo(null);
    } catch (error) {
      console.error("Error updating due date:", error);
    }
  };

  const handleCancelDate = () => {
    setDatePickerVisible(false);
    setSelectedTodo(null);
  };

  const handleEditTodo = async () => {
    if (todoInput.trim() === "") return;

    try {
      await updateDoc(doc(db, "todos", selectedTodo.id), {
        title: todoInput,
        description: todoDescription.trim(),
      });
      setTodoInput("");
      setTodoDescription("");
      setIsAddModalVisible(false);
      setSelectedTodo(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const openEditModal = (todo) => {
    setSelectedTodo(todo);
    setTodoInput(todo.title);
    setTodoDescription(todo.description || "");
    setIsEditMode(true);
    setAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setAddModalVisible(false);
    setTodoInput("");
    setTodoDescription("");
    setSelectedTodo(null);
    setIsEditMode(false);
  };

  const renderTodoItem = ({ item }) => (
    <Animated.View style={[styles.todoItem, { opacity: fadeAnim }]}>
      <View style={styles.todoContent}>
        <TouchableOpacity
          style={styles.todoCheckbox}
          onPress={() => toggleTodo(item.id, item.completed)}
        >
          {item.completed && (
            <MaterialCommunityIcons name="check" size={20} color="#4285F4" />
          )}
        </TouchableOpacity>
        <View style={styles.todoTextContainer}>
          <View style={styles.todoTextSection}>
            <Text
              style={[styles.todoText, item.completed && styles.completedTodoText]}
            >
              {item.title}
            </Text>
            {item.description ? (
              <Text
                style={[styles.todoDescription, item.completed && styles.completedTodoText]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            ) : null}
          </View>
          <DatePickerButton
            onPress={() => showDatePicker(item)}
            dueDate={item.dueDate ? new Date(item.dueDate.toDate()) : null}
          />
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#4285F4" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTodo(item.id)}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible && selectedTodo?.id === item.id}
        date={item.dueDate ? new Date(item.dueDate.toDate()) : new Date()}
        onConfirm={handleConfirmDate}
        onCancel={handleCancelDate}
      />
    </Animated.View>
  );

  return (
    <View style={[styles.container, SafeViewAndroid.AndroidSafeArea]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Todos</Text>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {filteredTodos.length === 0 ? (
        <NoTasks />
      ) : (
        <FlatList
          data={filteredTodos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          style={styles.todoList}
        />
      )}

      <FAB onPress={() => setAddModalVisible(true)} />

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditMode ? 'Edit Task' : 'Add New Task'}</Text>
            <TextInput
              style={styles.modalInput}
              value={todoInput}
              onChangeText={setTodoInput}
              placeholder="Task title..."
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.descriptionInput]}
              value={todoDescription}
              onChangeText={setTodoDescription}
              placeholder="Description (optional)"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={isEditMode ? handleEditTodo : addTodo}
              >
                <Text style={styles.addButtonText}>{isEditMode ? 'Save' : 'Add Task'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  todoContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  todoTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 8,
  },
  todoTextSection: {
    flex: 1,
    marginRight: 8,
  },
  todoCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#4285F4",
    borderRadius: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  todoText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  todoDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  completedTodoText: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  signOutButton: {
    backgroundColor: "#666",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
  },
  addButton: {
    backgroundColor: "#4285F4",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default HomeScreen;
