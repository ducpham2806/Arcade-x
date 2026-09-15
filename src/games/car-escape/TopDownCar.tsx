import React from 'react';

export const TopDownCar: React.FC<{ 
  color: string; 
  length: number; 
  isHorizontal: boolean; 
  isTarget?: boolean;
  skinId?: string | null;
}> = ({ color, length, isHorizontal, isTarget, skinId }) => {
  const isTruck = length >= 3;
  
  // Logical drawing dimensions (always drawn as if vertical)
  const drawW = 100;
  const drawH = length * 100;
  
  // SVG viewBox dimensions
  const viewBoxW = isHorizontal ? drawH : drawW;
  const viewBoxH = isHorizontal ? drawW : drawH;
  
  // Transform horizontal drawing
  const groupTransform = isHorizontal ? `translate(0, 100) rotate(-90)` : "";

  const arrowColor = "rgba(255, 255, 255, 0.9)";
  const centerY = drawH / 2;
  const centerX = drawW / 2;
  const arrowOffset = isTruck ? 80 : 50;

  let activeColor = color;
  if (skinId) {
    if (skinId === 'skin-car-escape-police' && isTarget) activeColor = '#1d4ed8'; // Blue for police
    if (skinId === 'skin-car-escape-sport' && isTarget) activeColor = '#fbbf24'; // Yellow/Gold for sport
  }

  return (
    <div className="w-full h-full flex items-center justify-center relative pointer-events-none drop-shadow-md transition-transform">
      <svg width="100%" height="100%" viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} preserveAspectRatio="none" className="overflow-visible drop-shadow-sm">
        <g transform={groupTransform}>
          {/* Scaled Car Body & Details Group (~70% scale centered) */}
          <g transform={`translate(50, ${drawH / 2}) scale(0.7) translate(-50, ${-drawH / 2})`}>
            {/* Shadow */}
            <rect x="2" y="5" width="96" height={drawH - 10} rx="15" fill="rgba(0,0,0,0.25)" />

            {isTruck ? (
              <g>
                {/* Truck Cab */}
                <rect x="5" y="5" width="90" height="90" rx="15" fill={activeColor} />
                <rect x="10" y="40" width="80" height="40" rx="5" fill="#1a1a2e" /> {/* windshield */}
                <rect x="20" y="5" width="60" height="20" rx="3" fill="rgba(255,255,255,0.4)" /> {/* roof highlights */}
                
                {/* Truck Trailer */}
                <rect x="5" y="100" width="90" height={drawH - 105} rx="8" fill="#cbd5e1" />
                <rect x="15" y="110" width="70" height={drawH - 125} rx="4" fill="#94a3b8" />
                
                {/* Cab details */}
                <circle cx="20" cy="15" r="6" fill="#fef08a" />
                <circle cx="80" cy="15" r="6" fill="#fef08a" />
              </g>
            ) : (
              <g>
                {/* Sedan Body */}
                <rect x="5" y="5" width="90" height={drawH - 10} rx="20" fill={activeColor} />
                {/* Windshield */}
                <path d="M 15 60 L 85 60 L 75 85 L 25 85 Z" fill="#1a1a2e" />
                {/* Rear window */}
                <path d={`M 20 ${drawH - 35} L 80 ${drawH - 35} L 75 ${drawH - 55} L 25 ${drawH - 55} Z`} fill="#1a1a2e" />
                {/* Roof */}
                <rect x="20" y="90" width="60" height={drawH - 150} rx="8" fill="rgba(255,255,255,0.15)" />
                {/* Headlights */}
                <ellipse cx="20" cy="15" rx="8" ry="5" fill="#fef08a" />
                <ellipse cx="80" cy="15" rx="8" ry="5" fill="#fef08a" />
                {/* Taillights */}
                <rect x="15" y={drawH - 20} width="20" height="8" rx="2" fill="#ef4444" />
                <rect x="65" y={drawH - 20} width="20" height="8" rx="2" fill="#ef4444" />
              </g>
            )}
            
            {/* Target Vehicle Styling (Ambulance / Police / Sport) */}
            {isTarget && (
              <g>
                {skinId === 'skin-car-escape-police' ? (
                  // Police Car
                  <g>
                    <rect x="5" y="5" width="90" height={drawH - 10} rx="20" fill="#ffffff" />
                    <rect x="5" y="80" width="90" height={60} fill="#1d4ed8" /> {/* Blue side stripe */}
                    <path d="M 15 60 L 85 60 L 75 85 L 25 85 Z" fill="#1a1a2e" />
                    <path d={`M 20 ${drawH - 35} L 80 ${drawH - 35} L 75 ${drawH - 55} L 25 ${drawH - 55} Z`} fill="#1a1a2e" />
                    <rect x="20" y="90" width="60" height={drawH - 150} rx="8" fill="#111827" /> {/* Black roof */}
                    {/* Siren lights */}
                    <rect x="25" y="105" width="25" height="12" rx="3" fill="#ef4444" />
                    <rect x="50" y="105" width="25" height="12" rx="3" fill="#3b82f6" />
                    {/* Star logo */}
                    <circle cx="50" cy="150" r="12" fill="#fbbf24" />
                  </g>
                ) : skinId === 'skin-car-escape-sport' ? (
                  // Sport Car
                  <g>
                    <rect x="5" y="5" width="90" height={drawH - 10} rx="25" fill="#f59e0b" />
                    <rect x="35" y="5" width="10" height={drawH - 10} fill="#111827" /> {/* Racing stripe */}
                    <rect x="55" y="5" width="10" height={drawH - 10} fill="#111827" /> {/* Racing stripe */}
                    <path d="M 10 70 L 90 70 L 80 95 L 20 95 Z" fill="#1a1a2e" />
                    <path d={`M 15 ${drawH - 35} L 85 ${drawH - 35} L 80 ${drawH - 60} L 20 ${drawH - 60} Z`} fill="#1a1a2e" />
                    {/* Headlights sleek */}
                    <path d="M 10 25 L 35 10 L 30 35 Z" fill="#fef08a" />
                    <path d="M 90 25 L 65 10 L 70 35 Z" fill="#fef08a" />
                  </g>
                ) : (
                  // Default Ambulance
                  <g>
                    <rect x="5" y="5" width="90" height={drawH - 10} rx="15" fill="#ffffff" />
                    <rect x="40" y="10" width="20" height={drawH - 20} fill="#ef4444" /> {/* Red stripe */}
                    <path d="M 15 50 L 85 50 L 75 80 L 25 80 Z" fill="#1a1a2e" />
                    {/* Siren lights */}
                    <circle cx="35" cy="65" r="10" fill="#3b82f6" />
                    <circle cx="65" cy="65" r="10" fill="#ef4444" />
                    {/* Red cross */}
                    <rect x="42" y="100" width="16" height="40" fill="#ffffff" />
                    <rect x="30" y="112" width="40" height="16" fill="#ffffff" />
                    <rect x="44" y="102" width="12" height="36" fill="#ef4444" />
                    <rect x="32" y="114" width="36" height="12" fill="#ef4444" />
                  </g>
                )}
              </g>
            )}
            {/* Refined Small Direction Arrows at Both Ends (Subtle & proportional) */}
            <g stroke="rgba(255, 255, 255, 0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))">
              {/* Top arrow pointing UP */}
              <path d="M 44 24 L 50 16 L 56 24" />
              {/* Bottom arrow pointing DOWN */}
              <path d={`M 44 ${drawH - 24} L 50 ${drawH - 16} L 56 ${drawH - 24}`} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
