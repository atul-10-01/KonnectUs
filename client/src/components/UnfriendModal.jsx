import React from "react";
import { FiUserMinus, FiX } from "react-icons/fi";
import { CustomButton } from "./";
import { NoProfile } from "../assets";

const UnfriendModal = ({ isOpen, onClose, user, onConfirm, loading }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-primary rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#66666645]">
          <h2 className="text-xl font-semibold text-ascent-1 flex items-center gap-2">
            <FiUserMinus className="text-red-500" size={24} />
            Unfriend User
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ascent-3/10 rounded-full transition-colors"
            disabled={loading}
          >
            <FiX size={20} className="text-ascent-2" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* User Avatar */}
            <img
              src={user?.profileUrl ?? NoProfile}
              alt={user?.firstName}
              className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-[#66666645]"
            />
            
            {/* User Name */}
            <h3 className="text-lg font-semibold text-ascent-1 mb-2">
              {user?.firstName} {user?.lastName}
            </h3>
            
            {/* Warning Message */}
            <p className="text-ascent-2 mb-6 leading-relaxed">
              Are you sure you want to unfriend <span className="font-semibold text-ascent-1">{user?.firstName}</span>? 
              You'll no longer see each other's posts and will need to send a friend request to connect again.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <CustomButton
                type="button"
                title="Cancel"
                onClick={onClose}
                containerStyles="flex-1 bg-ascent-3/20 text-ascent-1 py-3 px-6 rounded-lg font-medium hover:bg-ascent-3/30 transition-colors"
                disabled={loading}
              />
              <CustomButton
                type="button"
                title={loading ? "Unfriending..." : "Unfriend"}
                onClick={handleConfirm}
                containerStyles="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnfriendModal;
