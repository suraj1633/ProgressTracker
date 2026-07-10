import {
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import MateProfilePanel from "../components/MateProfilePanel/MateProfilePanel";
import Navbar from "../components/Navbar/Navbar";
import {
  getMates,
  updateMateStatus,
} from "../services/mateApi";

import "./Profile.css";
import "./Friends.css";

const MateProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);
  const cameFromMateChat =
    location.state?.fromMateChat;

  useEffect(() => {
    let isMounted = true;

    const loadMate = async () => {
      const mates = await getMates();
      const mate = mates.find(
        (user) => user.id === id
      );

      if (isMounted) {
        setSelectedUser(mate || null);
      }
    };

    loadMate();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusChange = async (
    userId,
    status
  ) => {
    const mate =
      await updateMateStatus(
        userId,
        status
      );

    if (mate) {
      setSelectedUser(mate);
    }

    return mate;
  };

  const handleBack = () => {
    if (cameFromMateChat) {
      navigate(
        `/friends/${
          location.state?.mateId || selectedUser.id
        }/chat`
      );
      return;
    }

    navigate("/friends");
  };

  return (
    <>
      <Navbar />

      <div className="profile-page">
        <main className="profile-content">
          {selectedUser ? (
            <MateProfilePanel
              selectedUser={selectedUser}
              onBack={handleBack}
              onOpenProfile={() =>
                navigate(
                  `/friends/${selectedUser.id}`
                )
              }
              onStatusChange={
                handleStatusChange
              }
              onMessage={() =>
                navigate(
                  `/friends/${selectedUser.id}/chat`
                )
              }
            />
          ) : (
            <section className="mate-selection-empty-panel">
              <h2>No mate selected</h2>
              <p>
                Pick a mate from the mates page to view their profile.
              </p>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default MateProfile;
