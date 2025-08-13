import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { TopBar, Loading, CustomButton } from "../components";
import { NoProfile } from "../assets";
import { fetchFriendRequests, acceptFriendRequest, fetchUserDetails } from "../utils";
import { useDispatch } from "react-redux";
import { UserLogin } from "../redux/userSlice";

const Notifications = () => {
  const { user } = useSelector((state) => state.user);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Accept/Deny friend request
  const handleFriendRequest = async (rid, status) => {
    console.log("Handling friend request:", { rid, status });
    const result = await acceptFriendRequest(user?.token, rid, status);
    console.log("Friend request result:", result);
    
    // Refresh friend requests
    const fr = await fetchFriendRequests(user?.token);
    setFriendRequests(fr || []);
    
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
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const fr = await fetchFriendRequests(user?.token);
      setFriendRequests(fr || []);
      setLoading(false);
    };
    
    if (user?.token) {
      fetchRequests();
    }
  }, [user?.token]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="w-full min-h-screen bg-bgColor">
      <div className="w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg">
        <TopBar />
        
        <div className="w-full pt-5 px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ascent-1 mb-2">Notifications</h1>
            <p className="text-ascent-2">
              {friendRequests?.length > 0 
                ? `You have ${friendRequests.length} friend ${friendRequests.length === 1 ? 'request' : 'requests'}`
                : "You're all caught up!"
              }
            </p>
          </div>

          {/* Friend Requests Section */}
          <div className="bg-primary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-ascent-1">Friend Requests</h2>
              {friendRequests?.length > 0 && (
                <span className="bg-blue text-white text-sm px-3 py-1 rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {friendRequests?.length > 0 ? (
                friendRequests.map(({ _id, requestFrom: from }) => (
                  <div key={_id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <Link
                      to={`/profile/${from._id}`}
                      className="flex gap-4 items-center cursor-pointer flex-1"
                    >
                      <img
                        src={from?.profileUrl ?? NoProfile}
                        alt={from?.firstName}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-lg font-medium text-ascent-1">
                          {from?.firstName} {from?.lastName}
                        </p>
                        <span className="text-sm text-ascent-2">
                          {from?.profession ?? "No Profession"}
                        </span>
                        <p className="text-sm text-ascent-2 mt-1">
                          Wants to be your friend
                        </p>
                      </div>
                    </Link>

                    <div className="flex gap-2">
                      <CustomButton
                        title="Accept"
                        containerStyles="bg-[#0444a4] text-white px-6 py-2 rounded-lg hover:bg-[#0444a4d0] transition-colors"
                        onClick={() => handleFriendRequest(_id, "Accepted")}
                      />
                      <CustomButton
                        title="Decline"
                        containerStyles="border border-[#666] text-ascent-1 px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
                        onClick={() => handleFriendRequest(_id, "Denied")}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-6xl text-ascent-3 mb-4">🔔</div>
                  <h3 className="text-xl font-medium text-ascent-1 mb-2">
                    No new notifications
                  </h3>
                  <p className="text-ascent-2 text-center max-w-md">
                    You don't have any pending friend requests at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Future: Other notification types can be added here */}
          {/* <div className="bg-primary rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-ascent-1 mb-4">Other Notifications</h2>
            <p className="text-ascent-2">Coming soon...</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
