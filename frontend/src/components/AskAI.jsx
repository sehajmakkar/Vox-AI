import { useRef } from "react";

function AskAIButton() {
  const aiTabRef = useRef(null);

  const handleAskAIClick = () => {
    const aiURL = "http://localhost:8501";

    if (aiTabRef.current && !aiTabRef.current.closed) {
      // If the tab is already open, just focus it
      aiTabRef.current.focus();
    } else {
      // Otherwise, open a new tab and store the reference
      aiTabRef.current = window.open(aiURL, "_blank");
    }
  };

  return (
    <button
      onClick={handleAskAIClick}
      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
    >
      Ask AI
    </button>
  );
}

export default AskAIButton;
