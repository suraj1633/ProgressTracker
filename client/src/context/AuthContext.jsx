/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getProfile,
  login as loginRequest,
  signup as signupRequest,
  verifyOtp as verifyOtpRequest,
  resendOtp as resendOtpRequest,
} from "../services/authApi";

const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadProfile =
      async () => {
        const token =
          localStorage.getItem(
            "authToken"
          );

        if (!token) {
          setLoading(false);
          return;
        }

        try {
          const data =
            await getProfile();

          setUser(data.user);
        } catch {
          localStorage.removeItem(
            "authToken"
          );
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    loadProfile();
  }, []);

  const completeAuth = (
    data
  ) => {
    localStorage.setItem(
      "authToken",
      data.token
    );

    setUser(data.user);
  };

  const signup = async (
    payload
  ) => signupRequest(payload);

  const verifyOtp =
    async (payload) => {
      const data =
        await verifyOtpRequest(
          payload
        );

      completeAuth(data);

      return data;
    };

  const resendOtp =
    async (email) =>
      resendOtpRequest(email);

  const login = async (
    payload
  ) => {
    const data =
      await loginRequest(payload);

    completeAuth(data);

    return data;
  };

  const logout = () => {
    localStorage.removeItem(
      "authToken"
    );
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        verifyOtp,
        resendOtp,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
