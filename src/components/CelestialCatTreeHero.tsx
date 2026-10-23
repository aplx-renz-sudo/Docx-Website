import React, { useState } from 'react';
import { ArrowUp, KeyRound, Terminal, Code2 } from 'lucide-react';
import type { ThemeMode } from '../types';

interface CelestialCatTreeHeroProps {
  onLaunch: () => void;
  onSettings: () => void;
  onOpenGuide?: () => void;
  onEnterIDE?: () => void;
  launchLabel: string;
  settingsLabel: string;
  guideLabel?: string;
  enterIDELabel?: string;
  themeMode?: ThemeMode;
}

/**
 * Purple Cartoon Style Tree with the Celestial Cat sleeping soundly on its branch,
 * and magical roots winding down and wrapping around the bottom of:
 * - "Launch workspace"
 * - "Configure API Keys"
 * - "Interactive Guide"
 */
export function CelestialCatTreeHero({
  onLaunch,
  onSettings,
  onOpenGuide,
  onEnterIDE,
  launchLabel,
  settingsLabel,
  guideLabel = 'Interactive Guide',
  enterIDELabel = 'Enter IDE',
  themeMode = 'halloween',
}: CelestialCatTreeHeroProps) {
  const [purrToast, setPurrToast] = useState<string | null>(null);
  const [catHearts, setCatHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleCatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const purrs = [
      'Purrrrrr... 🐾 Sleeping peacefully in the purple cartoon tree! ✨',
      'Zzz... Dreaming of cozy code pumpkins & cosmic stars 🎃🌙',
      'Purr... *Twitches whiskers* Best sleeping branch in the universe! 💖',
      '*Soft celestial meow* ...Watching over your workspace while napping! 💤',
    ];
    const picked = purrs[Math.floor(Math.random() * purrs.length)];
    setPurrToast(picked);

    // Floating heart/sparkle on click
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const newHeart = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setCatHearts(prev => [...prev.slice(-4), newHeart]);

    setTimeout(() => {
      setPurrToast(null);
    }, 3800);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-10 select-none">
      {/* =========================================================================
          PART 1: THE PURPLE CARTOON TREE & SLEEPING CELESTIAL CAT (CANOPY & BRANCH)
          ========================================================================= */}
      <div className="relative w-full overflow-visible">
        {/* Sleeping Cat Interactive Toast / Speech Bubble */}
        {purrToast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-[#1d0b38]/95 border border-purple-400/60 shadow-2xl shadow-purple-950/80 text-xs font-mono text-purple-100 flex items-center gap-2.5 backdrop-blur-md animate-fade-in pointer-events-none">
            <span className="text-base animate-bounce">🐱💤</span>
            <span>{purrToast}</span>
          </div>
        )}

        {/* Floating Heart / Star Particles when petting the sleeping cat */}
        {catHearts.map(h => (
          <span
            key={h.id}
            className="absolute z-50 pointer-events-none text-sm animate-float-heart filter drop-shadow-[0_0_6px_rgba(236,72,153,0.8)]"
            style={{ left: `${h.x}px`, top: `${h.y}px` }}
          >
            ✨💖
          </span>
        ))}

        {/* Tree Top SVG: Canopy, Trunk, Main Branch, and Sleeping Celestial Cat */}
        <svg
          viewBox="0 0 760 215"
          className="w-full h-auto overflow-visible select-none drop-shadow-[0_12px_24px_rgba(46,16,101,0.45)]"
        >
          <defs>
            {/* Canopy Shading Gradients */}
            <radialGradient id="canopy-deep" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="65%" stopColor="#2e1065" />
              <stop offset="100%" stopColor="#170630" />
            </radialGradient>
            <radialGradient id="canopy-mid" cx="45%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="60%" stopColor="#6b21a8" />
              <stop offset="100%" stopColor="#3b0764" />
            </radialGradient>
            <linearGradient id="canopy-bright" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>

            {/* Cartoon Tree Bark Gradient */}
            <linearGradient id="tree-bark-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#581c87" />
              <stop offset="35%" stopColor="#3b0764" />
              <stop offset="70%" stopColor="#2e1065" />
              <stop offset="100%" stopColor="#1e0838" />
            </linearGradient>

            {/* Branch Highlight Gradient */}
            <linearGradient id="branch-moss-highlight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7e22ce" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>

            {/* Celestial Cat Body Gradient */}
            <linearGradient id="celestial-cat-fur" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>

            {/* Cat Pumpkin Suit Gradient */}
            <radialGradient id="cat-pumpkin-body" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffa726" />
              <stop offset="55%" stopColor="#ff7043" />
              <stop offset="100%" stopColor="#bf360c" />
            </radialGradient>

            {/* Glow Filter for Moon & Stardust */}
            <filter id="celestial-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="moon-soft-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.5" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* -------------------------------------------------------------
              BACKGROUND CARTOON FOLIAGE PUFFS (Layer 1 - Deep Night Purple)
              ------------------------------------------------------------- */}
          <g className="tree-canopy-back" opacity="0.85">
            <ellipse cx="230" cy="85" rx="75" ry="55" fill="url(#canopy-deep)" />
            <ellipse cx="340" cy="55" rx="90" ry="60" fill="url(#canopy-deep)" />
            <ellipse cx="460" cy="50" rx="85" ry="58" fill="url(#canopy-deep)" />
            <ellipse cx="560" cy="80" rx="75" ry="55" fill="url(#canopy-deep)" />
            <ellipse cx="160" cy="115" rx="55" ry="45" fill="url(#canopy-deep)" />
            <ellipse cx="610" cy="110" rx="55" ry="45" fill="url(#canopy-deep)" />
          </g>

          {/* -------------------------------------------------------------
              MIDGROUND CARTOON FOLIAGE PUFFS (Layer 2 - Vibrant Violet)
              ------------------------------------------------------------- */}
          <g className="tree-canopy-mid">
            {/* Left canopy cluster */}
            <ellipse cx="240" cy="70" rx="65" ry="50" fill="url(#canopy-mid)" />
            <ellipse cx="190" cy="95" rx="50" ry="40" fill="url(#canopy-mid)" />
            <ellipse cx="285" cy="50" rx="60" ry="45" fill="url(#canopy-mid)" />

            {/* Central crown cluster */}
            <ellipse cx="370" cy="40" rx="80" ry="50" fill="url(#canopy-mid)" />
            <ellipse cx="430" cy="42" rx="75" ry="48" fill="url(#canopy-mid)" />

            {/* Right canopy cluster */}
            <ellipse cx="510" cy="55" rx="70" ry="48" fill="url(#canopy-mid)" />
            <ellipse cx="575" cy="75" rx="60" ry="44" fill="url(#canopy-mid)" />
            <ellipse cx="620" cy="105" rx="45" ry="35" fill="url(#canopy-mid)" />
          </g>

          {/* -------------------------------------------------------------
              FOREGROUND FOLIAGE HIGHLIGHTS & CLOUD PUFF OUTLINES
              ------------------------------------------------------------- */}
          <g className="tree-canopy-highlights">
            {/* Scalloped puffy leaf highlights */}
            <path
              d="M 160 85 Q 200 65 240 75 Q 280 45 340 50 Q 400 30 460 45 Q 520 35 570 65 Q 610 80 635 110"
              stroke="#c084fc"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
            <path
              d="M 210 95 Q 260 75 310 85 Q 360 65 420 75 Q 480 65 540 85"
              stroke="#e879f9"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Little Puffy Cartoon Foliage Bubbles */}
            <circle cx="215" cy="55" r="14" fill="url(#canopy-bright)" opacity="0.4" />
            <circle cx="330" cy="30" r="18" fill="url(#canopy-bright)" opacity="0.45" />
            <circle cx="470" cy="30" r="16" fill="url(#canopy-bright)" opacity="0.45" />
            <circle cx="580" cy="60" r="14" fill="url(#canopy-bright)" opacity="0.4" />
          </g>

          {/* -------------------------------------------------------------
              DANGLING CELESTIAL VINES & GLOWING STARDUST CHARMS
              ------------------------------------------------------------- */}
          <g className="hanging-celestial-vines">
            {/* Vine 1 Left */}
            <path d="M 185 120 Q 180 150 195 165 Q 200 170 195 178" stroke="#a855f7" strokeWidth="1.6" fill="none" />
            <circle cx="195" cy="180" r="3.5" fill="#fef08a" filter="url(#moon-soft-glow)" className="animate-pulse" />

            {/* Vine 2 Mid-Left */}
            <path d="M 265 105 Q 275 130 268 145" stroke="#a855f7" strokeWidth="1.4" fill="none" />
            <circle cx="268" cy="147" r="2.8" fill="#ec4899" filter="url(#moon-soft-glow)" />

            {/* Vine 3 Right */}
            <path d="M 590 115 Q 605 135 598 155 Q 595 162 602 170" stroke="#a855f7" strokeWidth="1.6" fill="none" />
            <circle cx="602" cy="172" r="3.5" fill="#38bdf8" filter="url(#moon-soft-glow)" className="animate-pulse" />

            {/* Vine 4 Mid-Right */}
            <path d="M 535 95 Q 545 115 540 128" stroke="#a855f7" strokeWidth="1.4" fill="none" />
            <circle cx="540" cy="130" r="2.5" fill="#fef08a" filter="url(#moon-soft-glow)" />
          </g>

          {/* Floating Stardust Sparkles */}
          <g filter="url(#celestial-glow)" opacity="0.8">
            <text x="175" y="75" fill="#fef08a" fontSize="11" className="animate-pulse">✦</text>
            <text x="310" y="35" fill="#fbcfe8" fontSize="13">✧</text>
            <text x="490" y="32" fill="#e0e7ff" fontSize="12" className="animate-pulse">✦</text>
            <text x="615" y="85" fill="#fef08a" fontSize="10">✧</text>
          </g>

          {/* -------------------------------------------------------------
              THE MAIN CARTOON TRUNK & BRANCH SYSTEM
              ------------------------------------------------------------- */}
          <g className="tree-trunk-structure">
            {/* Left Supporting Branch into Canopy */}
            <path
              d="M 330 110 C 290 95 240 100 210 115 L 215 125 C 245 112 285 110 325 125 Z"
              fill="url(#tree-bark-grad)"
              stroke="#2e1065"
              strokeWidth="1.5"
            />

            {/* Main Tree Trunk: Curving from upper canopy down to buttons root base */}
            <path
              d="M 320 80 C 325 110 330 140 335 170 C 337 185 340 200 345 215 L 415 215 C 410 195 405 175 400 155 C 405 130 400 105 390 80 Z"
              fill="url(#tree-bark-grad)"
              stroke="#1f0738"
              strokeWidth="2"
            />

            {/* Cartoon Bark Highlights & Contour Lines */}
            <path
              d="M 345 95 Q 352 140 355 190"
              stroke="#9333ea"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 365 90 Q 370 135 372 185"
              stroke="#c084fc"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M 385 100 Q 388 140 390 190"
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />

            {/* Whimsical Tree Hollow with Spooky Warm Amber Eye / Knot */}
            <ellipse cx="368" cy="150" rx="7" ry="11" fill="#140424" stroke="#581c87" strokeWidth="1.5" />
            <circle cx="368" cy="150" r="3" fill="#ff9800" filter="url(#moon-soft-glow)" opacity="0.85" />

            {/* ---------------------------------------------------------
                THE STURDY MAIN SLEEPING BRANCH (Where the cat rests!)
                --------------------------------------------------------- */}
            {/* Bottom shadow of the sleeping branch */}
            <path
              d="M 390 105 C 420 120 480 125 545 105 C 560 100 575 88 565 98 C 525 125 450 135 385 118 Z"
              fill="#18042b"
            />
            {/* Branch Body: Gentle cradle dip between 420 and 490 */}
            <path
              d="M 380 92 C 410 98 440 98 475 92 C 510 86 545 82 565 88 C 555 98 520 106 480 110 C 440 114 410 112 375 105 Z"
              fill="url(#tree-bark-grad)"
              stroke="#2e1065"
              strokeWidth="1.5"
            />
            {/* Top mossy purple/pink highlight cushion on branch */}
            <path
              d="M 382 92 C 415 97 445 97 480 91 C 515 85 545 83 560 88"
              stroke="url(#branch-moss-highlight)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Little leafy vine sprouts growing off the sleeping branch */}
            <path d="M 525 84 Q 535 74 542 78 Q 538 88 528 85 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="0.5" />
            <path d="M 550 86 Q 562 76 568 82 Q 562 90 552 87 Z" fill="#81c784" stroke="#1b5e20" strokeWidth="0.5" />
            <path d="M 545 88 Q 550 96 558 98" stroke="#4caf50" strokeWidth="1" fill="none" />
          </g>

          {/* =============================================================
              PART 2: THE CELESTIAL CAT SLEEPING PEACEFULLY ON THE BRANCH!
              ============================================================= */}
          <g
            className="sleeping-celestial-cat-group cursor-pointer transition-transform hover:scale-[1.03] select-none"
            onClick={handleCatClick}
          >
            <title>Click the sleeping celestial cat to pet it! 🐾💤</title>
            {/* Cat aura glow */}
            <ellipse cx="452" cy="74" rx="42" ry="24" fill="#c084fc" opacity="0.18" filter="url(#celestial-glow)" />

            {/* Dangling Sleeping Tail (sways softly off the branch) */}
            <path
              d="M 488 78 C 505 82 518 95 510 118 C 506 128 496 132 492 124 C 488 116 498 102 492 90"
              fill="none"
              stroke="url(#celestial-cat-fur)"
              strokeWidth="7"
              strokeLinecap="round"
              className="animate-tail-wag"
              style={{ transformOrigin: '488px 80px' }}
            />

            {/* Curled Sleeping Cat Body (wearing the cute pumpkin suit!) */}
            <g className="animate-cat-breathe">
              {/* Back body mass */}
              <ellipse cx="460" cy="74" rx="26" ry="17" fill="url(#celestial-cat-fur)" />

              {/* Cat WEARING the Pumpkin Costume Suit only in Halloween mode */}
              {themeMode === 'halloween' ? (
                <g className="cat-pumpkin-suit-on-tree">
                  {/* Pumpkin outer lobes */}
                  <ellipse cx="440" cy="74" rx="13" ry="16" fill="url(#cat-pumpkin-body)" />
                  <ellipse cx="464" cy="74" rx="13" ry="16" fill="url(#cat-pumpkin-body)" />
                  {/* Pumpkin center tummy lobe */}
                  <ellipse cx="452" cy="75" rx="14" ry="17" fill="url(#cat-pumpkin-body)" stroke="#d84315" strokeWidth="0.4" />

                  {/* Grooves on pumpkin costume */}
                  <path d="M 445 60 Q 440 75 445 88" stroke="#8a1c00" strokeWidth="0.8" fill="none" opacity="0.45" />
                  <path d="M 460 60 Q 465 75 460 88" stroke="#8a1c00" strokeWidth="0.8" fill="none" opacity="0.45" />

                  {/* Carved smiling sleeping jack-o'-lantern face on the pumpkin tummy */}
                  <g filter="url(#moon-soft-glow)">
                    <path d="M 444 71 Q 447 73 450 71" stroke="#ffb300" strokeWidth="1" strokeLinecap="round" fill="none" />
                    <path d="M 454 71 Q 457 73 460 71" stroke="#ffb300" strokeWidth="1" strokeLinecap="round" fill="none" />
                    <polygon points="452,73 450.5,75 453.5,75" fill="#ffe082" />
                    <path d="M 447 77 Q 452 81 457 77" stroke="#ffb300" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  </g>

                  {/* Cute green leaf collar where the cat's neck emerges */}
                  <path d="M 432 63 Q 428 58 435 56 Q 436 62 432 63 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="0.4" />
                  <path d="M 435 68 Q 428 69 432 74 Q 436 71 435 68 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="0.4" />
                  <path d="M 430 63 Q 422 64 426 69 Q 431 66 430 63 Z" fill="#81c784" stroke="#1b5e20" strokeWidth="0.4" />
                </g>
              ) : (
                /* Natural Starry Sleeping Fur Pattern in Dark & Candy mode */
                <g className="cat-natural-fur-pattern">
                  <circle cx="448" cy="73" r="1.8" fill={themeMode === 'candy' ? '#ffd166' : '#38bdf8'} filter="url(#moon-soft-glow)" />
                  <circle cx="462" cy="76" r="1.4" fill={themeMode === 'candy' ? '#f472b6' : '#c084fc'} />
                  <circle cx="456" cy="68" r="1.2" fill="#ffffff" />
                  <path d="M 442 70 Q 445 74 448 70" stroke={themeMode === 'candy' ? '#f472b6' : '#818cf8'} strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.6" />
                </g>
              )}

              {/* Cat's Sleeping Head resting snugly on the branch */}
              <circle cx="418" cy="70" r="16" fill="url(#celestial-cat-fur)" />

              {/* Ears */}
              <polygon points="408,61 400,42 416,53" fill="#6366f1" />
              <polygon points="409,58 403,46 414,54" fill="#f472b6" />
              <polygon points="426,60 434,42 422,53" fill="#a855f7" />
              <polygon points="425,58 431,46 422,54" fill="#f472b6" />

              {/* Glowing Forehead Crescent Moon */}
              <path
                d="M 416 57 A 4 4 0 0 0 420 65 A 3 3 0 0 1 416 57"
                fill="#fef08a"
                filter="url(#moon-soft-glow)"
              />

              {/* Sleeping Eyes (sweet curved sleeping arcs) */}
              <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none">
                <path d="M 410 70 Q 414 74 418 70" />
                <path d="M 422 70 Q 426 74 430 70" />
              </g>

              {/* Rosy cheeks */}
              <ellipse cx="407" cy="74" rx="2.5" ry="1.2" fill="#f472b6" opacity="0.8" />
              <ellipse cx="432" cy="74" rx="2.5" ry="1.2" fill="#f472b6" opacity="0.8" />

              {/* Cute nose & sleeping smile */}
              <polygon points="418,74 422,74 420,76" fill="#f472b6" />
              <path d="M 417 77 Q 420 79 423 77" stroke="#ffffff" strokeWidth="1.2" fill="none" strokeLinecap="round" />

              {/* Glowing whiskers */}
              <line x1="398" y1="72" x2="408" y2="73" stroke="#c084fc" strokeWidth="1.2" />
              <line x1="398" y1="76" x2="408" y2="75" stroke="#c084fc" strokeWidth="1.2" />
              <line x1="438" y1="72" x2="428" y2="73" stroke="#c084fc" strokeWidth="1.2" />
              <line x1="438" y1="76" x2="428" y2="75" stroke="#c084fc" strokeWidth="1.2" />

              {/* Tucked Sleeping Front Paws */}
              <ellipse cx="414" cy="85" rx="5" ry="3.5" fill="#fdf4ff" stroke="#c084fc" strokeWidth="0.5" />
              <ellipse cx="426" cy="85" rx="5" ry="3.5" fill="#fdf4ff" stroke="#c084fc" strokeWidth="0.5" />

              {themeMode === 'halloween' && (
                /* Tiny green pumpkin vine sprout clip on cat's left ear */
                <g transform="translate(412, 45) scale(0.68) rotate(-10)">
                  <path d="M 0 0 C -2 -4 -5 -6 -3 -10 C -1 -13 3 -12 2 -8 Z" fill="#2e7d32" />
                  <path d="M 0 -4 C -5 -7 -8 -6 -7 -2 C -6 2 -1 0 0 -4 Z" fill="#4caf50" />
                  <ellipse cx="0" cy="1" rx="2.5" ry="1.2" fill="#ff7043" />
                </g>
              )}
              {themeMode === 'candy' && (
                /* Cute tiny sugar candy pin on ear */
                <g transform="translate(412, 45) scale(0.7) rotate(-5)">
                  <circle cx="0" cy="0" r="3" fill="#f472b6" />
                  <circle cx="0" cy="0" r="1.2" fill="#fef08a" />
                </g>
              )}
            </g>

            {/* Floating Animated "Zzz" Letters */}
            <g className="cat-sleeping-zzz select-none pointer-events-none" fontWeight="bold" fontFamily="monospace">
              <text x="398" y="52" fill="#fef08a" fontSize="13" className="animate-zzz-1">z</text>
              <text x="390" y="40" fill="#e9d5ff" fontSize="15" className="animate-zzz-2">Z</text>
              <text x="380" y="26" fill="#fbcfe8" fontSize="18" className="animate-zzz-3">Z</text>
            </g>
          </g>
        </svg>
      </div>

      {/* =========================================================================
          PART 3: THE ACTION BUTTONS CRADLED & WRAPPED BY LIVING PURPLE ROOTS!
          ========================================================================= */}
      <div className="relative mt-[-18px] w-full px-2 sm:px-4">
        {/* Background Root Cradle Layer (organically wraps underneath the buttons) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
          <svg
            viewBox="0 0 740 130"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Root Gradient */}
              <linearGradient id="root-deep-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b0764" />
                <stop offset="50%" stopColor="#2e1065" />
                <stop offset="100%" stopColor="#170630" />
              </linearGradient>
              <linearGradient id="root-tendril-accent" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7e22ce" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>

            {/* Central Root Trunk Base descending into the button bed */}
            <path
              d="M 335 0 C 330 20 310 35 270 45 C 230 55 170 60 90 70 L 95 85 C 180 75 240 70 285 58 C 330 46 350 25 355 0 Z"
              fill="url(#root-deep-grad)"
              stroke="#20083b"
              strokeWidth="1.5"
            />
            <path
              d="M 385 0 C 390 20 410 35 460 45 C 510 55 580 60 650 70 L 645 85 C 570 75 500 70 450 58 C 400 46 380 25 375 0 Z"
              fill="url(#root-deep-grad)"
              stroke="#20083b"
              strokeWidth="1.5"
            />
            {/* Center root digging down between Button 1 & Button 2 */}
            <path
              d="M 355 0 C 358 30 362 60 366 100 L 378 100 C 374 60 370 30 367 0 Z"
              fill="url(#root-deep-grad)"
              stroke="#20083b"
              strokeWidth="1.2"
            />

            {/* Continuous bottom root shelf running right under all 3 buttons! */}
            <path
              d="M 20 78 C 80 82 180 85 270 82 C 360 80 440 80 530 84 C 620 87 680 85 720 78 C 725 94 670 102 550 98 C 430 95 330 96 220 98 C 110 100 25 96 20 78 Z"
              fill="url(#root-deep-grad)"
              stroke="#2e1065"
              strokeWidth="1.5"
            />

            {/* Luminous Root Vein Highlights that glow across the bottom */}
            <path
              d="M 35 84 Q 160 89 275 85 Q 380 82 485 86 Q 600 89 705 83"
              stroke="url(#root-tendril-accent)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.85"
            />
            <path
              d="M 75 88 Q 200 93 330 90 Q 460 88 590 92 Q 670 91 695 87"
              stroke="#e879f9"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Glowing Bioluminescent Spores along the roots */}
            <circle cx="95" cy="86" r="3.2" fill="#c084fc" className="animate-root-spore" />
            <circle cx="240" cy="84" r="3" fill="#38bdf8" className="animate-root-spore" />
            <circle cx="366" cy="85" r="3.8" fill="#f0abfc" className="animate-root-spore" />
            <circle cx="490" cy="86" r="3" fill="#38bdf8" className="animate-root-spore" />
            <circle cx="630" cy="87" r="3.2" fill="#c084fc" className="animate-root-spore" />
          </svg>
        </div>

        {/* The 3 Buttons Toolbar (Fully accessible, interactive, and responsive) */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 w-full py-2">
          {/* 1. "Launch workspace" Button */}
          <div className="relative flex-1 min-w-[200px]">
            <button
              className={`w-full px-6 py-4 rounded-xl font-extrabold text-xs tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border ${
                themeMode === 'halloween'
                  ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-black shadow-2xl shadow-orange-500/30 border-orange-400/50 hover:border-orange-300'
                  : themeMode === 'candy'
                  ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-white shadow-2xl shadow-pink-500/30 border-pink-400/50 hover:border-pink-300'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-2xl shadow-white/10 border-white/60'
              }`}
              onClick={onLaunch}
            >
              <span>{launchLabel} {themeMode === 'halloween' ? '🎃' : themeMode === 'candy' ? '🍬' : '⚡'}</span>
              <ArrowUp size={15} style={{ transform: 'rotate(45deg)' }} />
            </button>

            {/* Left Root Tendril wrapping around bottom-left corner */}
            <svg
              viewBox="0 0 60 40"
              className="absolute -bottom-3 -left-3 w-12 h-8 pointer-events-none z-20 overflow-visible"
            >
              {/* Root claw wrapping up around bottom-left corner */}
              <path
                d="M 5 35 Q 2 20 8 10 Q 14 5 18 12 Q 12 25 25 28 Q 38 30 52 35"
                stroke="#581c87"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 5 35 Q 2 20 8 10 Q 14 5 18 12 Q 12 25 25 28 Q 38 30 52 35"
                stroke={themeMode === 'candy' ? '#f472b6' : '#c084fc'}
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Little sprout / spore on root */}
              <path d="M 12 12 Q 7 5 11 2 Q 17 6 12 12 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="0.4" />
              <circle cx="8" cy="10" r="2" fill={themeMode === 'candy' ? '#fde047' : '#fef08a'} />
            </svg>
          </div>

          {/* 1.5 "Enter IDE" Button (Docx-IDE) */}
          {onEnterIDE && (
            <div className="relative flex-1 min-w-[200px]">
              <button
                className={`w-full px-5 py-4 rounded-xl font-bold text-xs tracking-wider uppercase inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xl border ${
                  themeMode === 'halloween'
                    ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 hover:from-purple-800 hover:to-indigo-800 text-purple-100 border-purple-500/50 hover:border-purple-300 shadow-purple-950/60'
                    : themeMode === 'candy'
                    ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 hover:from-pink-500 hover:to-indigo-500 text-white border-pink-300 shadow-pink-200/50'
                    : 'bg-[#181c2b] hover:bg-[#202538] border border-blue-500/40 hover:border-blue-400 text-white shadow-blue-950/40'
                }`}
                onClick={onEnterIDE}
              >
                <Code2 size={16} className={themeMode === 'candy' ? 'text-white' : 'text-blue-400'} />
                <span>{enterIDELabel}</span>
              </button>
            </div>
          )}

          {/* 2. "Configure API Keys" Button */}
          <div className="relative flex-1 min-w-[200px]">
            <button
              className={`w-full px-5 py-4 rounded-xl font-semibold text-xs tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xl ${
                themeMode === 'halloween'
                  ? 'bg-[#1d0a33] hover:bg-[#2a0e4b] border border-orange-500/35 hover:border-orange-400 text-orange-100 shadow-purple-950/40'
                  : themeMode === 'candy'
                  ? 'bg-white hover:bg-pink-50/70 border border-pink-200/90 hover:border-pink-300 text-slate-800 shadow-pink-100/60'
                  : 'bg-[#11131a] hover:bg-[#181b24] border border-white/15 hover:border-white/30 text-zinc-200 shadow-black/50'
              }`}
              onClick={onSettings}
            >
              <KeyRound size={15} className={themeMode === 'candy' ? 'text-pink-500' : themeMode === 'halloween' ? 'text-orange-300' : 'text-zinc-400'} />
              <span>{settingsLabel}</span>
            </button>

            {/* Center Root Tendril hugging the bottom edge */}
            <svg
              viewBox="0 0 70 25"
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-16 h-6 pointer-events-none z-20 overflow-visible"
            >
              <path
                d="M 2 18 Q 20 8 35 14 Q 50 20 68 12"
                stroke="#4c1d95"
                strokeWidth="4.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 2 18 Q 20 8 35 14 Q 50 20 68 12"
                stroke={themeMode === 'candy' ? '#f472b6' : '#d946ef'}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
              />
              <circle cx="35" cy="14" r="2.2" fill={themeMode === 'candy' ? '#ffd166' : '#38bdf8'} />
            </svg>
          </div>

          {/* 3. "Interactive Guide" Button */}
          {onOpenGuide && (
            <div className="relative flex-1 min-w-[200px]">
              <button
                className={`w-full px-5 py-4 rounded-xl font-semibold text-xs tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xl ${
                  themeMode === 'halloween'
                    ? 'bg-purple-950/45 hover:bg-purple-900/60 border border-purple-500/40 hover:border-purple-300 text-purple-200 hover:text-white shadow-purple-950/40'
                    : themeMode === 'candy'
                    ? 'bg-white hover:bg-amber-50/70 border border-amber-200/90 hover:border-amber-300 text-slate-800 hover:text-slate-900 shadow-amber-100/60'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 hover:border-white/30 text-zinc-300 hover:text-white shadow-black/50'
                }`}
                onClick={onOpenGuide}
              >
                <Terminal size={15} className={themeMode === 'candy' ? 'text-amber-500' : themeMode === 'halloween' ? 'text-purple-300' : 'text-zinc-400'} />
                <span>{guideLabel}</span>
              </button>

              {/* Right Root Tendril wrapping around bottom-right corner */}
              <svg
                viewBox="0 0 60 40"
                className="absolute -bottom-3 -right-3 w-12 h-8 pointer-events-none z-20 overflow-visible"
              >
                <path
                  d="M 55 35 Q 58 20 52 10 Q 46 5 42 12 Q 48 25 35 28 Q 22 30 8 35"
                  stroke="#581c87"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 55 35 Q 58 20 52 10 Q 46 5 42 12 Q 48 25 35 28 Q 22 30 8 35"
                  stroke="#c084fc"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Sprout & glowing spore */}
                <path d="M 48 12 Q 53 5 49 2 Q 43 6 48 12 Z" fill="#4caf50" stroke="#1b5e20" strokeWidth="0.4" />
                <circle cx="52" cy="10" r="2" fill="#fef08a" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
