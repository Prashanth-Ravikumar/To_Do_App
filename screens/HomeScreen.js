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
  const [fadeAnims, setFadeAnims] = useState({});

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
    if (!fadeAnims[id]) {
      fadeAnims[id] = new Animated.Value(1);
      setFadeAnims({...fadeAnims});
    }

    Animated.sequence([
      Animated.timing(fadeAnims[id], {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnims[id], {
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
      if (!fadeAnims[id]) {
        fadeAnims[id] = new Animated.Value(1);
        setFadeAnims({...fadeAnims});
      }

      Animated.timing(fadeAnims[id], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(async () => {
        await deleteDoc(doc(db, "todos", id));
        // Remove the animation value after deletion
        delete fadeAnims[id];
        setFadeAnims({...fadeAnims});
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

  const renderTodoItem = ({ item }) => {
    // Ensure each todo has its own fade animation
    if (!fadeAnims[item.id]) {
      fadeAnims[item.id] = new Animated.Value(1);
      setFadeAnims({...fadeAnims});
    }

    return (
      <Animated.View style={[styles.todoItem, { opacity: fadeAnims[item.id] }]}>
        <View style={styles.todoContent}>
        <TouchableOpacity
          style={styles.todoCheckbox}
          onPress={() => toggleTodo(item.id, item.completed)}
        >
          {item.completed && (
            <MaterialCommunityIcons name="check" size={20} color="#6366F1" />
          )}
        </TouchableOpacity>
        <View style={styles.todoTextContainer}>
          <View style={styles.todoTextSection}>
            <View style={styles.todoMainContent}>
              <Text
                style={[styles.todoText, item.completed && styles.completedTodoText]}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text
                  style={[styles.todoDescription, item.completed && styles.completedTodoText]}
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
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color="#4F46E5" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTodo(item.id)}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color="#4F46E5" />
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
  };

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

      <FAB style={styles.addButton} onPress={() => setAddModalVisible(true)} />

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
    backgroundColor: "#FAFBFF",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 24,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#334155",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(99, 102, 241, 0.1)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.08)",
    transform: [{ scale: 1 }],
    backdropFilter: "blur(8px)",
  },
  todoContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  todoTextContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  todoTextSection: {
    flex: 1,
  },
  todoMainContent: {
    marginBottom: 8,
  },
  todoCheckbox: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: "#6366F1",
    borderRadius: 15,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(99, 102, 241, 0.04)',
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  todoText: {
    fontSize: 16,
    color: "#334155",
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  todoDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    letterSpacing: 0.2,
    fontWeight: '400',
  },
  completedTodoText: {
    textDecorationLine: "line-through",
    color: "#666666",
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  signOutButton: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  signOutButtonText: {
    color: "#6366F1",
    fontWeight: '500',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.08)",
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 28,
    color: "#334155",
    letterSpacing: 0.5,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "rgba(99, 102, 241, 0.2)",
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    color: "#334155",
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    marginLeft: 16,
    borderWidth: 0,
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.16)",
  },
  cancelButtonText: {
    color: "#6366F1",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  addButton: {
    backgroundColor: "#6366F1",
    borderWidth: 0,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default HomeScreen;
