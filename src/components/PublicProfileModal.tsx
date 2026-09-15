import React from 'react';
import { useGame } from '../context/GameContext';
import { useScrollLock } from '../hooks/useScrollLock';
import { ProfileCard } from './ProfileCard';
import { CloseButton } from './common/CloseButton';

export const PublicProfileModal: React.FC = () => {
  useScrollLock(true);
  const { viewingProfileData, closePublicProfile } = useGame();

  return (
    <div
      onClick={closePublicProfile}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="absolute top-2 right-2 z-20">
          <CloseButton
            id="btn-close-public-profile"
            onClose={closePublicProfile}
            ariaLabel="Đóng thẻ hồ sơ công khai"
          />
        </div>

        <ProfileCard
          profile={viewingProfileData || undefined}
          isPublicView={true}
          onClose={closePublicProfile}
        />
      </div>
    </div>
  );
};
