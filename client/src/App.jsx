import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home, Login, Profile, Register, ResetPassword, Friends, FriendSuggestions, Notifications } from "./pages";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import NewPassword from "./pages/NewPassword.jsx";
import ResendVerification from "./pages/ResendVerification.jsx";

function Layout() {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();

  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
}

function App() {
  const { theme } = useSelector((state) => state.theme);

  return (
    <div data-theme={theme} className='w-full min-h-[100vh]'>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/profile/:id?' element={<Profile />} />
          <Route path='/friends' element={<Friends />} />
          <Route path='/friend-suggestions' element={<FriendSuggestions />} />
          <Route path='/notifications' element={<Notifications />} />
        </Route>

        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/new-password' element={<NewPassword />} />
        <Route path='/resend-verification' element={<ResendVerification />} />
      </Routes>
    </div>
  );
}

export default App;