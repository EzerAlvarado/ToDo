import * as React from "react";
import { SafeAreaView } from "react-native-web";
import TodoList from "../componentes/TodoList";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { todosData } from "../data/todos";
import Imagen from "../assets/me.png";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hideComplitedReducer, setTodosReducer } from "../redux/todosSlice";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import moment from 'moment';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
  }),
})

export default function Home() {

  const todos = useSelector(state => state.todos.todos);
  const [isHidden, setIsHidden] = React.useState(false);
  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = React.useState('');
  const dispatch = useDispatch();

  React.useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem("@Todos");
        if (todos !== null){
          const todosData = JSON.parse(todos);
          const todosDatafiltered = todosData.filter(todo => {
            return moment(new Date(todo.hour)).isSameOrAfter(moment(), 'day');
          })
          if (todosDatafiltered !== null){
            await AsyncStorage.setItem("@Todos", JSON.stringify(todosDatafiltered));
            console.log('we delete some passed todos')
          }
          dispatch(setTodosReducer(todosDatafiltered));
        }
      } catch (e) {
        console.log(e);
      }
    }
    getTodos();

  },[]);

  const handleHidePress = async () => {
    if (isHidden) {
      setIsHidden(false);
      const todos = await AsyncStorage.getItem("@Todos");
      if (todos !== null){
        dispatch(setTodosReducer(JSON.parse(todos)));
      }
      return;
    }
    setIsHidden(true);
    dispatch(hideComplitedReducer());
  };

  const registerForPushNotificationsAsync = async () => {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
        return;
    }
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
}

  return (
    <View style={styles.container}>
      <Image source={Imagen} style={styles.pic} />
      <Text style={styles.title}>Today</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={handleHidePress}>
          <Text style={{color:'#3478F6'}}>{isHidden ? "Show Completed" : "Hide Completed"}</Text>
        </TouchableOpacity>
      </View>
      <TodoList todosData={todos.filter((todo) => moment(new Date(todo.hour)).isSame(moment(), 'day'))} />
      <Text style={styles.title}>Tomorrow</Text>
      <TodoList todosData={todos.filter((todo) =>  moment(new Date(todo.hour)).isAfter(moment(), 'day'))} />
      <TouchableOpacity onPress={() => navigation.navigate("Add")} style={styles.button}>
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 15,
  },
  pic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 35,
    marginTop: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#000",
    position: "absolute",
    bottom: 50,
    right: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  plus: {
    fontSize: 40,
    color: "#fff",
    position: "absolute",
    top: -6,
    left: 9,
  },
});
