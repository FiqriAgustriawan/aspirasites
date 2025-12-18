import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import './index.css';

// 1. Inisialisasi Klien Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const ai = new GoogleGenAI({ apiKey });

// --- Component Helper ---
const Logo = () => (
  <div className="flex items-center gap-2">
    <img src="/logo-juara.png" alt="Juara.ai" className="h-10 w-auto" />
  </div>
);

const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll ke bawah saat ada message baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // 2. Definisikan KONTEKS WEB Anda di System Instruction
  const systemInstruction = `
     Kamu adalah "Juara.ai", asisten cerdas yang ahli tentang Kabupaten Luwu Timur (Lutim), Sulawesi Selatan.
  
  Tugasmu adalah membantu pengguna dengan informasi akurat mengenai:
  - Geografi dan Lokasi: Dimana Luwu Timur berada, batas wilayah, kecamatan, dll.
  - Kependudukan: Jumlah penduduk, demografi.
  - Budaya dan Suku: Suku-suku yang ada (Bugis, Toraja, Padoe, dll), adat istiadat.
  - Pariwisata: Tempat wisata (Danau Matano, Danau Towuti, Air Terjun Mata Buntu, dll).
  - Pemerintahan: Bupati, pusat pemerintahan (Malili).
  - Ekonomi: Pertambangan (Vale), pertanian, perkebunan.
  
  Gaya Bicara:
  - Ramah, sopan, dan membantu.
  - Gunakan Bahasa Indonesia yang baik namun tetap luwes (tidak kaku).
  - Panggil pengguna dengan "Kak" atau "Teman Juara" jika perlu.
  
  Jika ditanya hal di luar Luwu Timur, jawab dengan sopan bahwa kamu saat ini fokus mempelajari Luwu Timur, tapi tetap coba bantu jika itu pengetahuan umum yang sederhana.

  `;


  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);
    setIsChatStarted(true); 

    try {
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      const response = await chat.sendMessage({ message: newMessage.text });
      const aiResponse = response.text;

      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Maaf, terjadi kesalahan saat menghubungi layanan AI." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-blue-100 font-sans text-gray-800 relative overflow-hidden">
      
      {/* Conditional Layout Based on Chat State */}
      {!isChatStarted ? (
        /* ===== WELCOME SCREEN ===== */
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          {/* Logo */}
          <div className="mb-8">
            <Logo />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-3 leading-tight max-w-2xl">
            Selamat pagi, <span className="text-blue-600">Juara.ai</span> di sini,<br />
            ada yang bisa dibantu?
          </h1>

          {/* Subheading */}
          <p className="text-gray-500 text-base md:text-lg text-center mb-10 max-w-xl">
            Tanyakan sesuatu yang ingin kamu tau pada Juara.ai
          </p>

          {/* Input Box */}
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Tanyakan Juara ai..."
              className="w-full py-4 px-6 pr-14 rounded-full border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base bg-white/90 backdrop-blur-sm hover:shadow-lg"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <MicIcon />
            </div>
          </div>
        </div>
      ) : (
        /* ===== CHAT SCREEN ===== */
        <div className="flex flex-col h-screen">
          {/* Logo Header - Fixed Top Left */}
          <div className="absolute top-6 left-6 z-10">
            <Logo />
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto pt-24 pb-6 px-4 md:px-16 lg:px-32 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-white text-gray-800 rounded-tr-none border border-gray-100' 
                    : 'bg-blue-50/80 text-gray-800 rounded-tl-none border border-blue-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-blue-50/50 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex space-x-1 items-center h-6">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '-0.3s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '-0.15s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed Bottom */}
          <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm px-4 md:px-16 lg:px-32 py-4">
            <div className="relative max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Tanyakan Juara ai..."
                className="w-full py-4 px-6 pr-14 rounded-full border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base bg-white"
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <MicIcon />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;