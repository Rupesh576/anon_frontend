import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import MessageInput from './components/MessageInput';
import MessageList from './components/MessageList';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import DateSelector from './components/DateSelector';
import "./App.css";

const url = import.meta.env.VITE_BACKEND_URL;
const socket = io(url);

function Home() {
  const [messages, setMessages] = useState([]);
  const [fingerprint, setFingerprint] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA'); // ✅ "YYYY-MM-DD" in user's local timezone
  });

  const [readOnlyMode, setReadOnlyMode] = useState(false);

  // 🔒 Check if selected date is today
  function isToday(dateStr) {
    const selected = new Date(dateStr);
    const now = new Date();
    return selected.toDateString() === now.toDateString();
  }


  // 📅 React to date change
  useEffect(() => {
    setReadOnlyMode(!isToday(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    loadFingerprint();
  }, []);

  useEffect(() => {
    fetch(`${url}/api/messages-public`)
      .then(res => res.json())
      .then(data => setMessages(data));

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('message_blocked', (info) => {
      alert(info);
    });

    socket.on('message_deleted', (_id) => {
      setMessages(prev => prev.filter(msg => msg._id !== _id));
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_blocked');
      socket.off('message_deleted');
    };
  }, []);

  const handleSend = (text) => {
    if (text.trim() && fingerprint && !readOnlyMode) {
      socket.emit('send_message', {
        text,
        fingerprint
      });
    }
  };

  return (
    <div className="container">
      <h2>💬 Anonymous Chat</h2>
      <DateSelector
        selectedDate={selectedDate}
        onChange={(newDate) => setSelectedDate(newDate)}
      />
      <MessageList messages={messages} selectedDate={selectedDate} />
      {isToday(selectedDate) && <MessageInput onSend={handleSend} />}
    </div>
  );
}

export default Home;
