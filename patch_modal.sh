sed -i 's/max-h-\[calc(100vh-9.5rem)\] sm:max-h-\[calc(100vh-6.5rem)\] flex flex-col overflow-hidden/flex flex-col/g' src/components/DailyLoginRewardModal.tsx
sed -i 's/backdrop-blur-sm animate-in fade-in duration-300/backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto/g' src/components/DailyLoginRewardModal.tsx
sed -i 's/overflow-y-auto flex-1//g' src/components/DailyLoginRewardModal.tsx
