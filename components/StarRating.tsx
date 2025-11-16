
import React from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
}

const Star: React.FC<{ fill: string }> = ({ fill }) => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill={fill} xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 5, className = '' }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

  const starColor = "currentColor";
  const emptyColor = "none";
  const strokeColor = "currentColor";

  return (
    <div className={`flex items-center text-amber-400 ${className}`} aria-label={`Rating: ${rating} out of ${maxRating} stars.`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill={starColor} />
      ))}
      {halfStar && (
        <div className="relative">
            <Star key="half-empty" fill={emptyColor} />
            <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                <Star key="half-full" fill={starColor} />
            </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
         <svg key={`empty-${i}`} className="w-4 h-4 opacity-30" viewBox="0 0 20 20" fill={emptyColor} stroke={strokeColor} strokeWidth="1.5" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
