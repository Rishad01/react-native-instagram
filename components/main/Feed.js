import React, { useEffect, useState } from 'react';
import { View, Text, FlatList,Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase'; // Adjust based on your Firebase setup
import { fetchFollowingList } from '../../redux/slices/followingSlice'; // Adjust the import path

const FeedScreen = () => {
  const dispatch = useDispatch(); // Get the dispatch function
  const followingList = useSelector((state) => state.following.followingList); // Fetch followingList from Redux
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUserId = auth.currentUser?.uid; // Get the current user ID

    if (currentUserId) {
      dispatch(fetchFollowingList(currentUserId)); // Dispatch the thunk to fetch the following list
    }
  }, [dispatch]); // Dispatch only once when the component mounts

  useEffect(() => {
    console.log('Following list from Redux:', followingList); // Log Redux state
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        let allPosts = [];

        // Fetch posts for each user in the following list
        for (const userId of followingList) {
          const userPostsRef = collection(db, 'posts', userId, 'userPosts');
          const q = query(userPostsRef, orderBy('creation', 'desc'));
          const querySnapshot = await getDocs(q);

          const userPosts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            creation: doc.data().creation.toDate(),
          }));

          allPosts = [...allPosts, ...userPosts]; // Add each user's posts to the allPosts array
        }

        // Sort posts by 'creation' date in descending order
        allPosts.sort((a, b) => b.creation - a.creation);
        setPosts(allPosts);
      } catch (err) {
        console.error('Error fetching posts: ', err);
        setError('Error fetching posts');
      }

      setLoading(false);
    };

    // Check if the following list is populated
    if (followingList && followingList.length > 0) {
      fetchPosts();
    } else {
      console.log('Following list is empty, no posts to fetch.');
      setLoading(false);
    }
  }, [followingList]); // Depend on followingList

  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      console.error('Invalid date:', date);
      return '';
    }
    
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };
  return (
    <View>
      <Text>Feed Screen</Text>
      {loading && <Text>Loading...</Text>}
      {error && <Text>{error}</Text>}
      {!loading && !error && posts.length > 0 && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ padding: 10 }}>
              <Image
              source={{ uri: item.downloadURL }}
              style={{ width: 100, height: 100 }}
            />
            <Text>{item.caption}</Text>
            <Text>{formatDate(item.creation)}</Text>
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
