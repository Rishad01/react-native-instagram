import { Button, SafeAreaView, StyleSheet, TouchableOpacity,Text } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import tw from "twrnc";
export default function Landing() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={tw`flex-1 items-center justify-center bg-white`}>
      <TouchableOpacity
        style={tw`bg-blue-500 py-3 px-6 rounded m-2`} // Tailwind styles applied here
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={tw`text-white text-lg`}>Register</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={tw`bg-blue-500 py-3 px-6 rounded m-2`} // Tailwind styles applied here
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={tw`text-white text-lg`}>Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center", // Center the buttons horizontally
    },
    text: {
      marginVertical: 20, // Add margin between the Text and buttons
    },
  });