import { View, TextInput,Button, SafeAreaView,Alert } from "react-native";
import { auth,db } from "../../firebase";
import { doc, setDoc } from 'firebase/firestore';
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/useSlice";
import { createUserWithEmailAndPassword} from '@firebase/auth';
import { useState } from "react";

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
    <SafeAreaView>
        <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
        />

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

        <Button title="Sign Up" onPress={handleSignUp} />
    </SafeAreaView>
);
};

export default Register;
