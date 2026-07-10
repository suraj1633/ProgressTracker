import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import MateChatPanel from "../components/MateChatPanel/MateChatPanel";
import Navbar from "../components/Navbar/Navbar";
import { getMates } from "../services/mateApi";

import "./MateChat.css";

const MateChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

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

  return (
    <>
      <Navbar />

      <div className="mate-chat-page">
        <main className="mate-chat-content">
          {selectedUser ? (
            <MateChatPanel
              selectedUser={selectedUser}
              onBack={() =>
                navigate("/friends")
              }
              onOpenProfile={() =>
                navigate(
                  `/friends/${selectedUser.id}`,
                  {
                    state: {
                      fromMateChat: true,
                      mateId:
                        selectedUser.id,
                    },
                  }
                )
              }
            />
          ) : (
            <section className="mate-chat-shell">
              <div className="mate-chat-empty">
                <h2>No mate selected</h2>
                <p>
                  Pick a mate from the mates page to open chat.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
};

export default MateChat;
