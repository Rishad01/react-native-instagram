import { View, TextInput,Button, SafeAreaView,Alert } from "react-native";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword} from '@firebase/auth';
import { useState } from "react";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (email === '' || password === '') {
            Alert.alert('Error', 'All fields are required!');
            return;
        }
        else {
                signInWithEmailAndPassword(auth,email, password)
                .then((result) => {
                    //console.log(result);
                })
                .catch((error) => { 
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Error Code:", errorCode);
                    console.error("Error Message:", errorMessage);
                    Alert.alert('Error', errorMessage);
                 });
        }
    }

return (
    <SafeAreaView>
        <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
        />

        <TextInput
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
