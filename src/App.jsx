import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Image, X, Bot, User } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your customer support assistant. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getBotResponse = (userMessage, hasImage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (hasImage) {
      return "I can see you've uploaded an image. I've analyzed it and I'm here to help! Could you please describe what issue you're experiencing with this?";
    }
    
    if (lowerMsg.includes('order') || lowerMsg.includes('track')) {
      return "I'd be happy to help you track your order! Please provide your order number, and I'll look up the status for you.";
    } else if (lowerMsg.includes('return') || lowerMsg.includes('refund')) {
      return "I can assist you with returns and refunds. Our return policy allows returns within 30 days of purchase. Would you like me to initiate a return for you?";
    } else if (lowerMsg.includes('password') || lowerMsg.includes('login')) {
      return "For security reasons, I can help you reset your password. Please check your email for a password reset link, or I can send you a new one.";
    } else if (lowerMsg.includes('price') || lowerMsg.includes('cost')) {
      return "I can help you with pricing information. Could you please specify which product or service you're interested in?";
    } else if (lowerMsg.includes('shipping') || lowerMsg.includes('delivery')) {
      return "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Which option would you prefer?";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return "Hello! How can I assist you today?";
    } else if (lowerMsg.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return "I understand your concern. Let me help you with that. Could you provide more details so I can assist you better?";
    }
  };

  const handleSend = () => {
    if (input.trim() === '' && !selectedImage) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(input, !!selectedImage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      setSelectedImage(null);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Bot className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Customer Support</h1>
            <p className="text-blue-100 text-sm">AI-Powered Assistant • Voice & Image Enabled</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                {msg.sender === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
              </div>
              <div className={`flex flex-col max-w-md ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 shadow-md'}`}>
                  {msg.image && <img src={msg.image} alt="Uploaded" className="rounded-lg mb-2 max-w-full h-auto" />}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-xs text-gray-500 mt-1 px-2">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {selectedImage && (
        <div className="max-w-4xl w-full mx-auto px-4 pb-2">
          <div className="bg-white rounded-lg p-2 shadow-lg relative inline-block">
            <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <img src={selectedImage} alt="Selected" className="max-h-32 rounded" />
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          
          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Upload Image">
            <Image className="w-6 h-6" />
          </button>

          <button onClick={toggleRecording} className={`p-3 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`} title={isRecording ? 'Stop Recording' : 'Start Voice Input'}>
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your message..." className="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32" rows="1" />

          <button onClick={handleSend} disabled={input.trim() === '' && !selectedImage} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors" title="Send Message">
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}