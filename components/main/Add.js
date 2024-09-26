import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { Camera, CameraType } from "expo-camera/legacy";
import * as ImagePicker from "expo-image-picker";

export default function Add({ navigation }) {
  const [hasCameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
  const [hasGalleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [image, setImage] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const cameraRef = useRef(null); // Use ref for camera

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await requestCameraPermission();
      if (cameraStatus !== "granted") {
        alert("Permission to access camera is required!");
      }

      const { status: galleryStatus } = await requestGalleryPermission();
      if (galleryStatus !== "granted") {
        alert("Permission to access gallery is required!");
      }
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync();
      //console.log(data.uri);
      setImage(data.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri); // Use `assets[0].uri` for latest API
    }
  };

  if (!hasCameraPermission || !hasGalleryPermission) {
    return <View><Text>Requesting permissions...</Text></View>;
  }

  if (!hasCameraPermission.granted || !hasGalleryPermission.granted) {
    return <Text>No access to camera or gallery</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Camera
          style={styles.camera}
          type={type}
          ratio={"4:3"}
          ref={cameraRef} // Use ref instead of state for camera
        />
      </View>
      <Button
        title="Flip Camera"
        onPress={() => {
          setType(
            type === CameraType.back ? CameraType.front : CameraType.back
          );
        }}
      />
      <Button title="Take Picture" onPress={takePicture} />
      <Button title="Pick Image from Gallery" onPress={pickImage} />
      <Button
        title="Save"
        onPress={() => navigation.navigate("Save", { image })}
      />
      {image && <Image source={{ uri: image }} style={{ flex: 1 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  camera: {
    flex: 1,
    aspectRatio: 0.8,
  },
});
