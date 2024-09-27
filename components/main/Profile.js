import React, { useEffect, useState } from "react";
import {View, Text, Image,Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
import { signOut } from "@react-native-firebase/auth";
import { db, auth } from "../../firebase"; // Import Firebase setup
import { setPosts, clearPosts } from "../../redux/slices/postsSlice";
import { clearUser } from '../../redux/slices/useSlice';
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
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
          creation: doc.creation ? doc.creation.toDate().toISOString() : null,
        }));
        console.log(posts);

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

  const handleLogout = async () => {
    try {
      await signOut(auth);  
      dispatch(clearUser());
      dispatch(clearPosts());
      console.log('User logged out');
    } catch (error) {
      Alert.alert('Logout failed', error.message);
    }
  };

  const handleAddComment = async (postId, userId) => {
    try {
      const commentRef = collection(db, 'posts', userId, 'userPosts', postId, 'comments');
      await addDoc(commentRef, {
        userId: auth.currentUser.uid,
        comment: commentText,
        creationTime: new Date(),
      });
      setCommentText(''); // Clear input after adding comment
      fetchComments(postId, userId); // Fetch updated comments
    } catch (error) {
      console.error('Error adding comment: ', error);
    }
  };

  const fetchComments = async (postId, userId) => {
    try {
      const commentsRef = collection(db, 'posts', userId, 'userPosts', postId, 'comments');
      const q = query(commentsRef, orderBy('creationTime', 'desc'));
      const commentSnapshot = await getDocs(q);
      const fetchedComments = commentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
      setSelectedPostId(postId); // Set selected post for comment view
    } catch (error) {
      console.error('Error fetching comments: ', error);
    }
  };


  return (
    <SafeAreaView style={tw`flex-1 items-center`}>
      {profileInfo ? (
        <View>
          <Text>Name: {profileInfo.name}</Text>
          <Text>Email: {profileInfo.email}</Text>
        </View>
      ) : (
        <Text>Loading profile info...</Text>
      )}

      {props.route.params.uid !== currentUserId ?
        (isFollowing ? (
          <TouchableOpacity
          style={tw`w-full p-2 border border-gray-300 rounded mb-4 bg-blue-500 items-center`}
          onPress={handleUnfollow}>
          <Text style={tw`color-white`}>Unfollow</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
          style={tw`w-full p-2 border border-gray-300 rounded mb-4 bg-blue-500 items-center`}
          onPress={handleFollow}>
          <Text style={tw`color-white`}>Follow</Text>
          </TouchableOpacity>
        )):
        <TouchableOpacity
          style={tw`w-full p-2 border border-gray-300 rounded mb-4 bg-red-500 items-center`}
          onPress={handleLogout}>
          <Text style={tw`color-white`}>Logout</Text>
          </TouchableOpacity>
      }

      <View 
      style={tw`flex-row flex-wrap`}
      >
      {userPosts.length === 0 ? (
        <Text>No posts to display.</Text>
      ) : (
        userPosts.map((post) => (
          <View 
          style={tw`m-0`}
          key={post.id}>
            <Image
              source={{ uri: post.downloadURL }}
              style={{ width: 100, height: 100 }}
            />
          </View>
        ))
      )}
      </View>
    </SafeAreaView>
  );
};

export default Profile;
