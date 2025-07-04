import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import MessageInput from './components/MessageInput';
import MessageList from './components/MessageList';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import DateSelector from './components/DateSelector';
import "./App.css"
const url = import.meta.env.VITE_BACKEND_URL;
const socket = io(url);

function Home() {
  const [messages, setMessages] = useState([]);
  const [fingerprint, setFingerprint] = useState(null);
  useEffect(() => {
    const loadFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    loadFingerprint();
  }, []);
  useEffect(() => {
    // 1. Fetch all messages initially
    fetch(`${url}/api/messages-public`)
      .then(res => res.json())
      .then(data => setMessages(data));

    // 2. New message received from others
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // 3. Message blocked by server (e.g. banned or bad word)
    socket.on('message_blocked', (info) => {
      alert(info);
    });

    // 4. Message deleted by admin
    socket.on('message_deleted', (_id) => {
      setMessages(prev => prev.filter(msg => msg._id !== _id));
    });

    // 5. Cleanup on unmount
    return () => {
      socket.off('receive_message');
      socket.off('message_blocked');
      socket.off('message_deleted');
    };
  }, []);


  const handleSend = (text) => {
    if (text.trim() && fingerprint) {
      socket.emit('send_message', {
        text,         // ✅ just one message string
        fingerprint
      });
    }
  };
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Default = today (YYYY-MM-DD)
  });

  return (
    <div className="container">
      <h2>💬 Anonymous Chat</h2>
      
      <DateSelector
        selectedDate={selectedDate}
        onChange={(newDate) => setSelectedDate(newDate)}
      />
      <MessageList messages={messages} selectedDate={selectedDate}/>
      <MessageInput onSend={handleSend} />
    </div>
  );
}

export default Home;
