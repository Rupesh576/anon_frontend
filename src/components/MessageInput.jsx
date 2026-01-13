import { useState } from 'react';
const url = import.meta.env.VITE_BACKEND_URL;

function MessageInput({ onSend, readOnly }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!readOnly && text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={readOnly ? "🔒 Read-only mode for past dates" : "Write something..."}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={readOnly}
        style={{ width: '70%' }}
      />
      <button type="submit" disabled={readOnly || !text.trim()}>
        Send
      </button>
    </form>
  );
}

export default MessageInput;
