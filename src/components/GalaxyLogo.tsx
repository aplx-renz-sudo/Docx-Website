import { useRef, useState } from 'react';
import astralLogo from '../assets/viledocx-astral-logo.png';

interface GalaxyLogoProps {
  size?: number;
  interactive?: boolean;
  sound?: boolean;
  label?: string;
}

/** Lightweight, local-only astral mark with CSS-driven interaction. */
export function GalaxyLogo({ size = 300, interactive = true, label = 'VileDocx astral logo' }: GalaxyLogoProps) {
  const logoRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const updateTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || !logoRef.current) return;
    const rect = logoRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    logoRef.current.style.setProperty('--tilt-x', `${-y * 9}deg`);
    logoRef.current.style.setProperty('--tilt-y', `${x * 11}deg`);
    logoRef.current.style.setProperty('--glow-x', `${50 + x * 22}%`);
    logoRef.current.style.setProperty('--glow-y', `${50 + y * 22}%`);
  };

  const resetTilt = () => {
    if (!logoRef.current) return;
    logoRef.current.style.setProperty('--tilt-x', '0deg');
    logoRef.current.style.setProperty('--tilt-y', '0deg');
    logoRef.current.style.setProperty('--glow-x', '50%');
    logoRef.current.style.setProperty('--glow-y', '50%');
  };

  const pulse = () => {
    if (!interactive) return;
    setActive(false);
    requestAnimationFrame(() => setActive(true));
  };

  return (
    <div
      ref={logoRef}
      className={`astral-logo${interactive ? ' is-interactive' : ''}${active ? ' is-pulsing' : ''}`}
      style={{ width: size, height: size }}
      role={interactive ? 'button' : 'img'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      title={interactive ? 'Move around me, or tap to make a wish ✦' : undefined}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
      onClick={pulse}
      onKeyDown={event => {
        if (interactive && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          pulse();
        }
      }}
    >
      <span className="astral-logo-orbit astral-logo-orbit-one" aria-hidden="true" />
      <span className="astral-logo-orbit astral-logo-orbit-two" aria-hidden="true" />
      <span className="astral-logo-glow" aria-hidden="true" />
      <img className="astral-logo-art" src={astralLogo} alt="" draggable={false} />
      {Array.from({ length: 8 }, (_, index) => <span key={index} className={`astral-logo-mote mote-${index + 1}`} aria-hidden="true" />)}
    </div>
  );
}

export function GalaxyLogoMini({ size = 26 }: { size?: number }) {
  return (
    <span className="astral-logo-mini" style={{ width: size, height: size }} aria-hidden="true">
      <img src={astralLogo} alt="" draggable={false} />
    </span>
  );
}
