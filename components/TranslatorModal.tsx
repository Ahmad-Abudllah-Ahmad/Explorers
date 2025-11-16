
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, Blob } from '@google/genai';
import type { ConversationEntry } from '../types';

// --- Gemini and Audio Setup ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const languages = {
    'Auto-Detect': 'auto', 'English': 'en', 'Spanish': 'es', 'French': 'fr', 
    'German': 'de', 'Italian': 'it', 'Portuguese': 'pt', 'Russian': 'ru',
    'Japanese': 'ja', 'Korean': 'ko', 'Mandarin': 'zh', 'Arabic': 'ar', 'Hindi': 'hi'
};

// --- Audio Helper Functions from @google/genai-sdk ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Icons ---
const SpeakerIcon = ({ isLoading }: { isLoading?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M5.073 9.012A1 1 0 016 8h2.343a1 1 0 01.95.684l.5 2a1 1 0 01-.447 1.118l-2 1A1 1 0 016 12H5a1 1 0 01-1-1v-1a1 1 0 01.073-.375l.001-.001zM11 8a1 1 0 100 2h2a1 1 0 100-2h-2z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v10.5a.75.75 0 01-1.5 0V4.75A.75.75 0 0110 4z" clipRule="evenodd" />
    </svg>
);


// --- Component ---
const TranslatorModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [isRendering, setIsRendering] = useState(isOpen);
    const [myLanguage, setMyLanguage] = useState('English');
    const [theirLanguage, setTheirLanguage] = useState('Auto-Detect');
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
    const [conversation, setConversation] = useState<ConversationEntry[]>([]);
    const [isRecording, setIsRecording] = useState<'me' | 'them' | null>(null);
    const [nowPlaying, setNowPlaying] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sessionPromise = useRef<ReturnType<typeof ai.live.connect> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const currentTranscriptionRef = useRef('');

    useEffect(() => {
        if (isOpen) {
            setIsRendering(true);
        } else {
            setTimeout(() => setIsRendering(false), 400);
        }
    }, [isOpen]);
    
    const cleanupAudio = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close().catch(console.error);
        sessionPromise.current?.then(session => session.close()).catch(console.error);
        
        streamRef.current = null;
        scriptProcessorRef.current = null;
        inputAudioContextRef.current = null;
        sessionPromise.current = null;
    }, []);

    useEffect(() => {
        if (isRendering && isOpen) {
            setError(null);
            setConversation([]);
            setDetectedLanguage(null);
        } else if (!isOpen) {
            cleanupAudio();
            outputAudioContextRef.current?.close().catch(console.error);
            outputAudioContextRef.current = null;
        }
    }, [isRendering, isOpen, cleanupAudio]);

    const processTranslation = async (text: string, speaker: 'me' | 'them') => {
        let sourceLang = speaker === 'me' ? myLanguage : (detectedLanguage || theirLanguage);
        let targetLang = speaker === 'me' ? (detectedLanguage || theirLanguage) : myLanguage;
        
        if (sourceLang === 'Auto-Detect' && text.trim()) {
            try {
                const langDetectResponse = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `What language is this? Respond with only the name of the language (e.g., "Spanish"). Text: "${text}"`,
                });
                const detected = langDetectResponse.text.trim();
                const matchedLang = Object.keys(languages).find(l => detected.toLowerCase().includes(l.toLowerCase()));
                if (matchedLang) {
                    setDetectedLanguage(matchedLang);
                    sourceLang = matchedLang;
                    targetLang = myLanguage;
                } else {
                    throw new Error("Language not detected");
                }
            } catch (e) {
                console.error(e);
                setConversation(prev => prev.map(c => c.isFinal ? c : {...c, translated: "Could not detect language.", isFinal: true}));
                return;
            }
        }
        
        if (!text.trim()) {
             setConversation(prev => prev.map(c => c.isFinal ? c : {...c, translated: "[No speech detected]", isFinal: true}));
             return;
        }

        try {
            const translateResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Translate the following text from ${sourceLang} to ${targetLang}: "${text}"`,
            });
            const translation = translateResponse.text;
            setConversation(prev => prev.map(c => c.isFinal ? c : { ...c, translated: translation, isFinal: true }));
        } catch (e) {
            console.error("Translation error:", e);
            setConversation(prev => prev.map(c => c.isFinal ? c : {...c, translated: "Translation failed.", isFinal: true}));
        }
    };

    const handlePlayback = async (text: string, entryId: number) => {
        if (!text || nowPlaying) return;
        setNowPlaying(entryId);
        setError(null);
        try {
            if (!outputAudioContextRef.current) {
                // @ts-ignore
                outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioCtx = outputAudioContextRef.current;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => setNowPlaying(null);
                source.start();
            } else {
                throw new Error("No audio data received.");
            }
        } catch (err) {
            console.error("Playback error:", err);
            setError("Could not play audio.");
            setNowPlaying(null);
        }
    };

    const startRecording = async (speaker: 'me' | 'them') => {
        if (!isOpen || isRecording) return;
        setIsRecording(speaker);
        setError(null);
        currentTranscriptionRef.current = '';
        const newEntry: ConversationEntry = { id: Date.now(), speaker, original: '...', translated: '', isFinal: false };
        setConversation(prev => [...prev, newEntry]);

        try {
            if (!sessionPromise.current) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                
                // @ts-ignore
                const context = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                inputAudioContextRef.current = context;
                
                const source = context.createMediaStreamSource(stream);
                const processor = context.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current = processor;

                processor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromise.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(console.error);
                };
                source.connect(processor);
                processor.connect(context.destination);

                sessionPromise.current = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    config: { inputAudioTranscription: {} },
                    callbacks: {
                        onopen: () => console.log('Live session opened.'),
                        onclose: () => {
                            console.log('Live session closed.');
                            cleanupAudio();
                        },
                        onerror: (e) => {
                            console.error('Live session error:', e);
                            setError("A connection error occurred.");
                            cleanupAudio(); // Reset connection on error
                        },
                        onmessage: (msg) => {
                            const transcription = msg.serverContent?.inputTranscription?.text;
                            if (transcription) {
                                currentTranscriptionRef.current += transcription;
                                setConversation(prev => prev.map(c => c.isFinal ? c : {...c, original: currentTranscriptionRef.current + '...' }));
                            }
                            if (msg.serverContent?.turnComplete) {
                                setConversation(prev => prev.map(c => c.isFinal ? c : {...c, original: currentTranscriptionRef.current }));
                                processTranslation(currentTranscriptionRef.current, speaker);
                            }
                        },
                    },
                });
            }
        } catch (err) {
            console.error('Mic/session error:', err);
            setError("Could not access microphone. Please grant permission.");
            setIsRecording(null);
            setConversation(prev => prev.filter(c => c.id !== newEntry.id));
            cleanupAudio();
        }
    };

    const stopRecording = () => {
        setIsRecording(null);
    };
    
    const MicButton = ({ who }: { who: 'me' | 'them' }) => {
        const lang = who === 'me' ? myLanguage : (detectedLanguage || theirLanguage);
        const isActive = isRecording === who;
        return (
            <button
                onMouseDown={() => startRecording(who)}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={(e) => { e.preventDefault(); startRecording(who); }}
                onTouchEnd={stopRecording}
                className={`w-full py-4 px-2 flex flex-col items-center justify-center rounded-3xl transition-all duration-200 text-white
                    ${isActive ? 'bg-red-500 shadow-lg scale-105' : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 active:scale-95'}
                `}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                <span className="mt-2 font-semibold">{lang}</span>
                <span className="text-xs">{isActive ? "Listening..." : "Hold to Speak"}</span>
            </button>
        )
    }

    if (!isRendering) return null;

    return (
        <div className={`fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`} onClick={onClose}>
          <div className={`glass-pane w-full max-w-2xl h-[90vh] overflow-hidden flex flex-col animate-slide-in ${!isOpen && 'animate-slide-out'}`} onClick={e => e.stopPropagation()}>
            <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-primary">Live Translator</h2>
                <button onClick={onClose} aria-label="Close" className="p-2 text-secondary hover:text-primary rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            <div className="p-2 sm:p-4 grid grid-cols-2 gap-2 sm:gap-4 border-b border-black/10 dark:border-white/10">
                {(['me', 'them'] as const).map(p => (
                    <div key={p}>
                        <label className="text-sm font-medium text-secondary">{p === 'me' ? 'I Speak' : 'They Speak'}</label>
                        <select 
                            value={p === 'me' ? myLanguage : theirLanguage}
                            onChange={(e) => p === 'me' ? setMyLanguage(e.target.value) : setTheirLanguage(e.target.value)}
                            className="glass-input text-primary w-full mt-1 p-2 rounded-xl"
                        >
                            {Object.entries(languages).map(([lang, code]) => (
                                <option key={code} value={lang} className="bg-white dark:bg-black text-primary">{lang}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <main className="flex-grow overflow-y-auto p-4 space-y-4">
                {error && <div className="text-center p-2 bg-red-500/10 text-red-400 rounded-xl text-sm">{error}</div>}
                {conversation.map(entry => (
                    <div key={entry.id} className={`flex flex-col ${entry.speaker === 'me' ? 'items-end' : 'items-start'}`}>
                        <div className={`relative group w-11/12 p-3 rounded-2xl ${entry.speaker === 'me' ? 'bg-[color:var(--accent-color)] text-white rounded-br-none shadow-md' : 'bg-black/5 dark:bg-white/10 rounded-bl-none text-primary'}`}>
                            <p className="text-sm opacity-80">{entry.original}</p>
                            <p className="font-semibold mt-1 pr-6">{entry.translated || '...'}</p>
                            {entry.isFinal && entry.translated && !entry.translated.startsWith('[') && (
                                <button
                                    onClick={() => handlePlayback(entry.translated, entry.id)}
                                    disabled={!!nowPlaying}
                                    className="absolute bottom-2 right-2 p-1 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Play translation"
                                >
                                    <SpeakerIcon isLoading={nowPlaying === entry.id} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {conversation.length === 0 && !error && (
                    <div className="text-center text-secondary pt-10">
                        <p>Press and hold a microphone button to start translating.</p>
                    </div>
                )}
            </main>

            <footer className="p-4 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-4">
                <MicButton who="them" />
                <MicButton who="me" />
            </footer>
          </div>
        </div>
    );
};

export default TranslatorModal;