import React, { useState, useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TopBar,
  CreatePostModal,
  MobileMenu,
} from "../components";
import { Link } from "react-router-dom";
import { fetchPosts, createPost, handleFileUpload, fetchFriendRequests, fetchSuggestedFriends, acceptFriendRequest, sendFriendRequest, deletePost as deletePostUtil, likePost as likePostUtil, fetchUserDetails } from "../utils";
import { NoProfile } from "../assets";
import { BsFiletypeGif, BsPersonFillAdd } from "react-icons/bs";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { UserCheck } from "lucide-react";
import { UserLogin } from "../redux/userSlice";
import { AddPost } from "../redux/postSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { user, edit } = useSelector((state) => state.user);
  const posts = useSelector((state) => state.posts.posts) || [];
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set()); // Track sent requests
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handlePostSubmit = async (data) => {
    setPosting(true);
    setErrMsg("");
    try {
      let imageUrl = "";
      if (data.file) {
        imageUrl = await handleFileUpload(data.file);
      }
      const res = await createPost(user?.token, { description: data.description, image: imageUrl });
      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        // Add the new post to the Redux store with populated user data
        if (res?.data) {
          dispatch(AddPost(res.data));
        }
        setErrMsg({ status: "success", message: "Post created successfully" });
        setShowCreateModal(false);
      }
    } catch (e) {
      setErrMsg({ status: "failed", message: "Failed to create post" });
    }
    setPosting(false);
  };

  // Post delete handler
  const handleDeletePost = async (id) => {
    await deletePostUtil(id, user?.token);
    await fetchPosts(user?.token, dispatch);
  };

  // Post like handler
  const handleLikePost = async (id) => {
    await likePostUtil({ uri: `/posts/like/${id}`, token: user?.token });
    await fetchPosts(user?.token, dispatch);
  };

  // Accept/Deny friend request
  const handleFriendRequest = async (rid, status) => {
    console.log("Handling friend request:", { rid, status });
    const result = await acceptFriendRequest(user?.token, rid, status);
    console.log("Friend request result:", result);
    
    // Refresh friend requests
    const fr = await fetchFriendRequests(user?.token);
    setFriendRequest(fr || []);
    
    // If accepted, refresh user data to get updated friends list
    if (status === "Accepted" && result?.success) {
      console.log("Refreshing user data after accepting friend request");
      const updatedUser = await fetchUserDetails(user?.token);
      console.log("fetchUserDetails response:", updatedUser);
      if (updatedUser?.status && updatedUser?.user) {
        console.log("Before Redux update - old friends:", user?.friends?.length);
        console.log("Before Redux update - new friends:", updatedUser.user.friends?.length);
        dispatch(UserLogin({ 
          ...user, 
          friends: updatedUser.user.friends 
        }));
        console.log("User friends list updated:", updatedUser.user.friends);
      }
      
      // Also refresh suggested friends
      const sf = await fetchSuggestedFriends(user?.token);
      setSuggestedFriends(sf || []);
    }
  };

  // Add friend from suggestions
  const handleAddFriend = async (id) => {
    try {
      const result = await sendFriendRequest(user?.token, id);
      if (result?.success !== false) {
        // Add to sent requests for immediate UI feedback
        setSentRequests(prev => new Set([...prev, id]));
        
        // Refresh suggestions (the user should disappear from suggestions)
        const sf = await fetchSuggestedFriends(user?.token);
        setSuggestedFriends(sf || []);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Fetch posts, friend requests, and suggestions on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await fetchPosts(user?.token, dispatch);
      const fr = await fetchFriendRequests(user?.token);
      setFriendRequest(fr || []);
      const sf = await fetchSuggestedFriends(user?.token);
      setSuggestedFriends(sf || []);
      setLoading(false);
    };
    if (user?.token) fetchAll();
  }, [user?.token, dispatch]);
  return (
    <div className="w-full h-screen bg-bgColor">
      <div className='w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden'>
        <TopBar 
          friendRequests={friendRequest}
          suggestedFriends={suggestedFriends}
        />

        <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>
          {/* LEFT */}
          <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto'>
            <ProfileCard user={user} friendRequests={friendRequest} />
            {console.log("User friends for FriendsCard:", user?.friends)}
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className='flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg'>
            {/* Create Post Trigger */}
            <div className='bg-primary px-4 py-4 rounded-lg'>
              <div className='w-full flex items-center gap-3'>
                <img
                  src={user?.profileUrl ?? NoProfile}
                  alt='User Image'
                  className='w-12 h-12 rounded-full object-cover'
                />
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='flex-1 bg-secondary text-left px-4 py-3 rounded-full text-ascent-2 hover:bg-[#66666645] transition-colors cursor-pointer border border-transparent hover:border-[#66666690]'
                >
                  What's on your mind, {user?.firstName}?
                </button>
              </div>
              
              <div className='flex items-center justify-center gap-1 pt-4 mt-4 border-t border-[#66666645]'>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='flex-1 flex items-center justify-center gap-2 text-ascent-2 hover:text-ascent-1 px-4 py-2 rounded-lg hover:bg-secondary transition-colors'
                >
                  <BiImages size={20} className="text-green-500" />
                  <span>Photo</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='flex-1 flex items-center justify-center gap-2 text-ascent-2 hover:text-ascent-1 px-4 py-2 rounded-lg hover:bg-secondary transition-colors'
                >
                  <BiSolidVideo size={20} className="text-red-500" />
                  <span>Video</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='flex-1 flex items-center justify-center gap-2 text-ascent-2 hover:text-ascent-1 px-4 py-2 rounded-lg hover:bg-secondary transition-colors'
                >
                  <BsFiletypeGif size={20} className="text-blue-500" />
                  <span>GIF</span>
                </button>
              </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
              user={user}
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={handlePostSubmit}
              posting={posting}
              errMsg={errMsg}
            />

            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  key={post?._id}
                  post={post}
                  user={user}
                  deletePost={() => handleDeletePost(post?._id)}
                  likePost={() => handleLikePost(post?._id)}
                />
              ))
            ) : (
              <div className='flex w-full h-full items-center justify-center'>
                <p className='text-lg text-ascent-2'>No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGJT */}
          <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
            {/* FRIEND REQUEST */}
            <div className='w-full bg-primary shadow-sm rounded-lg px-6 py-5'>
              <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span> Friend Request</span>
                <span>{friendRequest?.length}</span>
              </div>

              <div className='w-full flex flex-col gap-4 pt-4'>
                {friendRequest?.map(({ _id, requestFrom: from }) => (
                  <div key={_id} className='flex items-center justify-between'>
                    <Link
                      to={"/profile/" + from._id}
                      className='w-full flex gap-4 items-center cursor-pointer'
                    >
                      <img
                        src={from?.profileUrl ?? NoProfile}
                        alt={from?.firstName}
                        className='w-10 h-10 object-cover rounded-full'
                      />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-ascent-1'>
                          {from?.firstName} {from?.lastName}
                        </p>
                        <span className='text-sm text-ascent-2'>
                          {from?.profession ?? "No Profession"}
                        </span>
                      </div>
                    </Link>

                    <div className='flex gap-1'>
                      <CustomButton
                        title='Accept'
                        containerStyles='bg-[#0444a4] text-xs text-white px-3 py-1.5 rounded-full'
                        onClick={() => handleFriendRequest(_id, "Accepted")}
                      />
                      <CustomButton
                        title='Deny'
                        containerStyles='border border-[#666] text-xs text-ascent-1 px-3 py-1.5 rounded-full'
                        onClick={() => handleFriendRequest(_id, "Denied")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUGGESTED FRIENDS */}
            <div className='w-full bg-primary shadow-sm rounded-lg px-5 py-5'>
              <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                <span>Friend Suggestion</span>
              </div>
              <div className='w-full flex flex-col gap-4 pt-4'>
                {suggestedFriends?.map((friend) => (
                  <div
                    className='flex items-center justify-between'
                    key={friend._id}
                  >
                    <Link
                      to={"/profile/" + friend?._id}
                      key={friend?._id}
                      className='w-full flex gap-4 items-center cursor-pointer'
                    >
                      <img
                        src={friend?.profileUrl ?? NoProfile}
                        alt={friend?.firstName}
                        className='w-10 h-10 object-cover rounded-full'
                      />
                      <div className='flex-1 '>
                        <p className='text-sm font-medium text-ascent-1'>
                          {friend?.firstName} {friend?.lastName}
                        </p>
                        <span className='text-sm text-ascent-2'>
                          {friend?.profession ?? "No Profession"}
                        </span>
                      </div>
                    </Link>

                    <div className='flex gap-1'>
                      {sentRequests.has(friend._id) ? (
                        <button
                          className='bg-green-100 text-sm text-green-600 p-1 rounded cursor-default'
                          disabled
                        >
                          <UserCheck size={20} />
                        </button>
                      ) : (
                        <button
                          className='bg-[#0444a430] text-sm text-white p-1 rounded cursor-pointer hover:bg-[#0444a450] transition-colors'
                          onClick={() => handleAddFriend(friend._id)}
                        >
                          <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {edit && <EditProfile />}
    </div>
  );
};

export default Home;
