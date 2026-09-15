const fs = require('fs');
let code = fs.readFileSync('src/components/AchievementsModal.tsx', 'utf-8');

code = code.replace(
  `export const AchievementsModal: React.FC = () => {
  const { achievements, claimAchievement, setActiveModal, openShareModal } = useGame();
  const [selectedCat, setSelectedCat] = useState<string>('Tất Cả');`,
  `import { useEffect } from 'react';

export const AchievementsModal: React.FC = () => {
  const { achievements, claimAchievement, setActiveModal, openShareModal, targetAchievementCategory, setTargetAchievementCategory } = useGame();
  const [selectedCat, setSelectedCat] = useState<string>('Tất Cả');

  useEffect(() => {
    if (targetAchievementCategory) {
      setSelectedCat(targetAchievementCategory);
      setTargetAchievementCategory(null);
    }
  }, [targetAchievementCategory, setTargetAchievementCategory]);`
);

// We should also remove the existing `import React, { useState } from 'react';` to `import React, { useState, useEffect } from 'react';`
// But I can just do a more precise replacement.
code = fs.readFileSync('src/components/AchievementsModal.tsx', 'utf-8');
code = code.replace(
  `import React, { useState } from 'react';`,
  `import React, { useState, useEffect } from 'react';`
);

code = code.replace(
  `export const AchievementsModal: React.FC = () => {
  const { achievements, claimAchievement, setActiveModal, openShareModal } = useGame();
  const [selectedCat, setSelectedCat] = useState<string>('Tất Cả');`,
  `export const AchievementsModal: React.FC = () => {
  const { achievements, claimAchievement, setActiveModal, openShareModal, targetAchievementCategory, setTargetAchievementCategory } = useGame();
  const [selectedCat, setSelectedCat] = useState<string>('Tất Cả');

  useEffect(() => {
    if (targetAchievementCategory) {
      setSelectedCat(targetAchievementCategory);
      // We don't want to immediately clear it if they want to see it, but clearing it after setting state is fine
      // because we only need it to initialize selectedCat.
      setTargetAchievementCategory(null);
    }
  }, [targetAchievementCategory, setTargetAchievementCategory]);`
);

fs.writeFileSync('src/components/AchievementsModal.tsx', code);
