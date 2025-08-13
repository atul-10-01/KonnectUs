import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LiaEditSolid } from "react-icons/lia";
import {
  BsBriefcase,
  BsFacebook,
  BsInstagram,
  BsPersonFillAdd,
  BsPersonCheckFill,
} from "react-icons/bs";
import { FaTwitterSquare } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { UserCheck } from "lucide-react";
import moment from "moment";

import { NoProfile } from "../assets";
import { UpdateProfile, UserLogin } from "../redux/userSlice";
import { sendFriendRequest, unfriendUser, fetchUserDetails } from "../utils";
import { UnfriendModal } from "./";

const ProfileCard = ({ user, friendRequests = [] }) => {
  const { user: data, edit } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [unfriendLoading, setUnfriendLoading] = useState(false);

  // Calculate friendship status directly from Redux state - no local state needed
  const getFriendshipStatus = () => {
    if (!user?._id || !data?._id) return "none";
    
    if (user._id === data._id) {
      return "self";
    }
    
    // Check if they are already friends in current Redux state
    const areFriends = data?.friends?.some(friend => 
      (typeof friend === 'string' ? friend : friend._id) === user._id
    );
    
    if (areFriends) {
      return "friends";
    }

    // Check if there's an incoming friend request from this user
    const hasIncomingRequest = friendRequests?.some(request => 
      request?.requestFrom?._id === user._id || request?.requestFrom === user._id
    );

    if (hasIncomingRequest) {
      return "incoming";
    }

    return "none";
  };

  const friendshipStatus = getFriendshipStatus();

  const handleAddFriend = async () => {
    if (loading || friendshipStatus !== "none") return;
    
    setLoading(true);
    try {
      const result = await sendFriendRequest(data?.token, user._id);
      if (result?.success !== false) {
        // Don't set local state - let Redux handle it
        // The component will re-render when Redux state updates
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
    setLoading(false);
  };

  const handleUnfriend = async () => {
    setUnfriendLoading(true);
    try {
      const result = await unfriendUser(data?.token, user._id);
      if (result?.success) {
        // Refresh user data to get updated friends list
        const updatedUser = await fetchUserDetails(data?.token);
        if (updatedUser?.status && updatedUser?.user) {
          dispatch(UserLogin({ 
            ...data, 
            friends: updatedUser.user.friends 
          }));
        }
        setShowUnfriendModal(false);
      }
    } catch (error) {
      console.error("Error unfriending user:", error);
    }
    setUnfriendLoading(false);
  };

  const renderFriendButton = () => {
    if (user?._id === data?._id || friendshipStatus === "self") {
      return (
        <LiaEditSolid
          size={22}
          className='text-blue cursor-pointer'
          onClick={() => dispatch(UpdateProfile(true))}
        />
      );
    }

    switch (friendshipStatus) {
      case "friends":
        return (
          <button
            className='bg-green-100 text-green-600 p-2 rounded-full cursor-pointer hover:bg-green-200 transition-colors'
            onClick={() => setShowUnfriendModal(true)}
            title="Click to unfriend"
          >
            <BsPersonCheckFill size={16} />
          </button>
        );
      
      case "sent":
        return (
          <button
            className='bg-blue-100 text-blue-600 p-2 rounded-full cursor-default'
            disabled
            title="Friend request sent"
          >
            <UserCheck size={16} />
          </button>
        );

      case "incoming":
        return (
          <div className='flex flex-col items-center gap-1'>
            <button
              className='bg-orange-100 text-orange-600 p-2 rounded-full cursor-pointer hover:bg-orange-200 transition-colors'
              onClick={() => {
                // Navigate to home page to see friend requests
                window.location.href = '/';
              }}
              title="This user sent you a friend request! Click to respond"
            >
              <UserCheck size={16} />
            </button>
            <span className='text-xs text-orange-600 font-medium'>Respond</span>
          </div>
        );
      
      case "none":
      default:
        return (
          <button
            className={`bg-[#0444a430] text-white p-2 rounded-full transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0444a450] cursor-pointer'
            }`}
            onClick={handleAddFriend}
            disabled={loading}
            title="Add friend"
          >
            <BsPersonFillAdd size={16} className='text-[#0f52b6]' />
          </button>
        );
    }
  };

  return (
    <div key={`${user?._id}-${data?.friends?.length || 0}`}>
      <div className='w-full bg-primary flex flex-col items-center shadow-sm rounded-xl px-6 py-4 '>
        <div className='w-full flex items-center justify-between border-b pb-5 border-[#66666645]'>
          <Link to={"/profile/" + user?._id} className='flex gap-2'>
            <img
              src={user?.profileUrl ?? NoProfile}
              alt={user?.email}
              className='w-14 h-14 object-cover rounded-full'
            />

            <div className='flex flex-col justify-center'>
              <p className='text-lg font-medium text-ascent-1'>
                {user?.firstName} {user?.lastName}
              </p>
              <span className='text-ascent-2'>
                {user?.profession ?? "No Profession"}
              </span>
            </div>
          </Link>

          <div className=''>
            {renderFriendButton()}
          </div>
        </div>

        <div className='w-full flex flex-col gap-2 py-4 border-b border-[#66666645]'>
          <p className='text-xl text-ascent-1 font-semibold'>
            {/* Always show the user's own friend count, not the logged-in user's */}
            {user?.friends?.length || 0} Friends
          </p>

          <div className='flex items-center justify-between'>
            <span className='text-ascent-2'>Who viewed your profile</span>
            <span className='text-ascent-1 text-lg'>{user?.views?.length || 0}</span>
          </div>

          <span className='text-base text-blue'>
            {user?.verified ? "Verified Account" : "Not Verified"}
          </span>

          <div className='flex items-center justify-between'>
            <span className='text-ascent-2'>Joined</span>
            <span className='text-ascent-1 text-base'>
              {moment(user?.createdAt).fromNow()}
            </span>
          </div>
        </div>

        <div className='w-full flex flex-col gap-4 py-4 pb-6'>
          <p className='text-ascent-1 text-lg font-semibold'>Social Profile</p>

          <div className='flex gap-2 items-center text-ascent-2'>
            <BsInstagram className=' text-xl text-ascent-1' />
            <span>Instagram</span>
          </div>
          <div className='flex gap-2 items-center text-ascent-2'>
            <FaTwitterSquare className=' text-xl text-ascent-1' />
            <span>Twitter</span>
          </div>
          <div className='flex gap-2 items-center text-ascent-2'>
            <BsFacebook className=' text-xl text-ascent-1' />
            <span>Facebook</span>
          </div>
        </div>
      </div>

      {/* Unfriend Modal */}
      <UnfriendModal
        isOpen={showUnfriendModal}
        onClose={() => setShowUnfriendModal(false)}
        user={user}
        onConfirm={handleUnfriend}
        loading={unfriendLoading}
      />
    </div>
  );
};

export default ProfileCard;
