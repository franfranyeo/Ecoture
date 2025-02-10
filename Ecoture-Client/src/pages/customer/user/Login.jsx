// components/Login.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "components/customer/user/LoginForm";
import MFAVerification from "components/customer/user/MFAVerification";
import AuthLayout from "components/customer/user/AuthLayout";
import { authService } from "services/auth.service";
import { toast } from "react-toastify";
import UserContext from "contexts/UserContext";

function Login() {
  const navigate = useNavigate();
  const [showMFA, setShowMFA] = useState(false);
  const [userData, setUserData] = useState(null);
  const { setUser } = useContext(UserContext);

  const handleLoginSuccess = (user, accessToken = "", mfaMethods) => {
    if (user.accessToken) {
      accessToken = user.accessToken;
      delete user.accessToken;
    }
    const userToStore = { ...user, mfaMethods };
    console.log(userToStore);
    setUser(userToStore);
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("accessToken", accessToken);

    toast.success("Logged in successfully");
    if (user.role === "Admin" || user.role === "Staff") {
      // staff or admin role
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleLoginSubmit = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      console.log(response, "HANDLELOGIN");
      const { user, accessToken, mfaMethods } = response;

      if (user.is2FAEnabled) {
        setUserData({ ...user, mfaMethods, accessToken });
        setShowMFA(true);
      } else {
        handleLoginSuccess(user, accessToken, mfaMethods);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  const handleMFACancel = () => {
    setShowMFA(false);
    setUserData(null);
  };

  const handleMFASuccess = (user, accessToken, mfaMethods) => {
    handleLoginSuccess(user, accessToken, mfaMethods);
  };

  return (
    <AuthLayout title={showMFA ? "TWO-FACTOR AUTHENTICATION" : "WELCOME BACK"}>
      {!showMFA ? (
        <LoginForm onSubmit={handleLoginSubmit} />
      ) : (
        <MFAVerification
          userData={userData}
          onCancel={handleMFACancel}
          onSuccess={handleMFASuccess}
        />
      )}
    </AuthLayout>
  );
}

export default Login;
