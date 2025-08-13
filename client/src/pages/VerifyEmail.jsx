import React from "react";
import { Link, useLocation } from "react-router-dom";

const VerifyEmail = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const status = params.get("status");
  const message = params.get("message");

  const isSuccess = status === "success";

  return (
    <div className='w-full h-[100vh] bg-bgColor flex items-center justify-center p-6'>
      <div className='bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg text-center'>
        {isSuccess ? (
          <>
            <h2 className='text-ascent-1 text-xl font-semibold mb-2'>Email verified</h2>
            <p className='text-ascent-2 mb-6'>{message || "Your email has been verified successfully."}</p>
            <Link to='/login' className='text-[#065ad8] font-semibold'>Go to login</Link>
          </>
        ) : (
          <>
            <h2 className='text-ascent-1 text-xl font-semibold mb-2'>Verification failed</h2>
            <p className='text-ascent-2 mb-6'>{message || "Something went wrong. Please try again."}</p>
            <Link to='/reset-password' className='text-[#065ad8] font-semibold'>Forgot password?</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
