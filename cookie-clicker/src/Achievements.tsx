import React, { memo } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  redeemed: boolean;
  reward: number;
}

interface AchievementsProps {
  achievements: Achievement[];
  onClaimReward: (id: string) => void;
  onClose: () => void;
}

const Achievements: React.FC<AchievementsProps> = memo(({ achievements, onClaimReward, onClose }) => {
  return (
    <div className="achievements-overlay">
      <div className="achievements-content">
        <h2>Achievements</h2>
        <button className="close-button" onClick={onClose}>&times;</button>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`achievement ${achievement.achieved ? 'achieved' : ''} ${achievement.redeemed ? 'redeemed' : ''}`}>
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              {achievement.achieved && !achievement.redeemed && (
                <button onClick={() => onClaimReward(achievement.id)}>
                  Claim {achievement.reward} Mystical Cookies
                </button>
              )}
              {achievement.redeemed && <span className="redeemed-text">Redeemed</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Achievements;