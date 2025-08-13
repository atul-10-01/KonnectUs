import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { CustomButton, Loading, TextInput } from "../components";
import { apiRequest } from "../utils";

const NewPassword = () => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const uid = params.get("uid");
  const token = params.get("token");
  const status = params.get("status");
  const message = params.get("message");

  const [valid, setValid] = useState(status ? status === "success" : null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (valid !== null) return; // already known via redirect
    if (!uid || !token) return setValid(false);

    const run = async () => {
      try {
        const res = await apiRequest({
          url: `/users/validate-reset?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`,
          method: "GET",
        });
        setValid(res?.valid === true);
      } catch (e) {
        setValid(false);
      }
    };
    run();
  }, [uid, token, valid]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");
    if (password.length < 8) return setErrMsg("Password must be at least 8 characters.");
    if (password !== confirm) return setErrMsg("Passwords do not match.");

    setIsSubmitting(true);
    try {
      const res = await apiRequest({
        url: "/users/reset-password",
        method: "POST",
        data: { uid, token, password },
      });
      if (res?.ok) {
        window.location.replace("/login");
      } else {
        setErrMsg(res?.message || "Failed to reset password.");
      }
    } catch (e) {
      setErrMsg("Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status && status !== "success") {
    return (
      <div className='w-full h-[100vh] bg-bgColor flex items-center justify-center p-6'>
        <div className='bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg text-center'>
          <h2 className='text-ascent-1 text-xl font-semibold mb-2'>Reset link problem</h2>
          <p className='text-ascent-2 mb-6'>{message || "Invalid or expired link."}</p>
          <Link to='/reset-password' className='text-[#065ad8] font-semibold'>Request a new link</Link>
        </div>
      </div>
    );
  }

  if (valid === null) {
    return (
      <div className='w-full h-[100vh] bg-bgColor flex items-center justify-center p-6'>
        <div className='bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg text-center'>
          <p className='text-ascent-2'>Validating link...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className='w-full h-[100vh] bg-bgColor flex items-center justify-center p-6'>
        <div className='bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg text-center'>
          <h2 className='text-ascent-1 text-xl font-semibold mb-2'>Invalid or expired link</h2>
          <Link to='/reset-password' className='text-[#065ad8] font-semibold'>Request a new link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full h-[100vh] bg-bgColor flex items-center justify-center p-6'>
      <div className='bg-primary w-full md:w-1/3 2xl:w-1/4 px-6 py-8 shadow-md rounded-lg'>
        <p className='text-ascent-1 text-lg font-semibold mb-2'>Set a new password</p>
        <form onSubmit={onSubmit} className='py-4 flex flex-col gap-5'>
          <TextInput
            name='password'
            type='password'
            placeholder='New password'
            styles='w-full rounded-lg'
            register={{ onChange: (e) => setPassword(e.target.value) }}
          />
          <TextInput
            name='confirm'
            type='password'
            placeholder='Confirm password'
            styles='w-full rounded-lg'
            register={{ onChange: (e) => setConfirm(e.target.value) }}
          />
          {errMsg && <span className='text-sm text-[#f64949fe]'>{errMsg}</span>}
          {isSubmitting ? (
            <Loading />
          ) : (
            <CustomButton type='submit' containerStyles='inline-flex justify-center rounded-md bg-blue px-8 py-3 text-sm font-medium text-white cursor-pointer outline-none' title='Update password' />
          )}
        </form>
      </div>
    </div>
  );
};

export default NewPassword;
