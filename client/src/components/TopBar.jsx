import React, { useState } from "react";
import { TbSocial } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import { useForm } from "react-hook-form";
import { BsMoon, BsSunFill } from "react-icons/bs";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";
import { SetTheme } from "../redux/theme";
import { Logout } from "../redux/userSlice";
import { MobileMenu } from "./";

const TopBar = ({ showMobileMenu = false, friendRequests = [], suggestedFriends = [] }) => {
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleTheme = () => {
    const themeValue = theme === "light" ? "dark" : "light";

    dispatch(SetTheme(themeValue));
  };

  const handleSearch = async (data) => {};

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className='topbar w-full flex items-center justify-between py-3 md:py-6 px-4 bg-primary'>
        {/* Left side - Logo */}
        <Link to='/' className='flex gap-2 items-center'>
          <div className='p-1 md:p-2 bg-[#065ad8] rounded text-white'>
            <TbSocial />
          </div>
          <span className='text-xl md:text-2xl text-[#065ad8] font-semibold'>
            KonnectUs
          </span>
        </Link>

        {/* Center - Search (hidden on smaller screens) */}
        <form
          className='hidden md:flex items-center justify-center'
          onSubmit={handleSubmit(handleSearch)}
        >
          <TextInput
            placeholder='Search...'
            styles='w-[18rem] lg:w-[38rem]  rounded-l-full py-3 '
            register={register("search")}
          />
          <CustomButton
            title='Search'
            type='submit'
            containerStyles='bg-[#0444a4] text-white px-6 py-2.5 mt-2 rounded-r-full'
          />
        </form>

        {/* Right side - Navigation */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation Icons */}
          <div className='hidden lg:flex gap-4 items-center text-ascent-1 text-md md:text-xl'>
            {/* Theme toggle */}
            <button 
              onClick={() => handleTheme()}
              className="cursor-pointer hover:text-blue transition-colors p-1"
            >
              {theme ? <BsMoon /> : <BsSunFill />}
            </button>
            
            {/* Notifications */}
            <Link to="/notifications" className='cursor-pointer hover:text-blue transition-colors'>
              <IoMdNotificationsOutline />
            </Link>

            {/* Logout button */}
            <CustomButton
              onClick={() => dispatch(Logout())}
              title='Log Out'
              containerStyles='text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full'
            />
          </div>

          {/* Hamburger Menu Button - only show on smaller screens where 3-section layout doesn't fit */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} className="text-ascent-1" /> : <FiMenu size={24} className="text-ascent-1" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        friendRequests={friendRequests}
        suggestedFriends={suggestedFriends}
      />
    </>
  );
};

export default TopBar;
