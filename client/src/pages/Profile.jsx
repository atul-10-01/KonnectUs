import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
} from "../components";
import { fetchPosts, getUserInfo, deletePost as deletePostUtil, likePost as likePostUtil, fetchFriendRequests } from "../utils";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const posts = useSelector((state) => state.posts.posts) || [];
  const [userInfo, setUserInfo] = useState(user);
  const [loading, setLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const info = await getUserInfo(user?.token, id);
      setUserInfo(info || user);
      await fetchPosts(user?.token, dispatch, "/posts/user", { userId: id });
      
      // Fetch friend requests to check for incoming requests
      const fr = await fetchFriendRequests(user?.token);
      setFriendRequests(fr || []);
      
      setLoading(false);
    };
    if (user?.token) fetchProfile();
    // eslint-disable-next-line
  }, [id, user?.token, dispatch]);

  const handleDelete = async (postId) => {
    setLoading(true);
    await deletePostUtil(postId, user?.token);
    await fetchPosts(user?.token, dispatch, "/posts/user", { userId: id });
    setLoading(false);
  };

  const handleLikePost = async (postId) => {
    await likePostUtil({ uri: `/posts/like/${postId}`, token: user?.token });
    await fetchPosts(user?.token, dispatch, "/posts/user", { userId: id });
  };

  return (
    <>
      <div className='home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <TopBar />
        <div className='w-full flex gap-2 lg:gap-4 md:pl-4 pt-5 pb-10 h-full'>
          {/* LEFT */}
          <div className='hidden w-1/3 lg:w-1/4 md:flex flex-col gap-6 overflow-y-auto'>
            <ProfileCard user={userInfo} friendRequests={friendRequests} />

            <div className='block lg:hidden'>
              <FriendsCard friends={userInfo?.friends} />
            </div>
          </div>

          {/* CENTER */}
          <div className=' flex-1 h-full bg-orimary px-4 flex flex-col gap-6 overflow-y-auto'>
            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  post={post}
                  key={post?._id}
                  user={user}
                  deletePost={() => handleDelete(post?._id)}
                  likePost={() => handleLikePost(post?._id)}
                />
              ))
            ) : (
              <div className='flex w-full h-full items-center justify-center'>
                <p className='text-lg text-ascent-2'>No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
            <FriendsCard friends={userInfo?.friends} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
