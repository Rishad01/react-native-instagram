import { View, TextInput, Button,  Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { useState } from "react";
import tw from "twrnc";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "All fields are required!");
      return;
    } else {
      signInWithEmailAndPassword(auth, email, password)
        .then((result) => {
          //console.log(result);
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error("Error Code:", errorCode);
          console.error("Error Message:", errorMessage);
          Alert.alert("Error", errorMessage);
        });
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 justify-center items-center bg-white p-4`}>
      <TextInput
        style={tw`w-full p-2 border border-gray-300 rounded mb-4`}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={tw`w-full p-2 border border-gray-300 rounded mb-4`}
        secureTextEntry={true}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
};

export default Login;
