import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";

import "./Profile.css";

const formatDate = (value) =>
  new Intl.DateTimeFormat(
    "en",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(value));

const Profile = () => {
  const { user } = useAuth();

  const initial =
    user?.name?.[0]?.toUpperCase() ||
    "U";

  return (
    <>
      <Navbar />

      <div className="profile-page">
        <main className="profile-content">
          <div className="profile-header">
            <h1>Profile</h1>

            <p>
              View your account details and verification status.
            </p>
          </div>

          <section className="profile-card">
            <div className="profile-avatar">
              {initial}
            </div>

            <div className="profile-grid">
              <div className="profile-field">
                <span>Name</span>
                <strong>
                  {user.name}
                </strong>
              </div>

              <div className="profile-field">
                <span>Email</span>
                <strong>
                  {user.email}
                </strong>
              </div>

              <div className="profile-field">
                <span>Status</span>
                <strong>
                  {user.isVerified
                    ? "Verified"
                    : "Not verified"}
                </strong>
              </div>

              <div className="profile-field">
                <span>Joined</span>
                <strong>
                  {formatDate(
                    user.createdAt
                  )}
                </strong>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Profile;
