import API from "./api";

export const signup =
  async (payload) => {
    const response =
      await API.post(
        "/auth/signup",
        payload
      );

    return response.data;
  };

export const verifyOtp =
  async (payload) => {
    const response =
      await API.post(
        "/auth/verify-otp",
        payload
      );

    return response.data;
  };

export const resendOtp =
  async (email) => {
    const response =
      await API.post(
        "/auth/resend-otp",
        { email }
      );

    return response.data;
  };

export const login =
  async (payload) => {
    const response =
      await API.post(
        "/auth/login",
        payload
      );

    return response.data;
  };

export const getProfile =
  async () => {
    const response =
      await API.get("/auth/me");

    return response.data;
  };

export const updateProfile =
  async (payload) => {
    const response =
      await API.put(
        "/auth/me",
        payload
      );

    return response.data;
  };
