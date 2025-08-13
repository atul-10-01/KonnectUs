import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { MdClose, MdOutlineCloudUpload } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { UpdateProfile, UserLogin } from "../redux/userSlice";
import { handleFileUpload, updateUserProfile } from "../utils";

const EditProfile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [picture, setPicture] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...user },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrMsg("");

    try {
      let profileUrl = user?.profileUrl;
      
      // Upload new profile picture if selected
      if (picture) {
        console.log("Uploading profile picture...");
        profileUrl = await handleFileUpload(picture);
        console.log("Profile picture uploaded:", profileUrl);
      }

      // Prepare update data
      const updateData = {
        ...data,
        profileUrl,
      };

      console.log("Updating user profile with data:", updateData);

      // Update user profile
      const result = await updateUserProfile(user?.token, updateData);
      
      if (result?.status === "failed") {
        setErrMsg(result);
      } else {
        setErrMsg({ status: "success", message: "Profile updated successfully" });
        
        // Update user in Redux store
        const updatedUser = { ...user, ...updateData };
        dispatch(UserLogin(updatedUser));
        
        // Close modal after short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setErrMsg({ 
        status: "failed", 
        message: error.message || "Failed to update profile" 
      });
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    dispatch(UpdateProfile(false));
  };
  const handleSelect = (e) => {
    setPicture(e.target.files[0]);
  };

  return (
    <>
      <div className='fixed z-50 inset-0 overflow-y-auto'>
        <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
          <div className='fixed inset-0 transition-opacity'>
            <div className='absolute inset-0 bg-[#000] opacity-70'></div>
          </div>
          <span className='hidden sm:inline-block sm:align-middle sm:h-screen'></span>
          &#8203;
          <div
            className='inline-block align-bottom bg-primary rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'
            role='dialog'
            aria-modal='true'
            aria-labelledby='modal-headline'
          >
            <div className='flex justify-between px-6 pt-5 pb-2'>
              <label
                htmlFor='name'
                className='block font-medium text-xl text-ascent-1 text-left'
              >
                Edit Profile
              </label>

              <button className='text-ascent-1 cursor-pointer hover:text-ascent-0 transition-colors' onClick={handleClose}>
                <MdClose size={22} />
              </button>
            </div>
            <form
              className='px-4 sm:px-6 flex flex-col gap-3 2xl:gap-6'
              onSubmit={handleSubmit(onSubmit)}
            >
              <TextInput
                name='firstName'
                label='First Name'
                placeholder='First Name'
                type='text'
                styles='w-full'
                register={register("firstName", {
                  required: "First Name is required!",
                })}
                error={errors.firstName ? errors.firstName?.message : ""}
              />

              <TextInput
                label='Last Name'
                placeholder='Last Name'
                type='lastName'
                styles='w-full'
                register={register("lastName", {
                  required: "Last Name do no match",
                })}
                error={errors.lastName ? errors.lastName?.message : ""}
              />

              <TextInput
                name='profession'
                label='Profession'
                placeholder='Profession'
                type='text'
                styles='w-full'
                register={register("profession", {
                  required: "Profession is required!",
                })}
                error={errors.profession ? errors.profession?.message : ""}
              />

              <TextInput
                label='Location'
                placeholder='Location'
                type='text'
                styles='w-full'
                register={register("location", {
                  required: "Location do no match",
                })}
                error={errors.location ? errors.location?.message : ""}
              />

              <label
                className='flex items-center justify-center gap-2 text-white bg-blue hover:bg-blue-700 cursor-pointer my-4 px-4 py-2 rounded-md transition-colors duration-200'
                htmlFor='imgUpload'
              >
                <MdOutlineCloudUpload size={20} />
                <span>Choose Profile Picture</span>
                <input
                  type='file'
                  className='hidden'
                  id='imgUpload'
                  onChange={(e) => handleSelect(e)}
                  accept='.jpg, .png, .jpeg'
                />
              </label>

              {errMsg?.message && (
                <span
                  role='alert'
                  className={`text-sm ${
                    errMsg?.status === "failed"
                      ? "text-[#f64949fe]"
                      : "text-[#2ba150fe]"
                  } mt-0.5`}
                >
                  {errMsg?.message}
                </span>
              )}

              <div className='py-5 sm:flex sm:flex-row-reverse border-t border-[#66666645]'>
                {isSubmitting ? (
                  <Loading />
                ) : (
                  <CustomButton
                    type='submit'
                    containerStyles={`inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white outline-none`}
                    title='Submit'
                  />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
