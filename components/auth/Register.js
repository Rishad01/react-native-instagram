import { View, TextInput,Button,Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth,db } from "../../firebase";
import { doc, setDoc } from 'firebase/firestore';
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/useSlice";
import { createUserWithEmailAndPassword} from '@firebase/auth';
import { useState } from "react";
import tw from "twrnc";

const Register = () => {
    const dispatch=useDispatch();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async() => {
        if (name === '' || email === '' || password === '') {
            Alert.alert('Error', 'All fields are required!');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            //console.log(user);
            // Save user info to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name: name,
                email: email,
                uid: user.uid,
                createdAt: new Date(),
            });

            // Dispatch user data to Redux store
            dispatch(setUser({
                name: name,
                email: email,
                uid: user.uid,
            }));

            Alert.alert('Success', 'User registered successfully!');
        } 
         catch(error){ 
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error("Error Code:", errorCode);
                    console.error("Error Message:", errorMessage);
                    Alert.alert('Error', errorMessage);
                 }
                }
        

return (
    <SafeAreaView style={tw`flex-1 justify-center items-center bg-white p-4`}>
        <TextInput
            style={tw`w-full p-2 border border-gray-300 rounded mb-4`}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
        />

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

        <Button title="Sign Up" onPress={handleSignUp} />
    </SafeAreaView>
);
};

export default Register;
