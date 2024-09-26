import React, { useEffect, useState } from "react";
import { View, Text, Image,Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "../../firebase"; // Import Firebase setup
import { setPosts, clearPosts } from "../../redux/slices/postsSlice";

const Profile = (props) => {
  const dispatch = useDispatch();
  const userPosts = useSelector((state) => state.posts.posts); // Get posts from Redux store
  const currentUserId = auth.currentUser?.uid; // Get current user's ID from Firebase Auth
  console.log(props.route.params.uid);
  const [profileInfo, setProfileInfo] = useState(null); // State to store profile info for the displayed user
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    console.log(props.route.params.uid);
    // Fetch user profile info from Firestore
    const fetchUserProfile = async () => {
      try {
        if (props.route.params.uid === currentUserId) {
          const userProfileDoc = await getDoc(
            doc(db, "users", props.route.params.uid)
          ); // Assuming 'users' collection stores user profiles

          console.log("hello");
          setProfileInfo(userProfileDoc.data()); // Store profile info in state
        } else {
          console.log("other");
          const userProfileDoc = await getDoc(
            doc(db, "users", props.route.params.uid)
          ); // Assuming 'users' collection stores user profiles

          setProfileInfo(userProfileDoc.data()); // Store profile info in state
        }
      } catch (error) {
        console.error("Error fetching user profile: ", error);
      }
    };

    // Fetch user posts
    const fetchUserPosts = async () => {
      try {
        let q;
        if (props.route.params.uid === currentUserId) {
          // Fetch the current user's posts
          q = query(
            collection(db, "posts", currentUserId, "userPosts"), // Access the 'posts' collection
            orderBy("creation", "asc")
          );
        } else {
          // Fetch another user's posts
          q = query(
            collection(db, "posts", props.route.params.uid, "userPosts"), // Access the other user's 'posts' collection
            orderBy("creation", "asc")
          );
        }

        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // If the profile is the current user's, store the posts in Redux
        if (props.route.params.uid === currentUserId) {
          dispatch(setPosts(posts));
        }
      } catch (error) {
        console.error("Error fetching user posts: ", error);
      }
    };

    const unsubscribe = onSnapshot(
      doc(db, "following", currentUserId, "followingList", props.route.params.uid),
      (docSnapshot) => {
        setIsFollowing(docSnapshot.exists());
      },
      (error) => {
        console.error("Error listening to follow status: ", error);
      }
    );

    fetchUserProfile(); // Fetch profile info when component mounts
    fetchUserPosts(); // Fetch user posts when component mounts

    // Cleanup: Clear posts only if it's the current user's profile
    return () => {
      if (props.route.params.uid === currentUserId) {
        dispatch(clearPosts());
      }

       // Cleanup the listener on unmount
       unsubscribe();
    };
  }, [dispatch, props.route.params.uid, currentUserId]);

  // Handle Follow
  const handleFollow = async () => {
    try {
      await setDoc(doc(db, "following", currentUserId, "followingList", props.route.params.uid), {}); // Add the user to following
    } catch (error) {
      console.error("Error following user: ", error);
    }
  };

  // Handle Unfollow
  const handleUnfollow = async () => {
    try {
      await deleteDoc(doc(db, "following", currentUserId, "followingList", props.route.params.uid)); // Remove the user from following
    } catch (error) {
      console.error("Error unfollowing user: ", error);
    }
  };

  return (
    <View>
      {/* Display Profile Info */}
      {profileInfo ? (
        <View>
          <Text>Name: {profileInfo.name}</Text>
          <Text>Email: {profileInfo.email}</Text>
        </View>
      ) : (
        <Text>Loading profile info...</Text>
      )}

      {props.route.params.uid !== currentUserId &&
        (isFollowing ? (
          <Button title="Unfollow" onPress={handleUnfollow} />
        ) : (
          <Button title="Follow" onPress={handleFollow} />
        ))}

      {/* Display Posts */}
      {userPosts.length === 0 ? (
        <Text>No posts to display.</Text>
      ) : (
        userPosts.map((post) => (
          <View key={post.id}>
            <Text>{post.caption}</Text>
            <Image
              source={{ uri: post.downloadURL }}
              style={{ width: 100, height: 100 }}
            />
          </View>
        ))
      )}
    </View>
  );
};

export default Profile;
