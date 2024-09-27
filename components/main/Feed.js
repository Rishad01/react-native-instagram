import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, Button, TextInput,TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../../firebase"; // Adjust based on your Firebase setup
import { fetchFollowingList } from "../../redux/slices/followingSlice"; // Adjust the import path
import tw from "twrnc";

const FeedScreen = () => {
  const dispatch = useDispatch(); // Get the dispatch function
  const followingList = useSelector((state) => state.following.followingList); // Fetch followingList from Redux
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null); // Track selected post for viewing comments
  const [commentText, setCommentText] = useState(""); // State for new comment input
  const [comments, setComments] = useState([]);
  const [likeTrigger, setLikeTrigger] = useState(false);

  useEffect(() => {
    const currentUserId = auth.currentUser?.uid; // Get the current user ID

    if (currentUserId) {
      dispatch(fetchFollowingList(currentUserId)); // Dispatch the thunk to fetch the following list
    }
  }, [dispatch]); // Dispatch only once when the component mounts

  useEffect(() => {
    console.log("Following list from Redux:", followingList); // Log Redux state
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        let allPosts = [];

        // Fetch posts for each user in the following list
        for (const userId of followingList) {
          const userPostsRef = collection(db, "posts", userId, "userPosts");
          const q = query(userPostsRef, orderBy("creation", "desc"));
          const querySnapshot = await getDocs(q);

          const userPosts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            userId: userId,
            ...doc.data(),
            creation: doc.data().creation.toDate(),
          }));

          allPosts = [...allPosts, ...userPosts]; // Add each user's posts to the allPosts array
        }

        // Sort posts by 'creation' date in descending order
        allPosts.sort((a, b) => b.creation - a.creation);
        setPosts(allPosts);
      } catch (err) {
        console.error("Error fetching posts: ", err);
        setError("Error fetching posts");
      }

      setLoading(false);
    };

    // Check if the following list is populated
    if (followingList && followingList.length > 0) {
      fetchPosts();
    } else {
      console.log("Following list is empty, no posts to fetch.");
      setLoading(false);
    }
  }, [followingList,likeTrigger]); // Depend on followingList

  const handleAddComment = async (postId, userId) => {
    try {
      const commentRef = collection(
        db,
        "posts",
        userId,
        "userPosts",
        postId,
        "comments"
      );
      await addDoc(commentRef, {
        userId: auth.currentUser.uid,
        comment: commentText,
        creationTime: new Date(),
      });
      setCommentText(""); // Clear input after adding comment
      fetchComments(postId, userId); // Fetch updated comments
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const fetchComments = async (postId, userId) => {
    try {
      console.log(posts);
      console.log(postId);
      console.log(userId);
      const commentsRef = collection(
        db,
        "posts",
        userId,
        "userPosts",
        postId,
        "comments"
      );
      const q = query(commentsRef, orderBy("creationTime", "desc"));
      const commentSnapshot = await getDocs(q);
      const fetchedComments = commentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(fetchedComments);
      setSelectedPostId(postId); // Set selected post for comment view
    } catch (error) {
      console.error("Error fetching comments: ", error);
    }
  };

  const handleLike = async (postId, userId) => {
    const currentUserId = auth.currentUser.uid;
    const postDocRef = doc(db, 'posts', userId, 'userPosts', postId);
  
    try {
      // Fetch the post document to get the current likes array
      console.log("hello");
      const postSnapshot = await getDoc(postDocRef);
  
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        const likesArray = postData.likes || [];
  
        if (likesArray.includes(currentUserId)) {
          // If the current user has already liked the post, remove their ID from the array
          await updateDoc(postDocRef, {
            likes: arrayRemove(currentUserId),
          });
        } else {
          // If the current user has not liked the post, add their ID to the array
          await updateDoc(postDocRef, {
            likes: arrayUnion(currentUserId),
          });
        }
        setLikeTrigger((prev) => !prev);
      } else {
        console.log('Post does not exist');
      }
    } catch (error) {
      console.error('Error liking/unliking post: ', error);
    }
  };


  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      console.error("Invalid date:", date);
      return "";
    }

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };
  return (
    <View style={tw`flex-1 justify-center bg-white`}>
      <Text>Feed Screen</Text>
      {loading && <Text>Loading...</Text>}
      {error && <Text>{error}</Text>}
      {!loading && !error && posts.length > 0 && (
        <FlatList 
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={tw`bg-gray-200 m-1 p-4 rounded-sm`}>
              <Image
                source={{ uri: item.downloadURL }}
                style={tw`w-full h-64`}
              />
              <Text>{item.caption}</Text>
              <Text>{formatDate(item.creation)}</Text>
              <Text>{item.likes?.length || 0} {item.likes?.length === 1 ? 'Like' : 'Likes'}</Text>
              <TouchableOpacity
                style={tw`bg-blue-400 py-3 px-6 rounded m-2 justify-center items-center`}
                onPress={() => handleLike(item.id, item.userId)}
              >
              <Text style={tw`text-white`}>{item.likes?.includes(auth.currentUser.uid) ? 'Unlike' : 'Like'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
              style={tw`bg-blue-400 py-3 px-6 rounded m-2 justify-center items-center`}
              onPress={() => fetchComments(item.id, item.userId)}>
                <Text style={tw`text-white`}>View Comments</Text>
              </TouchableOpacity>
              {/* Add comment section */}
              {selectedPostId === item.id && (
                <View
                style={tw`bg-white p-2 rounded-2`}
                >
                  <Text>Comments:</Text>
                  <FlatList
                    data={comments}
                    keyExtractor={(comment) => comment.id}
                    renderItem={({ item: comment }) => (
                      <Text>{comment.comment}</Text>
                    )}
                  />
                  <TextInput
                    placeholder="Add a comment..."
                    value={commentText}
                    onChangeText={(text) => setCommentText(text)}
                  />
                  <Button
                    title="Post Comment"
                    onPress={() => handleAddComment(item.id, item.userId)}
                  />
                </View>
              )}
            </View>
          )}
        />
      )}
      {!loading && !error && posts.length === 0 && (
        <Text>You are not following anyone or there are no posts.</Text>
      )}
    </View>
  );
};

export default FeedScreen;
