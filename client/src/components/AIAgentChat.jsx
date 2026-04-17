import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, Loader } from 'lucide-react';
import './AIAgentChat.css';

const AIAgentChat = () => {
    const [messages, setMessages] = useState([
        {
            id: 'initial',
            type: 'bot',
            text: "👋 Welcome to GeoValuator AI Agent! I can help you:\n\n1️⃣ Analyze **Kabja Risk** for your land\n2️⃣ Predict **Land Value** and market trends\n3️⃣ Detect **Encroachment** via satellite images\n\nTry asking: 'What is the risk for my land in Bapatla?' or 'Predict price for 200 sq yards near Suryalanka Beach'",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationContext, setConversationContext] = useState({});
    const messagesEndRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://geovaluator-backend.onrender.com';

    // Handle message submission
    const handleSendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now() + Math.random(),
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Call Backend Gemini Chat
            const response = await axios.post(`${backendUrl}/api/ai/chat`, {
                message: userMessage.text,
                history: messages // Context window
            });

            const botText = response.data?.response || "I couldn't process that request. Please try again.";

            // Add bot response
            const botMessage = {
                id: Date.now() + Math.random(),
                type: 'bot',
                text: botText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Chat Error:', error);
            const botText = error.response?.data?.response || '⚠️ Network error. Please check if the server is running.';
            const errorMessage = {
                id: Date.now() + Math.random(),
                type: 'bot',
                text: botText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Quick suggestions
    const quickSuggestions = [
        "What are land rates in Bapatla Town?",
        "Assess Kabja risk for absent owner",
        "How is the market near Suryalanka Beach?",
        "Check risk for no boundary wall"
    ];

    const handleQuickSuggestion = (suggestion) => {
        setInput(suggestion);
    };

    return (
        <div className="ai-agent-chat-container flex flex-col h-full bg-slate-50">
            <div className="chat-header p-4 border-b-2 border-govBlue bg-white">
                <div className="header-content">
                    <h1 className="text-lg font-bold text-govBlue flex items-center gap-2">
                        <span className="bg-blue-100 p-1.5 rounded-full"><Bot size={18} /></span>
                        GeoValuator Assistant
                    </h1>
                    <p className="text-xs text-slate-500 font-medium ml-9">Official AI Support & Risk Analysis</p>
                </div>
            </div>

            <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm border ${msg.type === 'user'
                            ? 'bg-govBlue text-white border-blue-700 rounded-br-none'
                            : 'bg-white text-slate-800 border-slate-200 rounded-bl-none'
                            }`}>
                            <div className="message-text">
                                {msg.text.split('\n').map((line, idx) => (
                                    <div key={idx} className={line.trim() === '' ? 'h-2' : ''}>
                                        {line.includes('**') ? (
                                            <span dangerouslySetInnerHTML={{
                                                __html: line
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                    .replace(/^(.*?):$/m, '<strong>$1:</strong>')
                                            }} />
                                        ) : (
                                            line
                                        )}
                                    </div>
                                ))}
                            </div>
                            <span className={`text-[10px] block mt-1 text-right ${msg.type === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg rounded-bl-none border border-slate-200 shadow-sm">
                            <div className="typing-indicator flex gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length === 1 && (
                <div className="px-4 pb-2">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-2">Suggested Inquiries:</p>
                    <div className="grid grid-cols-1 gap-2">
                        {quickSuggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                className="text-left text-xs p-2 bg-white border border-slate-200 hover:border-govBlue hover:text-govBlue rounded transition text-slate-600 font-medium"
                                onClick={() => handleQuickSuggestion(suggestion)}
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="chat-input-section p-4 bg-white border-t-2 border-slate-200">
                <div className="flex gap-2 relative">
                    <textarea
                        className="w-full bg-slate-50 border-2 border-slate-300 rounded-lg p-3 pr-12 focus:outline-none focus:border-govBlue focus:ring-1 focus:ring-govBlue text-sm resize-none font-medium text-slate-700 placeholder-slate-400"
                        placeholder="Type your query regarding land regulations..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={loading}
                        rows={2}
                    />
                    <button
                        className="absolute right-2 bottom-2 p-2 bg-govBlue text-white rounded hover:bg-govBlue/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        title="Send message"
                    >
                        {loading ? <Loader className="animate-spin" size={16} /> : <Send size={18} />}
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center font-bold">Official AI Assistant • Responses generated based on available records</p>
            </div>
        </div>
    );
};

export default AIAgentChat;
