import React, { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ noteId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const db = getFirestore();

  const fetchRatings = async () => {
    try {
      const docRef = doc(db, 'notes', noteId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAverageRating(data.averageRating || 0);
        setUserRating(data.userRating || 0);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const handleRating = async (newRating) => {
    try {
      const docRef = doc(db, 'notes', noteId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentRatings = data.ratings || [];
        const updatedRatings = [...currentRatings, newRating];
        const newAverageRating = updatedRatings.reduce((acc, val) => acc + val, 0) / updatedRatings.length;

        await setDoc(docRef, {
          ...data,
          ratings: updatedRatings,
          averageRating: newAverageRating,
          userRating: newRating
        });

        setAverageRating(newAverageRating);
        setUserRating(newRating);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [noteId]);

  const stars = Array(5).fill(false);

  return (
    <div>
      <div className="rating">
        {stars.map((_, index) => (
          <span
            key={index}
            onMouseEnter={() => setHoverRating(index + 1)}
            onMouseLeave={() => setHoverRating(null)}
            onClick={() => handleRating(index + 1)}
            style={{ cursor: 'pointer' }}
          >
            {hoverRating >= index + 1 || userRating >= index + 1 ? (
              index + 0.5 < userRating ? (
                <FaStar />
              ) : (
                <FaStarHalfAlt />
              )
            ) : (
              <FaRegStar />
            )}
          </span>
        ))}
      </div>
      <p>Average Rating: {averageRating.toFixed(1)}</p>
    </div>
  );
};

export default Rating;
