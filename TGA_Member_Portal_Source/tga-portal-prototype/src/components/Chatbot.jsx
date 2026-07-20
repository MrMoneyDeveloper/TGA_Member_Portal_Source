import { useMemo, useState } from 'react';
import { chatbotAnswers } from '../data.js';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, I’m the TGA portal assistant. Ask me about membership, documents, assessments, payments, or consulting.' },
  ]);

  const suggestions = useMemo(() => ['How do I join?', 'Which documents do I need?', 'How do payments work?'], []);

  const send = (text) => {
    const value = String(text ?? input).trim();
    if (!value) return;
    const lower = value.toLowerCase();
    const match = chatbotAnswers.find((item) => item.keywords.some((keyword) => lower.includes(keyword)));
    const fallback = 'I can help with portal navigation and general process questions. For legal, licensing, or case-specific guidance, please request an authorised consultant.';
    setMessages((current) => [...current, { from: 'user', text: value }, { from: 'bot', text: match?.response || fallback }]);
    setInput('');
  };

  return (
    <>
      <button className="chat-launcher" onClick={() => setOpen((value) => !value)} aria-label="Open support chatbot">{open ? '×' : '✦'}</button>
      {open && (
        <section className="chat-panel" aria-label="TGA support assistant">
          <header><div><strong>TGA Assistant</strong><span><i></i> Online</span></div><button onClick={() => setOpen(false)}>×</button></header>
          <div className="chat-messages">
            {messages.map((message, index) => <p key={`${message.from}-${index}`} className={`chat-message chat-message--${message.from}`}>{message.text}</p>)}
          </div>
          {messages.length < 3 && <div className="chat-suggestions">{suggestions.map((item) => <button key={item} onClick={() => send(item)}>{item}</button>)}</div>}
          <form onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type your question…" /><button type="submit">➤</button></form>
          <small>General portal assistance only.</small>
        </section>
      )}
    </>
  );
}
