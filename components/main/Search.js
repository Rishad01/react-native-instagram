import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase'; // Adjust the import based on your Firebase setup
import tw from 'twrnc';
const Search = ({ navigation }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async (search) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("name", ">=", search), where("name", "<=", search + '\uf8ff'));
      const querySnapshot = await getDocs(q);

      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      //console.log(usersList)
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users: ', error);
    }
  };

  return (
    <SafeAreaView style={tw`mt-2`}>
      <TextInput
        placeholder="Search Profile"
        onChangeText={(search)=>fetchUsers(search)}
        style={{ height: 40, borderColor: 'black', borderWidth: 1, marginBottom: 10, paddingLeft: 10 }}
      />
      <FlatList
        style={tw`bg-gray-300 rounded-md`}
        data={users}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {console.log(item);navigation.navigate("Profile", { uid: item.uid })}}>
            <Text style={{ padding: 10 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
};

export default Search;
