import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  useEffect,
  useState,
} from "react";
import {
  HiCheckBadge,
  HiOutlineCamera,
  HiOutlineTrash,
} from "react-icons/hi2";

import "./Profile.css";

const getProfileImageKey = (
  user
) =>
  user?.email
    ? `profileImage:${user.email}`
    : "profileImage";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat(
        "en",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      ).format(new Date(value))
    : "Not available";

const Profile = () => {
  const { user } = useAuth();
  const storageKey =
    getProfileImageKey(user);
  const [profileImage, setProfileImage] =
    useState(() =>
      localStorage.getItem(
        storageKey
      )
    );

  useEffect(() => {
    setProfileImage(
      localStorage.getItem(
        storageKey
      )
    );
  }, [storageKey]);

  const initial =
    user?.name?.[0]?.toUpperCase() ||
    "U";

  const handleImageChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const image =
        reader.result;

      if (
        typeof image !== "string"
      ) {
        return;
      }

      localStorage.setItem(
        storageKey,
        image
      );

      setProfileImage(image);
      window.dispatchEvent(
        new Event(
          "profile-image-updated"
        )
      );
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    localStorage.removeItem(
      storageKey
    );
    setProfileImage(null);
    window.dispatchEvent(
      new Event(
        "profile-image-updated"
      )
    );
  };

  return (
    <>
      <Navbar />

      <div className="profile-page">
        <main className="profile-content">
          <header className="profile-header">
            <h1>Profile</h1>

            <p>
              View and manage your account
              information.
            </p>
          </header>

          <section className="profile-card">
            <div className="profile-summary">
              <div className="profile-avatar">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${user?.name || "User"} profile`}
                  />
                ) : (
                  <span>
                    {initial}
                  </span>
                )}
              </div>

              <label className="profile-upload-button">
                <HiOutlineCamera />
                Add profile image
                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />
              </label>

              {profileImage ? (
                <button
                  type="button"
                  className="profile-remove-button"
                  onClick={removeImage}
                >
                  <HiOutlineTrash />
                  Remove image
                </button>
              ) : null}
            </div>

            <div className="profile-details">
              <div className="profile-title">
                <h1>
                  {user?.name || "User"}
                </h1>

                <p>
                  {user?.email ||
                    "No email available"}
                </p>
              </div>

              <div
                className={
                  user?.isVerified
                    ? "profile-status verified"
                    : "profile-status"
                }
              >
                <HiCheckBadge />
                {user?.isVerified
                  ? "Verified account"
                  : "Not verified"}
              </div>

              <div className="profile-info-list">
                <div>
                  <span>Full name</span>
                  <strong>
                    {user?.name ||
                      "User"}
                  </strong>
                </div>

                <div>
                  <span>Email address</span>
                  <strong>
                    {user?.email ||
                      "No email available"}
                  </strong>
                </div>

                <div>
                  <span>Joined</span>
                  <strong>
                    {formatDate(
                      user?.createdAt
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Profile;
