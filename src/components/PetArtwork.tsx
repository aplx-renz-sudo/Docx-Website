import React from 'react';
import type { PetId } from '../types';
import type { PetMood } from './PetCompanion';

interface PetArtworkProps {
  petId: PetId;
  mood?: PetMood;
  size?: number | string;
  className?: string;
  animate?: boolean;
  hasPumpkin?: boolean;
}

/**
 * Tiny matching green pumpkin stem sprout and leaf clip worn on the pet's ear/head.
 * This complements the pumpkin costume they are wearing without being a giant pumpkin on their head.
 */
export function PumpkinHeadSprout({
  x = 50,
  y = 20,
  scale = 1,
  rotation = 0,
  className = '',
}: {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  className?: string;
}) {
  return (
    <g
      transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}
      className={`pumpkin-head-sprout select-none pointer-events-none ${className}`}
    >
      {/* Curly vine stem */}
      <path
        d="M 0 0 C -2 -4 -5 -6 -3 -10 C -1 -13 3 -12 2 -8 C 1 -5 1 -2 0 0"
        fill="none"
        stroke="#2e7d32"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Cute curly tendril */}
      <path
        d="M 1 -8 Q 5 -10 6 -7 Q 6 -4 3 -5"
        fill="none"
        stroke="#81c784"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      {/* Vibrant leaf */}
      <path
        d="M 0 -4 C -5 -7 -8 -6 -7 -2 C -6 2 -1 0 0 -4 Z"
        fill="#4caf50"
        stroke="#1b5e20"
        strokeWidth="0.4"
      />
      {/* Small leaf rib */}
      <path d="M 0 -4 Q -4 -3 -6 -2" stroke="#81c784" strokeWidth="0.4" fill="none" />
      {/* Little pumpkin costume button attachment */}
      <ellipse cx="0" cy="0.5" rx="2.4" ry="1.2" fill="#ff7043" stroke="#d84315" strokeWidth="0.4" />
    </g>
  );
}

/**
 * Reusable Pumpkin Costume Suit that pets wear around their body/torso!
 * Features:
 * - Plump, round organic pumpkin segments with 3D gradient shading
 * - Cute scalloped emerald-green leafy collar around the neck opening
 * - Adorable glowing jack-o'-lantern carved face on the tummy
 * - Paws sit comfortably in front or at the bottom rim
 */
