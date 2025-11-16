
import React from 'react';

const ChatbotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.897 5.515 4.599 6.954.004.001.008.002.012.003C6.08 18.067 2 19.385 2 21c0 .552.447 1 1 1h18c.553 0 1-.448 1-1 0-1.615-4.08-2.933-4.611-4.043.004-.001.008-.002.012-.003C19.103 15.515 22 12.908 22 10c0-4.411-4.486-8-10-8zm0 13c-1.487 0-2.833-.35-3.978-.957a1 1 0 00-1.23.208l-1.55 1.86A10.02 10.02 0 014 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" />
        <path d="M7.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM16.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
    </svg>
);

interface ChatbotFABProps {
    onClick: () => void;
}

const ChatbotFAB: React.FC<ChatbotFABProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 w-16 h-16 glass-button-primary rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110"
            aria-label="Open Explorer AI"
        >
            <ChatbotIcon />
        </button>
    );
};

export default ChatbotFAB;
