import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [roomId, setRoomId] = React.useState("");
  const navigate = useNavigate();

  const generate = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    setRoomId(randomId);
  }

  const handleOneOnOne = () => {
    if (!roomId) {
      alert("Please generate a room ID first.");
      return;
    }
    navigate(`/room/${roomId}?type=one-on-one`);
  }

  const handleGroup = () => {
    if (!roomId) {
      alert("Please generate a room ID first.");
      return;
    }
    navigate(`/room/${roomId}?type=group`);
  }

  return (
    <div>
      <div>
        <input type="text" value={roomId} readOnly />
        <button onClick={generate}>Generate</button>
      </div>

      <div>
        <button onClick={handleOneOnOne} disabled={!roomId}>One on ONE</button>
        <button onClick={handleGroup} disabled={!roomId}>Group</button>
      </div>
    </div>
  );
};

export default HomePage;
