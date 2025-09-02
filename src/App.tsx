import adventuristBg from './assets/adventurist2.jpg';
import { useRef, useEffect, useState } from 'react';
import { sendText } from './call_server';

function App() {
  const [textAreaValue, setTextAreaValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll textarea to bottom when text changes
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [textAreaValue]);

  // On mount, call sendText with empty string to load session
  useEffect(() => {
    (async () => {
      try {
        const response = await sendText("");
        if (response.text) {
          setTextAreaValue(response.text);
        }
      } catch {
        setTextAreaValue("[Error: could not reach server]");
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim() !== "") {
      try {
        const response = await sendText(inputValue);
        setTextAreaValue(prev => prev + (prev ? "\n" : "") + response.text);
      } catch {
        setTextAreaValue(prev => prev + (prev ? "\n" : "") + "[Error: could not reach server]");
      }
      setInputValue("");
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${adventuristBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <textarea
          ref={textAreaRef}
          value={textAreaValue}
          readOnly
          style={{ width: "680px", height: "480px", resize: "none", background: 'rgba(255,255,255,0.9)', boxSizing: 'border-box' }}
        />
        <form onSubmit={handleInputSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type something and press Enter"
            style={{ width: "680px", padding: "0.5rem", background: 'rgba(255,255,255,0.8)', boxSizing: 'border-box' }}
          />
        </form>
      </div>
    </div>
  );
}

export default App
