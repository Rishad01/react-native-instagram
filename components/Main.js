import { SafeAreaView, Text } from "react-native";
import React from "react";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from "react-redux";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import FeedScreen from "./main/Feed";
import ProfileScreen from "./main/Profile";
import SearchScreen from "./main/Search";
import { auth } from "../firebase";

const Tab = createMaterialBottomTabNavigator();
const EmptyScreen=()=>null;
const Main = () => {
  const user = useSelector((state) => state.user.user);
  
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={26} />
          ),
          tabBarLabel: ""
        }}
      />
      <Tab.Screen name="Search" component={SearchScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={26} />
          ),
          tabBarLabel: ""
        }}
      />
      <Tab.Screen name="MainAdd" component={EmptyScreen} 
        listeners={({navigation})=>({
            tabPress: event => {
                event.preventDefault();
                navigation.navigate("Add")
            }
        })}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus" color={color} size={26} />
          ),
          tabBarLabel: "",
        }}
      />
      <Tab.Screen
          name="Profile"
          listeners={({ navigation }) => ({
            tabPress: (event) => {
              event.preventDefault();
              navigation.navigate("Profile", {
                uid: auth.currentUser.uid
              });
            },
          })}
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-circle"
                color={color}
                size={26}
              />
            ),
          }}
        />
    </Tab.Navigator>
  );
};

export default Main;
