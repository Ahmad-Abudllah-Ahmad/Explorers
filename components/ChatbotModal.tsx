import React, { useState, useEffect, useRef } from 'react';
import type { Place, ChatMessage, GeoLocation } from '../types';
import { GoogleGenAI, Chat } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const ChatbotIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${className}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.897 5.515 4.599 6.954.004.001.008.002.012.003C6.08 18.067 2 19.385 2 21c0 .552.447 1 1 1h18c.553 0 1-.448 1-1 0-1.615-4.08-2.933-4.611-4.043.004-.001.008-.002.012-.003C19.103 15.515 22 12.908 22 10c0-4.411-4.486-8-10-8zm0 13c-1.487 0-2.833-.35-3.978-.957a1 1 0 00-1.23.208l-1.55 1.86A10.02 10.02 0 014 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" />
        <path d="M7.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);

interface ChatbotModalProps {
    isOpen: boolean;
    onClose: () => void;
    contextPlace: Place | null;
    location: GeoLocation | null;
    address: string | null;
}

// A simple markdown to HTML converter for the chatbot's structured responses.
const markdownToHtml = (markdown: string): string => {
  // 1. Process inline styles like **bold**
  let html = markdown
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-primary/90">$1</strong>');
  
  // 2. Process block styles line-by-line
  let inList = false;
  const lines = html.split('\n');
  html = lines.map(line => {
    let processedLine = '';

    // If we were in a list and the new line is not a list item or is empty, close the list.
    if (inList && (!line.trim().startsWith('* ') || line.trim() === '')) {
      processedLine += '</ul>';
      inList = false;
    }

    // ### Headings
    if (line.startsWith('### ')) {
      processedLine += `<h3 class="text-xl font-bold text-primary mt-4 mb-2">${line.substring(4)}</h3><hr class="border-black/10 dark:border-white/10 mb-3" />`;
    }
    // * List items
    else if (line.trim().startsWith('* ')) {
      if (!inList) {
        processedLine += '<ul class="list-disc list-outside space-y-1 pl-5 text-secondary">';
        inList = true;
      }
      processedLine += `<li class="mb-1">${line.trim().substring(2)}</li>`;
    }
    // Empty line (creates a paragraph break)
    else if (line.trim() === '') {
       // We don't output anything, creating a visual break.
    }
    // Paragraph
    else {
      processedLine += `<p class="text-secondary leading-relaxed mb-2">${line}</p>`;
    }

    return processedLine;
  }).join('');

  // 3. Close any open list at the end of the text
  if (inList) {
    html += '</ul>';
  }

  return html;
}


