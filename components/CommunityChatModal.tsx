
import React, { useMemo, useState, useRef, useEffect } from 'react';
import type { ChatPost } from '../types';
import StarRating from './StarRating';
import { dummyChatData } from '../data/dummyChatData';

interface CommunityChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  radius: number;
}

// A new interactive star rating component for review input
const InteractiveStarRating: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    const [hoverRating, setHoverRating] = useState(0);
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="text-3xl text-secondary opacity-50 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`w-7 h-7 transition-colors ${(hoverRating || rating) >= star ? 'text-amber-400 opacity-100' : ''}`} 
                        viewBox="0 0 20 20" 
                        fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};


const CommunityChatModal: React.FC<CommunityChatModalProps> = ({ isOpen, onClose, radius }) => {
  const [isRendering, setIsRendering] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendering(true);
    } else {
      setTimeout(() => setIsRendering(false), 400);
    }
  }, [isOpen]);

  // Component state for interactivity
  const [posts, setPosts] = useState<ChatPost[]>(dummyChatData);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewPlaceName, setReviewPlaceName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPosts = useMemo(() => {
    return posts
      .filter(post => post.distance <= radius)
      .sort((a, b) => b.id - a.id); // Show newest first
  }, [radius, posts]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsReviewing(false); // Can't do both at once
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendPost = () => {
    if (!newMessage.trim() && !imagePreview && (!isReviewing || !reviewPlaceName.trim())) return;

    const newPost: ChatPost = {
        id: Date.now(),
        author: 'You',
        avatarUrl: 'https://i.pravatar.cc/150?u=currentuser',
        content: newMessage,
        distance: 0, // User's own post is always at their location
        timestamp: 'Just now',
        imageUrl: imagePreview || undefined,
        placeRecommendation: isReviewing && reviewPlaceName.trim() && reviewRating > 0 ? {
            name: reviewPlaceName,
            rating: reviewRating,
        } : undefined,
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);

    // Reset composer
    setNewMessage('');
    setImagePreview(null);
    setIsReviewing(false);
    setReviewPlaceName('');
    setReviewRating(0);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isRendering) return null;

  const canSend = newMessage.trim() || imagePreview || (isReviewing && reviewPlaceName.trim() && reviewRating > 0);

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 modal-overlay animate-overlay-in ${!isOpen && 'animate-overlay-out'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
    >
      <div
        className={`glass-pane w-full max-w-2xl h-[90vh] overflow-hidden flex flex-col animate-slide-in ${!isOpen && 'animate-slide-out'}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b border-black/10 dark:border-white/10 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 id="chat-modal-title" className="text-xl font-bold text-primary">Community Chat</h2>
            <p className="text-sm text-secondary">Showing posts within {radius} km</p>
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

        <main className="flex-grow overflow-y-auto p-4 space-y-6 flex flex-col-reverse">
          {/* This empty div helps push content up from the bottom */}
          <div className="flex-shrink-0">
            {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 mt-6 animate-item-in">
                    <img src={post.avatarUrl} alt={`${post.author}'s avatar`} className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-primary">{post.author}</span>
                        <span className="text-xs text-secondary">{post.timestamp}</span>
                    </div>
                    <div className="mt-1 text-primary space-y-3">
                        {post.content && <p>{post.content}</p>}
                        {post.imageUrl && (
                        <img src={post.imageUrl} alt="User posted content" className="mt-2 rounded-2xl max-h-64 w-auto bg-black/10 dark:bg-white/10" />
                        )}
                        {post.placeRecommendation && (
                            <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-2xl">
                                <p className="font-semibold">{post.placeRecommendation.name}</p>
                                <StarRating rating={post.placeRecommendation.rating} />
                            </div>
                        )}
                    </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-secondary">No community posts in this area.</p>
                    <p className="text-sm text-secondary">Try increasing your search radius!</p>
                </div>
            )}
          </div>
        </main>

        <footer className="p-4 border-t border-black/10 dark:border-white/10 flex-shrink-0 bg-white/0">
            {/* Composer Previews */}
            {imagePreview && (
                <div className="mb-2 flex items-center gap-2">
                    <img src={imagePreview} alt="Selected preview" className="h-16 w-16 object-cover rounded-xl bg-black/10" />
                    <button onClick={() => {setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value = ''}} className="text-secondary hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                </div>
            )}
            {isReviewing && (
                 <div className="mb-2 p-3 bg-black/5 dark:bg-white/5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold">Add a Review</h4>
                        <button onClick={() => setIsReviewing(false)} className="text-secondary hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>
                    </div>
                    <input 
                        type="text" 
                        value={reviewPlaceName}
                        onChange={(e) => setReviewPlaceName(e.target.value)}
                        placeholder="Name of place"
                        className="glass-input w-full px-3 py-1.5 text-sm placeholder:text-secondary rounded-xl"
                    />
                    <InteractiveStarRating rating={reviewRating} setRating={setReviewRating} />
                 </div>
            )}

          <div className="flex items-center gap-2">
             <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share something..."
              className="glass-input flex-grow w-full px-4 py-3 text-base text-primary placeholder:text-secondary rounded-full"
            />
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
            
            <button onClick={() => fileInputRef.current?.click()} disabled={isReviewing} className="p-2 text-secondary hover:text-[color:var(--accent-color)] disabled:opacity-40 disabled:hover:text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
            <button onClick={() => {setIsReviewing(true); setImagePreview(null)}} disabled={!!imagePreview} className="p-2 text-secondary hover:text-[color:var(--accent-color)] disabled:opacity-40 disabled:hover:text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg></button>
            
            <button
                onClick={handleSendPost}
                disabled={!canSend}
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center glass-button-primary rounded-full disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CommunityChatModal;