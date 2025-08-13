import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { TopBar, Loading } from "../components";
import { NoProfile } from "../assets";

const Friends = () => {
  const { user } = useSelector((state) => state.user);

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="w-full min-h-screen bg-bgColor">
      <div className="w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg">
        <TopBar />
        
        <div className="w-full pt-5 px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ascent-1 mb-2">My Friends</h1>
            <p className="text-ascent-2">
              You have {user?.friends?.length || 0} friends
            </p>
          </div>

          {/* Friends Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {user?.friends?.length > 0 ? (
              user.friends.map((friend) => (
                <Link
                  key={friend._id}
                  to={`/profile/${friend._id}`}
                  className="bg-primary rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={friend?.profileUrl ?? NoProfile}
                      alt={friend?.firstName}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                    <h3 className="text-lg font-medium text-ascent-1">
                      {friend?.firstName} {friend?.lastName}
                    </h3>
                    <p className="text-sm text-ascent-2 mt-1">
                      {friend?.profession ?? "No Profession"}
                    </p>
                    {friend?.location && (
                      <p className="text-xs text-ascent-2 mt-1">
                        {friend.location}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="text-6xl text-ascent-3 mb-4">👥</div>
                <h3 className="text-xl font-medium text-ascent-1 mb-2">
                  No friends yet
                </h3>
                <p className="text-ascent-2 text-center max-w-md">
                  Start connecting with people by sending friend requests or accepting incoming requests.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