const ChatbotModal: React.FC<ChatbotModalProps> = ({ isOpen, onClose, contextPlace, location, address }) => {
    const [isRendering, setIsRendering] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
        } else {
            setTimeout(() => setIsRendering(false), 400); // Match animation duration
        }
    }, [isOpen]);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isRendering && isOpen) {
            const placeContext = contextPlace
                ? `The user is specifically asking about "${contextPlace.title}". Context: ${contextPlace.description}`
                : "The user is asking for general information about their current area.";
            
            const locationContext = (location && address) 
                ? `CRITICAL CONTEXT: The user's current location is near "${address}" (Coordinates: Lat ${location.latitude}, Lon ${location.longitude}). All of your responses about "nearby" or "local" places must be based on this location.`
                : "The user's location is unknown.";

            const systemInstruction = `You are Explorer AI, an enthusiastic, world-class tour guide. Your responses must be accurate, to the point, and use Google Search for the most current information. **Keep your answers concise and avoid unnecessary fluff.**
Your tone must be warm, welcoming, and elegant.
**Crucially, every response MUST be formatted in Markdown.**
Structure the information beautifully like a high-quality travel guide.
Use '### ' for main headings.
For lists of key facts, introduce them with a bolded subheading (e.g., **Key Facts about the Temple's Heritage:**) followed immediately by a bulleted list on new lines.
In list items, bold the key topic followed by a colon (e.g., * **Epic Connection:** Legend holds that...).

Example Format:
### A Divine Welcome to [Place Name]
Welcome to the spiritual embrace of the [Place Name], a truly enchanting sanctuary where history, devotion, and artistic brilliance converge to offer a deeply moving experience.

### The Sacred Legacy of Goswami Tulsidas
The temple is dedicated primarily to Lord Rama, but its heart lies in celebrating the legacy of the revered poet-saint, Goswami Tulsidas.

**Key Facts about the Temple's Heritage:**
* **Epic Connection:** Legend holds that Tulsidas penned his magnum opus, the Ramcharitmanas, right in this vicinity during the 16th century AD.
* **Literary Impact:** By rendering the Ramayana in the common Awadhi language, Tulsidas made the sacred story of Lord Rama accessible to the masses, a pivotal moment in Hindu literature.
* **Deities:** Beyond Lord Rama, the temple houses beautiful idols of Sita, Lakshmana, and Hanuman, completing the revered Ram Darbar.

### Architectural Splendor and Spiritual Atmosphere
The temple's architecture showcases a striking blend of traditional Hindu temple design with Mughal influences...

Do not mention that you are an AI or that you are using Google Search. Simply present the information as a knowledgeable guide.
If a user asks who created or built you, respond with: "I was developed by AAAhmad AI ENG. You can find more about my developer at (https://aaahmadthedev.vercel.app/)".
${locationContext}
${placeContext}`;
            
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { 
                    systemInstruction,
                    tools: [{ googleSearch: {} }],
                },
            });

            const greeting = contextPlace
                ? `Ahlan wa sahlan! Welcome, fellow explorer! I'm Explorer AI. You're asking about ${contextPlace.title}. What wonders can I reveal for you?`
                : `Ahlan wa sahlan! Welcome, fellow explorer! I'm Explorer AI, your guide to this area. What would you like to discover?`;
            
            setMessages([{ id: 'greeting', role: 'model', text: greeting }]);
        } else {
            setMessages([]);
            setInput('');
            setIsLoading(false);
            chatRef.current = null;
        }
    }, [isRendering, isOpen, contextPlace, location, address]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chatRef.current.sendMessageStream({ message: input });
            
            let modelResponse = '';
            const modelMessageId = 'model-streaming-response';
            setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: modelResponse } : msg
                ));
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { id: 'error-response', role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isRendering) return null;

    return (
        <div
          className={`fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`glass-pane w-full max-w-2xl h-[85vh] sm:h-[70vh] overflow-hidden flex flex-col animate-slide-in ${!isOpen && 'animate-slide-out'}`}
            onClick={e => e.stopPropagation()}
          >
            <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <ChatbotIcon className="text-[color:var(--accent-color)]" />
                <div>
                    <h2 className="text-lg font-bold text-primary">Explorer AI</h2>
                    {contextPlace && <p className="text-xs text-secondary">Context: {contextPlace.title}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close chat"
                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
    
            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <ChatbotIcon className="w-8 h-8 self-start text-secondary opacity-50 flex-shrink-0" />}
                        <div className={`max-w-md md:max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[color:var(--accent-color)] text-white rounded-br-none shadow-md' : 'bg-black/5 dark:bg-white/10 text-primary rounded-bl-none'}`}>
                           {msg.role === 'user'
                                ? <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                : <div className="text-sm" dangerouslySetInnerHTML={{ __html: markdownToHtml(msg.text) }} />
                           }
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length-1]?.role === 'user' && (
                    <div className="flex items-end gap-2 justify-start">
                        <ChatbotIcon className="w-8 h-8 self-start text-secondary opacity-50 flex-shrink-0" />
                        <div className="max-w-md md:max-w-lg p-3 rounded-2xl bg-black/5 dark:bg-white/10 rounded-bl-none flex items-center">
                            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:0.1s] mx-1"></div>
                            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </main>
            
            <footer className="p-4 border-t border-black/10 dark:border-white/10 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                     <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Explorer AI..."
                        disabled={isLoading}
                        className="glass-input flex-grow w-full px-4 py-3 text-base text-primary rounded-full"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0 w-11 h-11 flex items-center justify-center glass-button-primary rounded-full disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </form>
            </footer>
          </div>
        </div>
    );
};

export default ChatbotModal;