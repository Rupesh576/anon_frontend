import React, { useEffect, useState, useRef } from "react";
const url = import.meta.env.VITE_BACKEND_URL;
function MessageList({ messages, selectedDate }) {
  const [filtered, setFiltered] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedDate) return;

    const newFiltered = messages
      .filter((msg) => {
        const parsed = msg.timeStamp?.split("T")[0];
        return parsed === selectedDate;
      })
      .sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));

    setFiltered(newFiltered);
  }, [messages, selectedDate]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filtered]);

  const formatDateHeading = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }); // e.g., "04 Jul, 2025"
  };

  return (
    <div
      className="message-list"
      style={{
        maxHeight: "400px",
        overflowY: "auto",
        background: "#1e1e1e",
        borderRadius: "10px",
        padding: "10px",
        marginTop: "10px",
        border: "1px solid #333",
        fontSize: "15px",
      }}
    >
      {filtered.length === 0 ? (
        <p style={{ color: "#888", textAlign: "center" }}>
          No messages for this date.
        </p>
      ) : (
        <>
          <div
            style={{
              textAlign: "center",
              color: "#ccc",
              fontSize: "13px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            🗓️ {formatDateHeading(filtered[0].timeStamp)}
          </div>

          {filtered.map((msg, index) => (
            <div
              key={index}
              style={{
                background: "#2b2b2b",
                margin: "6px 0",
                padding: "8px 10px",
                borderRadius: "6px",
                color: "white",
              }}
            >
              {msg.text}
              <div
                style={{
                  fontSize: "12px",
                  color: "#aaa",
                  marginTop: "4px",
                  textAlign: "right",
                }}
              >
                {new Date(msg.timeStamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </>
      )}
      <div ref={messageEndRef}></div>
    </div>
  );
}

export default MessageList;
