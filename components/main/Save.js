import React, { useState } from "react";
import { View, TextInput, Image, Button } from "react-native";
import { auth, db, storage } from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Save(props) {
  const [caption, setCaption] = useState("");

  const savePostData = async (downloadURL) => {
    try {
      const userId = auth.currentUser.uid;
      const userPostsRef = collection(db, "posts", userId, "userPosts");

      await addDoc(userPostsRef, {
        downloadURL,
        caption,
        creation: serverTimestamp(),
      });

      props.navigation.navigate("MainScreen");
    } catch (error) {
      console.log("Error saving post data: ", error);
    }
  };

  const uploadImage = async () => {
    const uri = props.route.params.image;

    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const userId = auth.currentUser.uid;
      const fileName = `${Math.random().toString(36)}`;
      const storageRef = ref(storage, `post/${userId}/${fileName}`);

      // Start uploading the file
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log(`transferred: ${snapshot.bytesTransferred}`);
        },
        (error) => {
          console.error("Upload failed:", error);
        },
        async () => {
          // Handle successful uploads
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          savePostData(downloadURL);
          console.log("File available at: ", downloadURL);
        }
      );
    } catch (error) {
      console.log("Error uploading image: ", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Image source={{ uri: props.route.params.image }} style={{ width: 300, height: 300 }} />
      <TextInput
        placeholder="Caption"
        onChangeText={(text) => setCaption(text)}
        value={caption}
      />
      <Button title="Save" onPress={uploadImage} />
    </View>
  );
}
