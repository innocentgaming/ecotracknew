'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { sendChatMessage, QUICK_QUESTIONS } from '@/lib/geminiChat';
import { loadSettings } from '@/lib/storage';
import styles from './page.module.css';

export default function ChatPage() {
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      role: 'assistant',
      content: "🌿 Hi! I'm **EcoBot**, your AI sustainability assistant. I can help you understand your carbon footprint, suggest green alternatives, and answer any questions about eco-friendly living in India!\n\nWhat would you like to know?",
      timestamp: new Date(1771113600000), // Stable initial timestamp to prevent render impurity warnings
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const settings = loadSettings();
      setApiKey(settings.geminiApiKey || '');
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const allMessages = [...messages, userMsg];

    try {
      const response = await sendChatMessage(allMessages, userText, apiKey);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please check your API key in Settings, or try again!",
          timestamp: new Date(),
        },
      ]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }, [messages, apiKey, input, loading]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMessage(content) {
    const escaped = escapeHtml(content);
    return escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.chatLayout}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <span style={{ fontSize: '2.5rem' }}>🤖</span>
              <div>
                <h2 className="heading-2">EcoBot</h2>
                <p className="caption text-secondary">AI Sustainability Assistant</p>
              </div>
            </div>

            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              <span>Online {apiKey ? '• Gemini AI' : '• Smart Mode'}</span>
            </div>

            {!apiKey && (
              <div className={styles.apiWarning}>
                <span>🔑</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Add API Key</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Go to <a href="/settings" style={{ color: 'var(--green-primary)' }}>Settings</a> to enable full AI
                  </div>
                </div>
              </div>
            )}

            <div className={styles.quickSection}>
              <h3 className="caption text-muted" style={{ marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Questions
              </h3>
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  className={styles.quickBtn}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                >
                  <span style={{ fontSize: '0.8rem' }}>💬</span>
                  <span>{q}</span>
                </button>
              ))}
            </div>

            <div className={styles.sidebarFooter}>
              <div className={styles.ecoFact}>
                <span style={{ fontSize: '1.2rem' }}>🌍</span>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green-primary)' }}>Eco Fact</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    India aims to reach 500 GW renewable energy capacity by 2030
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className={styles.chatArea}>
            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.botMessage}`}
                >
                  {msg.role === 'assistant' && (
                    <div className={styles.botAvatar}>🌿</div>
                  )}
                  <div className={styles.messageBubble}>
                    <div
                      className={styles.messageContent}
                      dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                    />
                    <div className={styles.messageTime}>{formatTime(msg.timestamp)}</div>
                  </div>
                  {msg.role === 'user' && (
                    <div className={styles.userAvatar}>👤</div>
                  )}
                </div>
              ))}

              {loading && (
                <div className={`${styles.message} ${styles.botMessage}`}>
                  <div className={styles.botAvatar}>🌿</div>
                  <div className={styles.messageBubble}>
                    <div className={styles.typingIndicator}>
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
              <div className={styles.inputWrapper}>
                <textarea
                  ref={inputRef}
                  className={styles.chatInput}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask EcoBot anything about carbon footprint..."
                  rows={1}
                  id="chat-input"
                  aria-label="Ask EcoBot anything about carbon footprint..."
                />
                <button
                  className={styles.sendBtn}
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  id="send-chat-btn"
                  aria-label="Send message"
                >
                  {loading ? '⏳' : '🌿'}
                </button>
              </div>
              <div className={styles.inputHint}>
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
