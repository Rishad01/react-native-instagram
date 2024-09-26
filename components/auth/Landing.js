import { Button, SafeAreaView, StyleSheet, View } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

export default function Landing() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Button
        title="Register"
        onPress={() => {
          navigation.navigate("Register");
        }}
      />
      
      <Button
        title="Login"
        onPress={() => {
          navigation.navigate("Login");
        }}
      />
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