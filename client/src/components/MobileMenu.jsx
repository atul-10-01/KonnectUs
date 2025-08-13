import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { 
  FiHome, 
  FiUser, 
  FiUsers, 
  FiUserPlus, 
  FiLogOut,
  FiSun,
  FiMoon,
  FiBell
} from "react-icons/fi";
import { NoProfile } from "../assets";
import { Logout } from "../redux/userSlice";
import { SetTheme } from "../redux/theme";

const MobileMenu = ({ isOpen, onClose, friendRequests = [], suggestedFriends = [] }) => {
  const { user } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  const handleTheme = () => {
    const themeValue = theme === "light" ? "dark" : "light";
    dispatch(SetTheme(themeValue));
  };

  const handleLogout = () => {
    dispatch(Logout());
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-primary shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 pt-20 h-full overflow-y-auto">
          {/* User Profile Section */}
          <Link
            to={`/profile/${user?._id}`}
            className="flex items-center gap-3 mb-6 p-3 bg-secondary rounded-lg hover:bg-ascent-3/10 transition-colors"
            onClick={handleLinkClick}
          >
            <img
              src={user?.profileUrl ?? NoProfile}
              alt={user?.firstName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-lg font-medium text-ascent-1">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-ascent-2">{user?.profession ?? "No Profession"}</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-2 mb-6">
            <Link
              to="/"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={handleLinkClick}
            >
              <FiHome size={20} className="text-blue" />
              <span className="text-ascent-1 font-medium">Home</span>
            </Link>
            
            <Link
              to={`/profile/${user?._id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={handleLinkClick}
            >
              <FiUser size={20} className="text-blue" />
              <span className="text-ascent-1 font-medium">My Profile</span>
            </Link>

            <Link
              to="/friends"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={handleLinkClick}
            >
              <FiUsers size={20} className="text-blue" />
              <span className="text-ascent-1 font-medium">Friends</span>
              {user?.friends?.length > 0 && (
                <span className="ml-auto text-xs bg-blue text-white px-2 py-1 rounded-full">
                  {user.friends.length}
                </span>
              )}
            </Link>

            <Link
              to="/friend-suggestions"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={handleLinkClick}
            >
              <FiUserPlus size={20} className="text-blue" />
              <span className="text-ascent-1 font-medium">Friend Suggestions</span>
            </Link>

            <Link
              to="/notifications"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
              onClick={handleLinkClick}
            >
              <FiBell size={20} className="text-blue" />
              <span className="text-ascent-1 font-medium">Notifications</span>
              {friendRequests?.length > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={handleTheme}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              {theme === "light" ? <FiMoon size={20} className="text-blue" /> : <FiSun size={20} className="text-blue" />}
              <span className="text-ascent-1 font-medium">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FiLogOut size={20} className="text-red-500" />
              <span className="text-ascent-1 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
