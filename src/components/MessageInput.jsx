import { useState } from 'react';

function MessageInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Write something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '70%' }}
      />
      <button type="submit">Send</button>
    </form>
  );
}
export default MessageInput;
