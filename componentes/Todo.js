import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import CheckBox from "./Checkbox";
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTodoReducer } from '../redux/todosSlice';
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Todo({ id, text, isCompleted, isToday, hour }) {
  const [thisTodoIsToday, setThisTodoIsToday] = hour ? React.useState(moment(new Date (hour)).isSame(moment(), 'day')) : React.useState(false);
  const [localHour, setLocalHour] = React.useState(new Date(hour));
  const dispatch = useDispatch();
  const listTodos = useSelector(state => state.todos.todos);  // Usar listTodos en lugar de todos

  const handleDeleteTodo = async () => {
    dispatch(deleteTodoReducer(id));
    try {
      // Usar listTodos en lugar de todos para filtrar el elemento que se eliminará
      await AsyncStorage.setItem('@Todos', JSON.stringify(
        listTodos.filter(todo => todo.id !== id)
      ));
      console.log('Todo deleted correctly');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignContent: 'center' }}>
        <CheckBox
          id={id}
          text={text}
          isCompleted={isCompleted}
          isToday={thisTodoIsToday}
          hour={hour}
        />
        <View>
          <Text
            style={
              isCompleted
                ? [
                    styles.text,
                    { textDecorationLine: "line-through", color: "#73737330" },
                  ]
                : styles.text
            }
          >
            {text}
          </Text>
          <Text
            style={
              isCompleted
                ? [
                    styles.time,
                    { textDecorationLine: "line-through", color: "#73737330" },
                  ]
                : styles.time
            }
          >
            {moment(localHour).format('LT')}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleDeleteTodo}>
        <MaterialIcons name="delete-outline" size={24} color="#73737340" style={styles.delete} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 15,
    fontWeight: "500",
    color: "#737373",
  },
  time: {
    fontSize: 13,
    color: "#a3a3a3",
    fontWeight: "500",
  },
});
