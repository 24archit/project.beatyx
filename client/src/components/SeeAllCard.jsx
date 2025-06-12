import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rows3 } from 'lucide-react'; // Unique Lucide icon
import '../assets/styles/SeeAllCard.css';

const SeeAllCard = ({routeTo}) => {
  const navigate = useNavigate();

  return (
    <div className="card-container" onClick={() => navigate(routeTo)} style={{ cursor: 'pointer' }}>
      <div className="card see-all-glass-card">
        <div className="icon-wrapper">
          <div className="icon-glow">
            <Rows3 className="see-all-big-icon" />
          </div>
          <p className="see-all-label">Browse All</p>
        </div>
      </div>
    </div>
  );
};

export default SeeAllCard;