export function PumpkinCostumeBody({
  cx = 50,
  cy = 68,
  rx = 24,
  ry = 20,
  neckY = 51,
  showFace = true,
  mood = 'idle',
  idPrefix = 'pc',
  className = '',
}: {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  neckY?: number;
  showFace?: boolean;
  mood?: PetMood;
  idPrefix?: string;
  className?: string;
}) {
  const uid = `${idPrefix}_${Math.round(cx)}_${Math.round(cy)}`;

  return (
    <g className={`pumpkin-costume-body ${className}`}>
      <defs>
        <radialGradient id={`ps-skin-${uid}`} cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffa726" />
          <stop offset="45%" stopColor="#ff7043" />
          <stop offset="85%" stopColor="#e64a19" />
          <stop offset="100%" stopColor="#bf360c" />
        </radialGradient>
        <radialGradient id={`ps-lobe-${uid}`} cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#ff9800" />
          <stop offset="60%" stopColor="#f4511e" />
          <stop offset="100%" stopColor="#a72800" />
        </radialGradient>
        <linearGradient id={`ps-leaf-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5d6a7" />
          <stop offset="35%" stopColor="#4caf50" />
          <stop offset="85%" stopColor="#2e7d32" />
          <stop offset="100%" stopColor="#1b5e20" />
        </linearGradient>
        <filter id={`ps-glow-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.4" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Ground contact shadow underneath the pumpkin suit */}
      <ellipse cx={cx} cy={cy + ry + 3} rx={rx * 0.85} ry="3.5" fill="#000000" opacity="0.32" />

      {/* Back outer lobes */}
      <ellipse cx={cx - 15} cy={cy} rx={rx * 0.44} ry={ry * 0.92} fill={`url(#ps-lobe-${uid})`} />
      <ellipse cx={cx + 15} cy={cy} rx={rx * 0.44} ry={ry * 0.92} fill={`url(#ps-lobe-${uid})`} />

      {/* Mid contour lobes */}
      <ellipse cx={cx - 8.5} cy={cy + 0.5} rx={rx * 0.52} ry={ry * 0.96} fill={`url(#ps-skin-${uid})`} />
      <ellipse cx={cx + 8.5} cy={cy + 0.5} rx={rx * 0.52} ry={ry * 0.96} fill={`url(#ps-skin-${uid})`} />

      {/* Center plump lobe */}
      <ellipse
        cx={cx}
        cy={cy + 1}
        rx={rx * 0.55}
        ry={ry}
        fill={`url(#ps-skin-${uid})`}
        stroke="#d84315"
        strokeWidth="0.4"
      />

      {/* Segment groove creases for plush organic feel */}
      <path
        d={`M ${cx - 8.5} ${neckY + 3} Q ${cx - 14} ${cy + 1} ${cx - 8.5} ${cy + ry - 1}`}
        stroke="#8f1900"
        strokeWidth="0.75"
        fill="none"
        opacity="0.38"
      />
      <path
        d={`M ${cx + 8.5} ${neckY + 3} Q ${cx + 14} ${cy + 1} ${cx + 8.5} ${cy + ry - 1}`}
        stroke="#8f1900"
        strokeWidth="0.75"
        fill="none"
        opacity="0.38"
      />

      {/* Cute glossy highlights on pumpkin tummy */}
      <ellipse
        cx={cx - 8}
        cy={cy - ry * 0.35}
        rx="5.5"
        ry="2.2"
        fill="#ffffff"
        opacity="0.25"
        transform={`rotate(-15 ${cx - 8} ${cy - ry * 0.35})`}
      />

      {/* Carved glowing jack-o'-lantern face on the pumpkin tummy */}
      {showFace && (
        <g filter={`url(#ps-glow-${uid})`} className="pumpkin-tummy-face select-none pointer-events-none">
          {mood === 'happy' ? (
            // Joyful curved carved eyes
            <>
              <path
                d={`M ${cx - 7.5} ${cy - 2} Q ${cx - 4.5} ${cy - 6.5} ${cx - 1.5} ${cy - 2} Q ${cx - 4.5} ${cy - 4} ${cx - 7.5} ${cy - 2} Z`}
                fill="#fff9c4"
                stroke="#ffb300"
                strokeWidth="0.35"
              />
              <path
                d={`M ${cx + 7.5} ${cy - 2} Q ${cx + 4.5} ${cy - 6.5} ${cx + 1.5} ${cy - 2} Q ${cx + 4.5} ${cy - 4} ${cx + 7.5} ${cy - 2} Z`}
                fill="#fff9c4"
                stroke="#ffb300"
                strokeWidth="0.35"
              />
            </>
          ) : mood === 'sleeping' ? (
            // Peaceful curved sleepy eyes
            <>
              <path
                d={`M ${cx - 7.5} ${cy - 3} Q ${cx - 4.5} ${cy - 0.5} ${cx - 1.5} ${cy - 3}`}
                stroke="#ffb300"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M ${cx + 1.5} ${cy - 3} Q ${cx + 4.5} ${cy - 0.5} ${cx + 7.5} ${cy - 3}`}
                stroke="#ffb300"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            // Cute classic triangle eyes
            <>
              <polygon
                points={`${cx - 7.5},${cy - 2} ${cx - 2},${cy - 2.8} ${cx - 4.8},${cy - 6.5}`}
                fill="#fff9c4"
                stroke="#ffb300"
                strokeWidth="0.35"
              />
              <polygon
                points={`${cx + 7.5},${cy - 2} ${cx + 2},${cy - 2.8} ${cx + 4.8},${cy - 6.5}`}
                fill="#fff9c4"
                stroke="#ffb300"
                strokeWidth="0.35"
              />
            </>
          )}

          {/* Tiny carved nose */}
          <polygon
            points={`${cx},${cy - 0.5} ${cx - 1.4},${cy + 1.5} ${cx + 1.4},${cy + 1.5}`}
            fill="#ffe082"
            stroke="#ffb300"
            strokeWidth="0.25"
          />

          {/* Cute toothy smiling mouth */}
          <path
            d={`M ${cx - 8.5} ${cy + 4.5} Q ${cx - 4.5} ${cy + 9.5} ${cx} ${cy + 9.5} Q ${cx + 4.5} ${cy + 9.5} ${cx + 8.5} ${cy + 4.5} Q ${cx + 5} ${cy + 7.2} ${cx + 2} ${cy + 6} L ${cx + 1.5} ${cy + 4.5} L ${cx - 1.5} ${cy + 4.5} L ${cx - 2} ${cy + 6} Q ${cx - 5} ${cy + 7.2} ${cx - 8.5} ${cy + 4.5} Z`}
            fill="#fff9c4"
            stroke="#ff9800"
            strokeWidth="0.35"
          />
        </g>
      )}

      {/* Cute Leafy Neck Collar (the scalloped collar of the pumpkin costume) */}
      <g className="pumpkin-leaf-collar">
        {/* Far-left leaf */}
        <path
          d={`M ${cx - 16} ${neckY + 4} Q ${cx - 23} ${neckY - 1} ${cx - 19} ${neckY + 6} Z`}
          fill={`url(#ps-leaf-${uid})`}
          stroke="#1b5e20"
          strokeWidth="0.35"
        />
        {/* Mid-left leaf */}
        <path
          d={`M ${cx - 11} ${neckY + 2} Q ${cx - 14} ${neckY - 5} ${cx - 5.5} ${neckY + 3.5} Z`}
          fill={`url(#ps-leaf-${uid})`}
          stroke="#1b5e20"
          strokeWidth="0.35"
        />
        {/* Center leaf pointing down/center */}
        <path
          d={`M ${cx - 5} ${neckY + 2.5} Q ${cx} ${neckY - 6} ${cx + 5} ${neckY + 2.5} Q ${cx} ${neckY + 5} ${cx - 5} ${neckY + 2.5}`}
          fill={`url(#ps-leaf-${uid})`}
          stroke="#1b5e20"
          strokeWidth="0.35"
        />
        {/* Mid-right leaf */}
        <path
          d={`M ${cx + 5.5} ${neckY + 3.5} Q ${cx + 14} ${neckY - 5} ${cx + 11} ${neckY + 2} Z`}
          fill={`url(#ps-leaf-${uid})`}
          stroke="#1b5e20"
          strokeWidth="0.35"
        />
        {/* Far-right leaf */}
        <path
          d={`M ${cx + 16} ${neckY + 4} Q ${cx + 23} ${neckY - 1} ${cx + 19} ${neckY + 6} Z`}
          fill={`url(#ps-leaf-${uid})`}
          stroke="#1b5e20"
          strokeWidth="0.35"
        />
      </g>
    </g>
  );
}

/**
 * Backwards compatibility export:
 * Can render either as costume body or head sprout if called externally.
 */
export function SpookyCutePumpkin({
  x = 50,
  y = 20,
  scale = 1,
  rotation = 0,
  className = '',
}: {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  className?: string;
}) {
  return <PumpkinHeadSprout x={x} y={y} scale={scale} rotation={rotation} className={className} />;
}

export function PetArtwork({
  petId,
  mood = 'idle',
  size = 80,
  className = '',
  animate = true,
  hasPumpkin = true,
}: PetArtworkProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size;

  switch (petId) {
    case 'fox':
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: dimension, height: dimension }}
          className={`pet-svg-art select-none ${className} ${animate ? 'animate-pet-bounce' : ''}`}
        >
          <defs>
            <linearGradient id="fox-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff7a18" />
              <stop offset="100%" stopColor="#e52e71" />
            </linearGradient>
            <linearGradient id="fox-tail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8a00" />
              <stop offset="70%" stopColor="#e52e71" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Bushy Animated Tail (sticks out behind pumpkin costume) */}
          <path
            d="M 68 62 C 85 55 98 65 92 82 C 85 94 70 88 64 76 Z"
            fill="url(#fox-tail)"
            className={animate ? 'animate-tail-wag' : ''}
            style={{ transformOrigin: '65px 75px' }}
          />

          {/* Body: Wearing Pumpkin Costume vs Standard Fox Body */}
          {hasPumpkin ? (
            <PumpkinCostumeBody
              cx={50}
              cy={68}
              rx={24}
              ry={20}
              neckY={52}
              mood={mood}
              idPrefix="fox"
            />
          ) : (
            <>
              <ellipse cx="50" cy="68" rx="22" ry="20" fill="url(#fox-body)" />
              <ellipse cx="50" cy="72" rx="14" ry="13" fill="#fff5ea" />
            </>
          )}

          {/* Ears */}
          <polygon points="30,42 22,12 44,28" fill="#e52e71" />
          <polygon points="32,38 27,18 41,28" fill="#ffe0cc" />
          <polygon points="70,42 78,12 56,28" fill="#e52e71" />
          <polygon points="68,38 73,18 59,28" fill="#ffe0cc" />

          {/* Head */}
          <polygon points="26,42 74,42 50,70" fill="url(#fox-body)" />
          <polygon points="34,42 50,70 26,42" fill="#ffffff" opacity="0.9" />
          <polygon points="66,42 50,70 74,42" fill="#ffffff" opacity="0.9" />

          {/* Cyber Visor / Brow */}
          <path
            d="M 33 39 Q 50 34 67 39"
            stroke="#00f5ff"
            strokeWidth="3"
            fill="none"
            filter="url(#neon-glow)"
          />

          {/* Eyes according to mood */}
          {mood === 'sleeping' ? (
            <g stroke="#241442" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 36 48 Q 41 53 46 48" />
              <path d="M 54 48 Q 59 53 64 48" />
            </g>
          ) : mood === 'happy' ? (
            <g stroke="#241442" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 36 49 Q 41 43 46 49" />
              <path d="M 54 49 Q 59 43 64 49" />
              <circle cx="50" cy="30" r="3" fill="#ffd700" filter="url(#neon-glow)" />
            </g>
          ) : mood === 'thinking' ? (
            <g>
              <ellipse cx="41" cy="46" rx="4" ry="4" fill="#00f5ff" />
              <ellipse cx="59" cy="44" rx="4" ry="5" fill="#00f5ff" />
              <circle cx="42" cy="45" r="1.5" fill="#ffffff" />
              <circle cx="60" cy="43" r="1.5" fill="#ffffff" />
            </g>
          ) : (
            <g>
              <ellipse cx="41" cy="46" rx="3.5" ry="4.5" fill="#1b122c" />
              <ellipse cx="59" cy="46" rx="3.5" ry="4.5" fill="#1b122c" />
              <circle cx="42" cy="44" r="1.5" fill="#ffffff" />
              <circle cx="60" cy="44" r="1.5" fill="#ffffff" />
              <circle cx="39" cy="47" r="0.8" fill="#00f5ff" />
              <circle cx="57" cy="47" r="0.8" fill="#00f5ff" />
            </g>
          )}

          {/* Nose & Whiskers */}
          <circle cx="50" cy="66" r="3.5" fill="#1b122c" />
          <line x1="22" y1="52" x2="34" y2="54" stroke="#ffd1b3" strokeWidth="1.5" />
          <line x1="22" y1="58" x2="34" y2="57" stroke="#ffd1b3" strokeWidth="1.5" />
          <line x1="78" y1="52" x2="66" y2="54" stroke="#ffd1b3" strokeWidth="1.5" />
          <line x1="78" y1="58" x2="66" y2="57" stroke="#ffd1b3" strokeWidth="1.5" />

          {/* Front Paws peeking out from under the pumpkin costume */}
          <ellipse cx="42" cy="86" rx="5" ry="4" fill="#fff0e6" stroke="#e07a3c" strokeWidth="0.5" />
          <ellipse cx="58" cy="86" rx="5" ry="4" fill="#fff0e6" stroke="#e07a3c" strokeWidth="0.5" />

          {/* Cute green sprout clip on the fox's left ear */}
          {hasPumpkin && <PumpkinHeadSprout x={30} y={16} scale={0.85} rotation={-14} />}
        </svg>
      );

    case 'cat':
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: dimension, height: dimension }}
          className={`pet-svg-art select-none ${className} ${animate ? 'animate-pet-float' : ''}`}
        >
          <defs>
            <linearGradient id="cat-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="60%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id="celestial-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Orbiting Stardust */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#e879f9"
            strokeWidth="1"
            strokeDasharray="3 6"
            opacity="0.6"
            className="animate-spin-slow"
          />
          <circle cx="82" cy="30" r="2.5" fill="#fbcfe8" />
          <circle cx="20" cy="70" r="2" fill="#a5f3fc" />

          {/* Tail curling out from behind pumpkin costume */}
          <path
            d="M 68 70 C 88 72 92 50 84 42 C 78 36 74 44 76 50"
            fill="none"
            stroke="url(#cat-body)"
            strokeWidth="7"
            strokeLinecap="round"
          />

          {/* Body: Wearing Pumpkin Costume vs Standard Cat Body */}
          {hasPumpkin ? (
            <PumpkinCostumeBody
              cx={50}
              cy={66}
              rx={24}
              ry={20}
              neckY={48}
              mood={mood}
              idPrefix="cat"
            />
          ) : (
            <>
              <ellipse cx="50" cy="65" rx="23" ry="21" fill="url(#cat-body)" />
              <ellipse cx="50" cy="68" rx="14" ry="13" fill="#fdf4ff" opacity="0.9" />
            </>
          )}

          {/* Ears */}
          <polygon points="32,38 24,14 44,25" fill="#6366f1" />
          <polygon points="33,35 28,20 42,27" fill="#f472b6" />
          <polygon points="68,38 76,14 56,25" fill="#a855f7" />
          <polygon points="67,35 72,20 58,27" fill="#f472b6" />

          {/* Head */}
          <circle cx="50" cy="42" r="21" fill="url(#cat-body)" />

          {/* Forehead Crescent Moon */}
          <path d="M 48 28 A 4 4 0 0 0 52 36 A 3 3 0 0 1 48 28" fill="#fef08a" />

          {/* Eyes */}
          {mood === 'sleeping' ? (
            <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 38 44 Q 43 49 48 44" />
              <path d="M 52 44 Q 57 49 62 44" />
            </g>
          ) : mood === 'happy' ? (
            <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 37 45 Q 42 39 47 45" />
              <path d="M 53 45 Q 58 39 63 45" />
              <ellipse cx="33" cy="50" rx="3" ry="1.5" fill="#f472b6" opacity="0.8" />
              <ellipse cx="67" cy="50" rx="3" ry="1.5" fill="#f472b6" opacity="0.8" />
            </g>
          ) : (
            <g>
              <ellipse cx="41" cy="43" rx="5" ry="6" fill="#fef08a" />
              <ellipse cx="59" cy="43" rx="5" ry="6" fill="#fef08a" />
              <ellipse cx="41" cy="43" rx="2.2" ry="5" fill="#1e1b4b" />
              <ellipse cx="59" cy="43" rx="2.2" ry="5" fill="#1e1b4b" />
              <circle cx="43" cy="41" r="1.5" fill="#ffffff" />
              <circle cx="61" cy="41" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Nose & Mouth */}
          <polygon points="48,50 52,50 50,52" fill="#f472b6" />
          <path d="M 46 54 Q 50 57 54 54" stroke="#ffffff" strokeWidth="1.5" fill="none" />

          {/* Whiskers */}
          <line x1="22" y1="46" x2="34" y2="48" stroke="#c084fc" strokeWidth="1.5" />
          <line x1="23" y1="52" x2="34" y2="51" stroke="#c084fc" strokeWidth="1.5" />
          <line x1="78" y1="46" x2="66" y2="48" stroke="#c084fc" strokeWidth="1.5" />
          <line x1="77" y1="52" x2="66" y2="51" stroke="#c084fc" strokeWidth="1.5" />

          {/* Paws */}
          <ellipse cx="43" cy="84" rx="5" ry="4" fill="#fdf4ff" stroke="#c084fc" strokeWidth="0.5" />
          <ellipse cx="57" cy="84" rx="5" ry="4" fill="#fdf4ff" stroke="#c084fc" strokeWidth="0.5" />

          {/* Cute green pumpkin stem sprout between cat ears */}
          {hasPumpkin && <PumpkinHeadSprout x={50} y={22} scale={0.8} rotation={6} />}
        </svg>
      );

    case 'bunny':
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: dimension, height: dimension }}
          className={`pet-svg-art select-none ${className} ${animate ? 'animate-pet-hop' : ''}`}
        >
          <defs>
            <linearGradient id="bunny-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="bunny-ear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>

          {/* Long Ears */}
          <ellipse cx="38" cy="22" rx="7" ry="20" fill="url(#bunny-body)" transform="rotate(-10 38 22)" />
          <ellipse cx="38" cy="22" rx="4" ry="15" fill="url(#bunny-ear)" transform="rotate(-10 38 22)" />
          <ellipse cx="62" cy="22" rx="7" ry="20" fill="url(#bunny-body)" transform="rotate(10 62 22)" />
          <ellipse cx="62" cy="22" rx="4" ry="15" fill="url(#bunny-ear)" transform="rotate(10 62 22)" />

          {/* Body: Wearing Pumpkin Costume vs Standard Bunny Body */}
          {hasPumpkin ? (
            <PumpkinCostumeBody
              cx={50}
              cy={69}
              rx={25}
              ry={20}
              neckY={52}
              mood={mood}
              idPrefix="bunny"
            />
          ) : (
            <>
              <ellipse cx="50" cy="70" rx="24" ry="20" fill="url(#bunny-body)" />
              <ellipse cx="50" cy="73" rx="15" ry="12" fill="#ffe4e6" />
            </>
          )}

          {/* Head */}
          <circle cx="50" cy="46" r="20" fill="url(#bunny-body)" />

          {/* Cyber Pixel Goggles */}
          <rect x="30" y="38" width="40" height="14" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <rect x="34" y="41" width="13" height="8" rx="2" fill="#0284c7" />
          <rect x="53" y="41" width="13" height="8" rx="2" fill="#0284c7" />
          <line x1="47" y1="45" x2="53" y2="45" stroke="#38bdf8" strokeWidth="2" />

          {/* Goggle Eyes */}
          {mood === 'happy' ? (
            <g fill="#38bdf8">
              <polygon points="37,47 41,43 45,47" />
              <polygon points="56,47 60,43 64,47" />
            </g>
          ) : (
            <g fill="#38bdf8">
              <circle cx="40" cy="45" r="2.5" fill="#38bdf8" />
              <circle cx="59" cy="45" r="2.5" fill="#38bdf8" />
              <rect x="41" y="43" width="1" height="1" fill="#ffffff" />
              <rect x="60" y="43" width="1" height="1" fill="#ffffff" />
            </g>
          )}

          {/* Cute Nose & Mouth */}
          <polygon points="48,56 52,56 50,58" fill="#f43f5e" />
          <path d="M 46 60 Q 50 62 54 60" stroke="#475569" strokeWidth="1.5" fill="none" />
          <ellipse cx="32" cy="56" rx="4" ry="2" fill="#fda4af" opacity="0.8" />
          <ellipse cx="68" cy="56" rx="4" ry="2" fill="#fda4af" opacity="0.8" />

          {/* Fluffy Feet peeking out at bottom */}
          <ellipse cx="36" cy="87" rx="8" ry="5" fill="url(#bunny-body)" stroke="#cbd5e1" strokeWidth="0.5" />
          <ellipse cx="64" cy="87" rx="8" ry="5" fill="url(#bunny-body)" stroke="#cbd5e1" strokeWidth="0.5" />

          {/* Cute pumpkin sprout wrapping around the base of bunny's ear */}
          {hasPumpkin && <PumpkinHeadSprout x={38} y={18} scale={0.82} rotation={-10} />}
        </svg>
      );

    case 'dragon':
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: dimension, height: dimension }}
          className={`pet-svg-art select-none ${className} ${animate ? 'animate-pet-float' : ''}`}
        >
          <defs>
            <linearGradient id="dragon-skin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <linearGradient id="dragon-wings" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Wings flapping behind pumpkin suit */}
          <path
            d="M 28 44 C 10 32 4 48 18 60 C 26 56 28 50 30 46 Z"
            fill="url(#dragon-wings)"
            opacity="0.9"
            className="animate-wing-left"
          />
          <path
            d="M 72 44 C 90 32 96 48 82 60 C 74 56 72 50 70 46 Z"
            fill="url(#dragon-wings)"
            opacity="0.9"
            className="animate-wing-right"
          />

          {/* Tail with flame */}
          <path
            d="M 66 74 C 84 82 86 94 76 96"
            fill="none"
            stroke="url(#dragon-skin)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <polygon points="76,96 82,90 85,98" fill="#f59e0b" />

          {/* Body: Wearing Pumpkin Costume vs Standard Dragon Body */}
          {hasPumpkin ? (
            <PumpkinCostumeBody
              cx={50}
              cy={68}
              rx={24}
              ry={20}
              neckY={50}
              mood={mood}
              idPrefix="dragon"
            />
          ) : (
            <>
              <ellipse cx="50" cy="68" rx="22" ry="19" fill="url(#dragon-skin)" />
              <path
                d="M 44 60 Q 50 62 56 60 Q 58 78 50 82 Q 42 78 44 60 Z"
                fill="#fef08a"
                opacity="0.9"
              />
            </>
          )}

          {/* Little Horns */}
          <polygon points="34,28 30,12 40,24" fill="#fbbf24" />
          <polygon points="66,28 70,12 60,24" fill="#fbbf24" />

          {/* Head */}
          <circle cx="50" cy="42" r="20" fill="url(#dragon-skin)" />

          {/* Cute Nostril Flames / Spouts */}
          <circle cx="44" cy="50" r="1.5" fill="#065f46" />
          <circle cx="56" cy="50" r="1.5" fill="#065f46" />

          {/* Eyes */}
          {mood === 'happy' ? (
            <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 37 42 Q 42 36 47 42" />
              <path d="M 53 42 Q 58 36 63 42" />
              <circle cx="50" cy="24" r="3" fill="#f59e0b" />
            </g>
          ) : (
            <g>
              <ellipse cx="41" cy="41" rx="5" ry="5.5" fill="#fbbf24" />
              <ellipse cx="59" cy="41" rx="5" ry="5.5" fill="#fbbf24" />
              <ellipse cx="41" cy="41" rx="2.5" ry="5" fill="#042f2e" />
              <ellipse cx="59" cy="41" rx="2.5" ry="5" fill="#042f2e" />
              <circle cx="43" cy="39" r="1.5" fill="#ffffff" />
              <circle cx="61" cy="39" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Paws */}
          <ellipse cx="42" cy="85" rx="5" ry="4" fill="#059669" />
          <ellipse cx="58" cy="85" rx="5" ry="4" fill="#059669" />

          {/* Pumpkin sprout between dragon horns */}
          {hasPumpkin && <PumpkinHeadSprout x={50} y={23} scale={0.8} rotation={2} />}
        </svg>
      );

    case 'slime':
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: dimension, height: dimension }}
          className={`pet-svg-art select-none ${className} ${animate ? 'animate-pet-jiggle' : ''}`}
        >
          <defs>
            <radialGradient id="slime-grad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
            <radialGradient id="slime-p-skin" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffa726" />
              <stop offset="50%" stopColor="#ff7043" />
              <stop offset="85%" stopColor="#e64a19" />
              <stop offset="100%" stopColor="#bf360c" />
            </radialGradient>
            <radialGradient id="slime-p-lobe" cx="40%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#ff9800" />
              <stop offset="60%" stopColor="#f4511e" />
              <stop offset="100%" stopColor="#a72800" />
            </radialGradient>
            <filter id="slime-p-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.4" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {hasPumpkin ? (
            // Slime is WEARING / nestled inside an adorable carved pumpkin costume pot!
            <>
              {/* Blue slime head bubbling happily out of the pumpkin costume */}
              <path
                d="M 50 18 C 66 18 78 30 78 52 C 78 58 72 62 50 62 C 28 62 22 58 22 52 C 22 30 34 18 50 18 Z"
                fill="url(#slime-grad)"
                opacity="0.96"
              />

              {/* Glossy top highlight on the slime */}
              <ellipse cx="40" cy="30" rx="14" ry="7" fill="#ffffff" opacity="0.45" transform="rotate(-15 40 30)" />
              <ellipse cx="64" cy="34" rx="4" ry="2.5" fill="#ffffff" opacity="0.35" />

              {/* Slime Eyes & Smile peeking out over the pumpkin rim */}
              {mood === 'happy' ? (
                <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none">
                  <path d="M 35 44 Q 40 38 45 44" />
                  <path d="M 55 44 Q 60 38 65 44" />
                  <ellipse cx="30" cy="49" rx="3.5" ry="1.8" fill="#38bdf8" opacity="0.8" />
                  <ellipse cx="70" cy="49" rx="3.5" ry="1.8" fill="#38bdf8" opacity="0.8" />
                </g>
              ) : mood === 'thinking' ? (
                <g fill="#ffffff">
                  <circle cx="41" cy="42" r="4.5" fill="#ffffff" />
                  <circle cx="59" cy="42" r="4.5" fill="#ffffff" />
                  <circle cx="43" cy="41" r="2.2" fill="#082f49" />
                  <circle cx="61" cy="41" r="2.2" fill="#082f49" />
                </g>
              ) : (
                <g fill="#ffffff">
                  <ellipse cx="40" cy="42" rx="4.5" ry="5.5" fill="#0c4a6e" />
                  <ellipse cx="60" cy="42" rx="4.5" ry="5.5" fill="#0c4a6e" />
                  <circle cx="41" cy="40.5" r="1.8" fill="#ffffff" />
                  <circle cx="61" cy="40.5" r="1.8" fill="#ffffff" />
                  <circle cx="38" cy="43.5" r="0.9" fill="#38bdf8" />
                  <circle cx="58" cy="43.5" r="0.9" fill="#38bdf8" />
                </g>
              )}

              {/* Cute little mouth */}
              <path d="M 47 50 Q 50 53 53 50" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Pumpkin Costume Body that the slime is wearing on its lower half */}
              <g className="slime-pumpkin-suit">
                {/* Shadow */}
                <ellipse cx="50" cy="89" rx="22" ry="3.5" fill="#000000" opacity="0.32" />

                {/* Back outer pumpkin lobes */}
                <ellipse cx="34" cy="70" rx="12" ry="18" fill="url(#slime-p-lobe)" />
                <ellipse cx="66" cy="70" rx="12" ry="18" fill="url(#slime-p-lobe)" />

                {/* Mid lobes */}
                <ellipse cx="42" cy="71" rx="13" ry="19" fill="url(#slime-p-skin)" />
                <ellipse cx="58" cy="71" rx="13" ry="19" fill="url(#slime-p-skin)" />

                {/* Center lobe */}
                <ellipse cx="50" cy="72" rx="14" ry="19.5" fill="url(#slime-p-skin)" stroke="#d84315" strokeWidth="0.4" />

                {/* Scalloped / Jagged carved rim of the pumpkin costume where slime sits */}
                <path
                  d="M 22 55 Q 26 58 31 54 Q 37 59 43 54 Q 50 59 57 54 Q 63 59 69 54 Q 74 58 78 55 L 78 59 Q 50 67 22 59 Z"
                  fill="#ff9800"
                  stroke="#bf360c"
                  strokeWidth="0.4"
                />

                {/* Glowing Jack-o'-lantern Face on the Slime's Pumpkin Costume */}
                <g filter="url(#slime-p-glow)">
                  <polygon points="41,68 45,64 47,69" fill="#fff9c4" stroke="#ffb300" strokeWidth="0.3" />
                  <polygon points="59,68 55,64 53,69" fill="#fff9c4" stroke="#ffb300" strokeWidth="0.3" />
                  <polygon points="50,69 48.5,71 51.5,71" fill="#ffe082" stroke="#ffb300" strokeWidth="0.2" />
                  <path
                    d="M 43 74 Q 46 78 50 78 Q 54 78 57 74 Q 54 76 52 75 L 51.5 73.5 L 48.5 73.5 L 48 75 Q 46 76 43 74 Z"
                    fill="#fff9c4"
                    stroke="#ff9800"
                    strokeWidth="0.35"
                  />
                </g>
              </g>

              {/* Cute little green sprout on the slime's head */}
              <PumpkinHeadSprout x={50} y={17} scale={0.9} rotation={-6} />
            </>
          ) : (
            // Standard Slime Blob
            <>
              <path
                d="M 50 18 C 65 18 84 38 84 62 C 84 80 72 88 50 88 C 28 88 16 80 16 62 C 16 38 35 18 50 18 Z"
                fill="url(#slime-grad)"
                opacity="0.95"
              />
              <ellipse cx="40" cy="32" rx="16" ry="8" fill="#ffffff" opacity="0.45" transform="rotate(-15 40 32)" />
              <ellipse cx="64" cy="36" rx="5" ry="3" fill="#ffffff" opacity="0.35" />

              {mood === 'happy' ? (
                <g stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none">
                  <path d="M 34 56 Q 40 48 46 56" />
                  <path d="M 54 56 Q 60 48 66 56" />
                  <ellipse cx="28" cy="64" rx="4" ry="2" fill="#38bdf8" opacity="0.8" />
                  <ellipse cx="72" cy="64" rx="4" ry="2" fill="#38bdf8" opacity="0.8" />
                </g>
              ) : mood === 'thinking' ? (
                <g fill="#ffffff">
                  <circle cx="40" cy="54" r="5" fill="#ffffff" />
                  <circle cx="60" cy="54" r="5" fill="#ffffff" />
                  <circle cx="42" cy="52" r="2.5" fill="#082f49" />
                  <circle cx="62" cy="52" r="2.5" fill="#082f49" />
                </g>
              ) : (
                <g fill="#ffffff">
                  <ellipse cx="38" cy="55" rx="5" ry="6" fill="#0c4a6e" />
                  <ellipse cx="62" cy="55" rx="5" ry="6" fill="#0c4a6e" />
                  <circle cx="40" cy="53" r="2" fill="#ffffff" />
                  <circle cx="64" cy="53" r="2" fill="#ffffff" />
                  <circle cx="36" cy="57" r="1" fill="#38bdf8" />
                  <circle cx="60" cy="57" r="1" fill="#38bdf8" />
                </g>
              )}
              <path d="M 46 66 Q 50 70 54 66" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}
        </svg>
      );

    case 'robo':
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: dimension, height: dimension }}
          className={`pet-svg-art select-none ${className} ${animate ? 'animate-pet-float' : ''}`}
        >
          <defs>
            <linearGradient id="robo-metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Antenna */}
          <line x1="50" y1="18" x2="50" y2="28" stroke="#64748b" strokeWidth="3" />
          <circle cx="50" cy="16" r="4" fill="#00f5ff" filter="url(#cyan-glow)" />

          {/* Thruster Ring Glow */}
          <ellipse cx="50" cy="85" rx="14" ry="4" fill="#00f5ff" opacity="0.7" filter="url(#cyan-glow)" />

          {/* Spherical Head / Chassis */}
          <circle cx="50" cy="52" r="30" fill="url(#robo-metal)" stroke="#475569" strokeWidth="2" />

          {/* Robo Wearing Pumpkin Mech Chassis Costume */}
          {hasPumpkin && (
            <g className="robo-pumpkin-armor">
              {/* Curved pumpkin armor lobes wrapped around the spherical body */}
              <path
                d="M 20 52 C 20 70 33 82 50 82 C 67 82 80 70 80 52 C 76 65 64 74 50 74 C 36 74 24 65 20 52 Z"
                fill="#ff7043"
                opacity="0.9"
              />
              {/* Outer orange armor plates */}
              <path
                d="M 20 52 C 20 38 30 26 44 23 C 32 28 24 40 22 52 Z"
                fill="#f4511e"
                opacity="0.85"
              />
              <path
                d="M 80 52 C 80 38 70 26 56 23 C 68 28 76 40 78 52 Z"
                fill="#f4511e"
                opacity="0.85"
              />
              {/* Cyber Jack-o'-lantern chest grill vent */}
              <g filter="url(#cyan-glow)">
                <polygon points="42,75 45,71 47,75" fill="#00f5ff" />
                <polygon points="58,75 55,71 53,75" fill="#00f5ff" />
                <path d="M 44 78 Q 50 81 56 78" stroke="#00f5ff" strokeWidth="1.5" fill="none" />
              </g>
              {/* Green leaf collar around top chassis */}
              <path d="M 43 23 Q 50 20 57 23 Q 50 26 43 23 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="0.4" />
            </g>
          )}

          {/* Floating Sensor Ears */}
          <rect x="14" y="44" width="6" height="16" rx="3" fill="#00f5ff" opacity="0.8" />
          <rect x="80" y="44" width="6" height="16" rx="3" fill="#00f5ff" opacity="0.8" />

          {/* LED Visor Screen */}
          <rect x="26" y="40" width="48" height="24" rx="8" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />

          {/* LED Matrix Face */}
          {mood === 'happy' ? (
            <g stroke="#00f5ff" strokeWidth="2.5" strokeLinecap="round" fill="none" filter="url(#cyan-glow)">
              <path d="M 34 52 Q 40 46 46 52" />
              <path d="M 54 52 Q 60 46 66 52" />
            </g>
          ) : mood === 'thinking' ? (
            <g fill="#00f5ff" filter="url(#cyan-glow)">
              <circle cx="38" cy="52" r="3" />
              <circle cx="50" cy="52" r="3" />
              <circle cx="62" cy="52" r="3" />
            </g>
          ) : (
            <g fill="#00f5ff" filter="url(#cyan-glow)">
              <rect x="35" y="47" width="10" height="10" rx="2" />
              <rect x="55" y="47" width="10" height="10" rx="2" />
              <rect x="38" y="50" width="3" height="3" fill="#ffffff" />
              <rect x="58" y="50" width="3" height="3" fill="#ffffff" />
            </g>
          )}

          {/* Cute green sprout attached to robo antenna */}
          {hasPumpkin && <PumpkinHeadSprout x={50} y={15} scale={0.78} rotation={12} />}
        </svg>
      );

    case 'shiba':
      return (
        <svg
          viewBox="0 0 100 100"
          style={{ width: dimension, height: dimension }}
          className={`pet-svg-art select-none ${className} ${animate ? 'animate-pet-bounce' : ''}`}
        >
          <defs>
            <linearGradient id="shiba-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <radialGradient id="helmet-glass" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* Ears */}
          <polygon points="30,36 24,14 44,24" fill="#d97706" />
          <polygon points="32,32 28,20 40,26" fill="#fef3c7" />
          <polygon points="70,36 76,14 56,24" fill="#d97706" />
          <polygon points="68,32 72,20 60,26" fill="#fef3c7" />

          {/* Body: Wearing Pumpkin Spacesuit vs Standard Shiba Body */}
          {hasPumpkin ? (
            <PumpkinCostumeBody
              cx={50}
              cy={70}
              rx={24}
              ry={20}
              neckY={55}
              mood={mood}
              idPrefix="shiba"
            />
          ) : (
            <>
              <ellipse cx="50" cy="70" rx="22" ry="18" fill="url(#shiba-gold)" />
              <ellipse cx="50" cy="73" rx="14" ry="12" fill="#fffbeb" />
            </>
          )}

          {/* Space Collar */}
          <rect x="36" y="60" width="28" height="6" rx="3" fill="#ef4444" />
          <circle cx="50" cy="63" r="3" fill="#fbbf24" />

          {/* Head */}
          <circle cx="50" cy="44" r="21" fill="url(#shiba-gold)" />
          <ellipse cx="40" cy="46" rx="7" ry="9" fill="#fffbeb" />
          <ellipse cx="60" cy="46" rx="7" ry="9" fill="#fffbeb" />

          {/* Astronaut Bubble Helmet */}
          <circle cx="50" cy="44" r="28" fill="url(#helmet-glass)" stroke="#bae6fd" strokeWidth="1.5" />

          {/* Eyes */}
          {mood === 'happy' ? (
            <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 37 43 Q 42 38 47 43" />
              <path d="M 53 43 Q 58 38 63 43" />
              <ellipse cx="32" cy="48" rx="3" ry="1.5" fill="#f87171" opacity="0.8" />
              <ellipse cx="68" cy="48" rx="3" ry="1.5" fill="#f87171" opacity="0.8" />
            </g>
          ) : (
            <g>
              <ellipse cx="42" cy="42" rx="3.5" ry="4" fill="#1e293b" />
              <ellipse cx="58" cy="42" rx="3.5" ry="4" fill="#1e293b" />
              <circle cx="43" cy="41" r="1.2" fill="#ffffff" />
              <circle cx="59" cy="41" r="1.2" fill="#ffffff" />
              {/* Shiba Eyebrow Dots */}
              <circle cx="40" cy="35" r="2.5" fill="#fffbeb" />
              <circle cx="60" cy="35" r="2.5" fill="#fffbeb" />
            </g>
          )}

          {/* Muzzle & Nose */}
          <ellipse cx="50" cy="49" rx="7" ry="5" fill="#fffbeb" />
          <polygon points="47,47 53,47 50,50" fill="#1e293b" />
          <path d="M 47 51 Q 50 53 53 51" stroke="#1e293b" strokeWidth="1.2" fill="none" />

          {/* Paws */}
          <ellipse cx="42" cy="86" rx="5" ry="4" fill="#fffbeb" stroke="#f59e0b" strokeWidth="0.5" />
          <ellipse cx="58" cy="86" rx="5" ry="4" fill="#fffbeb" stroke="#f59e0b" strokeWidth="0.5" />

          {/* Pumpkin sprout badge atop the space helmet */}
          {hasPumpkin && <PumpkinHeadSprout x={50} y={15} scale={0.82} rotation={-4} />}
        </svg>
      );

    default:
      return null;
  }
}
