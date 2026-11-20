import { useEffect, useRef, type CSSProperties } from 'react';
import { folkPowerAt } from '../folk-duel/online-protocol';

interface NlcPowerMeterProps {
  power: number;
  since?: number;
  readArrivalTime?: () => number;
  paused: boolean;
}

export function NlcPowerMeter({ power, since, readArrivalTime, paused }: NlcPowerMeterProps) {
  const meterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const meter = meterRef.current;
    if (!meter || since === undefined || !readArrivalTime || paused) return;
    let frame = 0;
    // Paint from the current server-clock estimate without refreshing the room or court.
    const draw = () => {
      const position = String(folkPowerAt(since, readArrivalTime()));
      if (meter.dataset.folkPower !== position) {
        meter.dataset.folkPower = position;
        meter.style.setProperty('--nlc-power', position + '%');
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [since, readArrivalTime, paused]);

  return (
    <div ref={meterRef} className="nlc-power-meter" aria-hidden="true" data-folk-power={power}
      style={{ '--nlc-power': `${power}%` } as CSSProperties}>
      <div className="nlc-power-green" />
      <div className="nlc-power-perfect" />
      <div className="nlc-power-marker" />
    </div>
  );
}
