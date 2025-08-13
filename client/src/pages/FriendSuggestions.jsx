import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { TopBar, Loading, CustomButton } from "../components";
import { NoProfile } from "../assets";
import { fetchSuggestedFriends, sendFriendRequest } from "../utils";
import { BsPersonFillAdd } from "react-icons/bs";
import { UserCheck } from "lucide-react";

const FriendSuggestions = () => {
  const { user } = useSelector((state) => state.user);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      const sf = await fetchSuggestedFriends(user?.token);
      setSuggestedFriends(sf || []);
      setLoading(false);
    };
    
    if (user?.token) {
      fetchSuggestions();
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
            <h1 className="text-2xl font-bold text-ascent-1 mb-2">People You May Know</h1>
            <p className="text-ascent-2">
              Discover and connect with new people
            </p>
          </div>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {suggestedFriends?.length > 0 ? (
              suggestedFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="bg-primary rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <Link to={`/profile/${friend._id}`}>
                      <img
                        src={friend?.profileUrl ?? NoProfile}
                        alt={friend?.firstName}
                        className="w-20 h-20 rounded-full object-cover mb-3 hover:opacity-90 transition-opacity"
                      />
                    </Link>
                    <Link to={`/profile/${friend._id}`}>
                      <h3 className="text-lg font-medium text-ascent-1 hover:text-blue transition-colors">
                        {friend?.firstName} {friend?.lastName}
                      </h3>
                    </Link>
                    <p className="text-sm text-ascent-2 mt-1 mb-3">
                      {friend?.profession ?? "No Profession"}
                    </p>
                    {friend?.location && (
                      <p className="text-xs text-ascent-2 mb-3">
                        {friend.location}
                      </p>
                    )}
                    
                    {/* Add Friend Button */}
                    <div className="w-full">
                      {sentRequests.has(friend._id) ? (
                        <button
                          className="w-full bg-green-100 text-green-600 py-2 px-4 rounded-lg cursor-default flex items-center justify-center gap-2"
                          disabled
                        >
                          <UserCheck size={16} />
                          <span className="text-sm">Request Sent</span>
                        </button>
                      ) : (
                        <button
                          className="w-full bg-[#0444a4] hover:bg-[#0444a4d0] text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                          onClick={() => handleAddFriend(friend._id)}
                        >
                          <BsPersonFillAdd size={16} />
                          <span className="text-sm">Add Friend</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="text-6xl text-ascent-3 mb-4">🔍</div>
                <h3 className="text-xl font-medium text-ascent-1 mb-2">
                  No suggestions available
                </h3>
                <p className="text-ascent-2 text-center max-w-md">
                  We don't have any friend suggestions for you right now. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendSuggestions;
