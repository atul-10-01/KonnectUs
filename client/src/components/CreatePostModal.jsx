import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { MdClose, MdOutlineCloudUpload } from "react-icons/md";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { BsFiletypeGif } from "react-icons/bs";
import { NoProfile } from "../assets";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";

const CreatePostModal = ({ user, isOpen, onClose, onSubmit, posting, errMsg }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const description = watch("description", "");

  // Clean up object URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (description.trim() || file) {
          handleSubmit(handleFormSubmit)();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, description, file, handleSubmit]);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("File size too large. Maximum size is 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/wav'];
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Invalid file type. Only JPEG, PNG, GIF, MP4, and WAV files are allowed");
        return;
      }

      setFile(selectedFile);
      
      // Create preview URL for images, GIFs, and videos
      if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
  };

  const handleFormSubmit = async (data) => {
    await onSubmit({ ...data, file });
    if (!errMsg || errMsg?.status !== "failed") {
      reset();
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    reset();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    onClose();
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 animate-in fade-in duration-200'>
      <div className='bg-primary rounded-lg w-full max-w-lg mx-auto shadow-xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300'>
        {/* Header */}
        <div className='flex justify-between items-center px-6 py-4 border-b border-[#66666645]'>
          <h2 className='text-xl font-semibold text-ascent-1'>Create Post</h2>
          <button
            onClick={handleClose}
            className='text-ascent-2 hover:text-ascent-1 transition-colors p-1 hover:bg-secondary rounded-full'
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className='p-6'>
          {/* User Info */}
          <div className='flex items-center gap-3 mb-4'>
            <img
              src={user?.profileUrl ?? NoProfile}
              alt='User Image'
              className='w-12 h-12 rounded-full object-cover'
            />
            <div>
              <p className='font-medium text-ascent-1'>
                {user?.firstName} {user?.lastName}
              </p>
              <p className='text-sm text-ascent-2'>{user?.location}</p>
            </div>
          </div>

          {/* Text Input */}
          <div className='mb-4'>
            <TextInput
              styles='w-full rounded-lg py-3 min-h-[100px] resize-none'
              placeholder="What's on your mind?"
              name='description'
              register={register("description", {
                required: "Please write something about your post",
                maxLength: { value: 500, message: "Post description is too long (max 500 characters)" }
              })}
              error={errors.description ? errors.description.message : ""}
              multiline={true}
            />
            <div className='flex justify-between items-center mt-1'>
              <span className='text-xs text-ascent-2'>
                Share your thoughts, experiences, or updates with your friends
              </span>
              <span className={`text-xs ${description.length > 450 ? 'text-red-500' : 'text-ascent-2'}`}>
                {description.length}/500
              </span>
            </div>
          </div>

          {/* File Preview */}
          {previewUrl && (
            <div className='mb-4 relative'>
              <div className='relative rounded-lg overflow-hidden border border-[#66666645]'>
                {file?.type.startsWith('video/') ? (
                  <video
                    src={previewUrl}
                    controls
                    className='w-full max-h-80 object-cover'
                    style={{ backgroundColor: '#000' }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt='Preview'
                    className='w-full max-h-80 object-cover'
                  />
                )}
                <button
                  type='button'
                  onClick={removeFile}
                  className='absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all'
                >
                  <MdClose size={20} />
                </button>
              </div>
              <p className='text-sm text-ascent-2 mt-2'>
                {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          {/* File Upload Area */}
          {!file && (
            <div
              className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-blue bg-blue bg-opacity-10'
                  : 'border-[#66666645] hover:border-[#66666690]'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <MdOutlineCloudUpload size={48} className='mx-auto mb-3 text-ascent-2' />
              <p className='text-ascent-2 mb-2'>
                Drag and drop your file here, or click to browse
              </p>
              <div className='flex justify-center gap-4'>
                <label
                  htmlFor='imgUpload'
                  className='flex items-center gap-1 text-sm text-ascent-2 hover:text-ascent-1 cursor-pointer bg-secondary px-3 py-2 rounded-md transition-colors'
                >
                  <input
                    type='file'
                    onChange={handleFileChange}
                    className='hidden'
                    id='imgUpload'
                    accept='.jpg, .png, .jpeg'
                  />
                  <BiImages />
                  <span>Image</span>
                </label>

                <label
                  htmlFor='videoUpload'
                  className='flex items-center gap-1 text-sm text-ascent-2 hover:text-ascent-1 cursor-pointer bg-secondary px-3 py-2 rounded-md transition-colors'
                >
                  <input
                    type='file'
                    onChange={handleFileChange}
                    className='hidden'
                    id='videoUpload'
                    accept='.mp4, .wav'
                  />
                  <BiSolidVideo />
                  <span>Video</span>
                </label>

                <label
                  htmlFor='gifUpload'
                  className='flex items-center gap-1 text-sm text-ascent-2 hover:text-ascent-1 cursor-pointer bg-secondary px-3 py-2 rounded-md transition-colors'
                >
                  <input
                    type='file'
                    onChange={handleFileChange}
                    className='hidden'
                    id='gifUpload'
                    accept='.gif'
                  />
                  <BsFiletypeGif />
                  <span>GIF</span>
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errMsg?.message && (
            <div className='mb-4'>
              <span
                role='alert'
                className={`text-sm ${
                  errMsg?.status === "failed"
                    ? "text-[#f64949fe]"
                    : "text-[#2ba150fe]"
                }`}
              >
                {errMsg?.message}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-between items-center pt-4 border-t border-[#66666645]'>
            <p className='text-xs text-ascent-2'>
              Press <kbd className="px-1 py-0.5 bg-secondary rounded text-xs">Esc</kbd> to cancel or <kbd className="px-1 py-0.5 bg-secondary rounded text-xs">Ctrl+Enter</kbd> to post
            </p>
            <div className='flex gap-3'>
              <CustomButton
                type='button'
                title='Cancel'
                onClick={handleClose}
                containerStyles='bg-secondary text-ascent-1 px-6 py-2 rounded-full font-medium text-sm hover:bg-[#66666645] transition-colors'
              />
              {posting ? (
                <Loading />
              ) : (
                <CustomButton
                  type='submit'
                  title='Post'
                  disabled={!description.trim() && !file}
                  containerStyles={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${
                    !description.trim() && !file
                      ? 'bg-[#66666645] text-ascent-2 cursor-not-allowed'
                      : 'bg-[#0444a4] text-white hover:bg-[#033a91]'
                  }`}
                />
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
