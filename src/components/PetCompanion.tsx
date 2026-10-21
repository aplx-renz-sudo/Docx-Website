import { useState, useEffect, useRef } from 'react';
import type { PetId, PetPosition, ThemeMode } from '../types';
import { sounds } from '../lib/audio';
import { PetArtwork } from './PetArtwork';

export type PetMood = 'idle' | 'typing' | 'thinking' | 'happy' | 'sleeping';

type PetProps = {
  petId: PetId;
  position: PetPosition;
  size: 'small' | 'medium' | 'large';
  mood: PetMood;
  soundEnabled: boolean;
  interactive?: boolean;
  themeMode?: ThemeMode;
};

export const PET_DATABASE: Record<
  PetId,
  {
    name: string;
    avatar: string;
    desc: string;
    dialogue: { idle: string; happy: string; typing: string; thinking: string };
  }
> = {
  fox: {
    name: 'Cyber Fox',
    avatar: '🦊',
    desc: 'Quick-witted, agile companion with glowing cybernetic visor and neon tail.',
    dialogue: {
      idle: 'Scanning starways... Ready for your next idea! 🦊',
      happy: 'Tail wagging at 100%! Yay! ✨',
      typing: 'Ooh, what are we creating next?',
      thinking: 'Synthesizing neural pathways...',
    },
  },
  cat: {
    name: 'Celestial Cat',
    avatar: '🐱',
    desc: 'Purring cosmic feline with floating stardust and starlight aura.',
    dialogue: {
      idle: 'Watching cosmic dust float by 🐾',
      happy: 'Purrrrrrr! Best prompt ever! 💖',
      typing: 'Watching your keystrokes intently...',
      thinking: 'Chasing thoughts in the void...',
    },
  },
  bunny: {
    name: 'Pixel Bunny',
    avatar: '🐰',
    desc: 'Bouncy hyper-speed rabbit that munches on compressed tokens.',
    dialogue: {
      idle: 'Hop into tomorrow! 🐰',
      happy: 'Wheeeeee! Rocket fueled! 🎉',
      typing: 'Fast fingers! What are we writing?',
      thinking: 'Calculating quantum hops...',
    },
  },
  dragon: {
    name: 'Cosmic Dragon',
    avatar: '🐉',
    desc: 'Ancient mystical dragon guardian protecting your private keys.',
    dialogue: {
      idle: 'Guarding your private keys 🐉',
      happy: 'Sparkling flame burst! 🔥✨',
      typing: 'Dragon eyes watching...',
      thinking: 'Breathing cosmic knowledge...',
    },
  },
  slime: {
    name: 'Slime Bob',
    avatar: '💧',
    desc: 'Playful gelatinous blob that jiggles happily with every prompt.',
    dialogue: {
      idle: '*Squish squish* Bouncing along 💧',
      happy: 'Jiggle jiggle! Splish splash! ✨',
      typing: 'Blob mode on!',
      thinking: '*Goo ripple effect*...',
    },
  },
  robo: {
    name: 'Robo Orb',
    avatar: '🤖',
    desc: 'Precision AI bot computing token conservation algorithms.',
    dialogue: {
      idle: 'Status: Optimal. Awaiting instructions. 🤖',
      happy: 'EFFICIENCY RATING: 100%! 🌟',
      typing: 'BUFFERING KEYSTROKES...',
      thinking: 'QUERYING NEURAL MESH...',
    },
  },
  shiba: {
    name: 'Shiba Sparky',
    avatar: '🐕',
    desc: 'Astronaut doge on an exploratory interstellar journey.',
    dialogue: {
      idle: 'Much space, very AI! 🐕',
      happy: 'SUCH WOW! MUCH LOVE! 💖',
      typing: 'Very excite! Ready to launch!',
      thinking: 'Much think, such concentration...',
    },
  },
  none: {
    name: 'No Companion',
    avatar: '🚫',
    desc: 'Minimalist mode without companion avatars.',
    dialogue: {
      idle: '',
      happy: '',
      typing: '',
      thinking: '',
    },
  },
};

export const PET_DIALOGUES: Record<
  PetId,
  { idle: string[]; happy: string[]; thinking: string[]; typing: string[] }
> = {
  fox: {
    idle: ['Wearing my cute pumpkin suit! 🎃', 'Scanning starways...', 'All systems ready!', 'Hunting for bugs 🦊', 'Foxy pumpkin insights online!'],
    happy: ['Yay! Great conversation! 💖', 'High five, human!', 'Tail wagging at 100%! ✨', 'Look at my cute pumpkin costume! lol 🎃', 'Trick or treat! 🍬'],
    thinking: [
      'Conjuring spooky pumpkin spells... 🎃',
      'Stirring the midnight code cauldron... 🔮',
      'Summoning spectral tokens from the crypt... 👻',
      'Whispering to haunted ghost workers... 🦇',
    ],
    typing: ['Ooh, what are we asking?!', 'Listening closely...', 'Ready!'],
  },
  cat: {
    idle: ['Wearing my cozy pumpkin suit! Purrr 🎃', 'Watching cosmic dust float by 🐾', 'Nap time soon?', 'Meow-gical computing!'],
    happy: ['Purrrrrrr! Best prompt ever! 💖', 'Paw-some answer!', 'Do you like me wearing the pumpkin? 🎃', 'Purr-fect pumpkin costume! ✨'],
    thinking: [
      'Consulting the black cat coven... 🐈‍⬛',
      'Brewing pumpkin potion in the cauldron... 🎃',
      'Gazing into the obsidian crystal ball... 🔮',
      'Chasing phantom wisps in the crypt... 👻',
    ],
    typing: ['Type type type!', 'Ooh exciting input...', 'Watching your keys!'],
  },
  bunny: {
    idle: ['Boing! Wearing my pumpkin onesie! 🎃', 'Nibbling on compressed data', 'Hop into tomorrow!', 'Ears perked up!'],
    happy: ['Wheeeeee! 🎉', 'Super speedy response!', 'Look at me wearing the pumpkin! 🎃', 'Candy corn harvest! 🍬'],
    thinking: [
      'Hopping through the haunted pumpkin patch! 🎃',
      'Munching on spooky candy corn... 🍬',
      'Casting warp hexes under the full moon... 🌙',
      'Carving quantum pumpkin thoughts... 🪄',
    ],
    typing: ['Fast fingers!', 'What are we writing?', 'Hop hop!'],
  },
  dragon: {
    idle: ['Guarding your private keys 🐉', 'Wearing my mighty pumpkin suit! 🎃', 'Cosmic embers glowing', 'Roar of intelligence!'],
    happy: ['Sparkling flame burst! 🔥✨', 'Wisdom ignited!', 'Dragon pumpkin armor looks so cute! 🎃', 'Spooky flame dance! 🔥'],
    thinking: [
      'Breathing eerie jack-o\'-lantern fire! 🎃🔥',
      'Awakening ancient graveyard spirits... 🪦',
      'Guarding the cursed crypt of tokens... 🐉',
      'Channeling spooky dragon magic... ✨',
    ],
    typing: ['Incinerating typos...', 'Dragon eyes watching...', 'Speak, traveler!'],
  },
  slime: {
    idle: ['*Inside my cute pumpkin suit!* 🎃', 'Bouncing along 💧', 'Gooey and happy in my pumpkin!', 'Gelatinous joy!'],
    happy: ['*Bouncing happily!* 💖', 'Jiggle jiggle in my pumpkin! ✨', 'Splish splash!', 'Slime pumpkin wiggle! 🎃'],
    thinking: [
      '*Gooey witch slime bubbling in cauldron* 🧪',
      'Melting into ectoplasm... 👻',
      'Slime-o\'-lantern glowing in the dark! 🎃',
      'Spooky oozing thoughts... 🫧',
    ],
    typing: ['*Watching intently*', 'Wiggle wiggle!', 'Blob mode on!'],
  },
  robo: {
    idle: ['BEEP BOOP 🤖', 'WEARING PUMPKIN MECH CHASSIS 🎃', 'Status: Optimal', 'Telemetry clear.'],
    happy: ['EFFICIENCY RATING: 100%! 🌟', 'DOPAMINE PROTOCOL ACTIVATED', 'PUMPKIN ARMOR 100% CUTE LOL 🎃', 'HALLOWEEN BOOST ONLINE ⚡'],
    thinking: [
      'HALLOWEEN PROTOCOL: CARVING PUMPKINS 🎃',
      'SPOOKY NEURAL SPELL CHARGING... ⚡',
      'DETECTING PHANTOM FREQUENCIES 👻',
      'ECTOPLASM VOLTAGE NOMINAL 🔮',
    ],
    typing: ['BUFFERING KEYSTROKES...', 'INPUT DETECTED', 'PROCESSING...'],
  },
  shiba: {
    idle: ['Much space, very AI! 🐕', 'Wearing my pumpkin astronaut suit! 🎃', 'Sniffing tokens...', 'Good vibes only!'],
    happy: ['SUCH WOW! 🌟', 'VERY SMART! MUCH LOVE! 💖', 'Look at doge wearing the pumpkin! 🎃', 'MUCH TREAT, VERY SPOOK! 🍬'],
    thinking: [
      'Much spooky, very boo! 👻',
      'Pumpkin doge doing a conjure! 🎃',
      'Barking at friendly ghosts! 🐕',
      'Such haunting, much candy! 🍬',
    ],
    typing: ['Watching you type!', 'Very excite!', 'Ready to launch!'],
  },
  none: {
    idle: [],
    happy: [],
    thinking: [],
    typing: [],
  },
};

export function PetCompanion({
  petId,
  position,
  size,
  mood,
  soundEnabled,
  interactive = true,
  themeMode = 'halloween',
}: PetProps) {
  const [speech, setSpeech] = useState<string | null>(null);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [currentMood, setCurrentMood] = useState<PetMood>(mood);
  const speechTimer = useRef<number | null>(null);

  useEffect(() => {
    setCurrentMood(mood);
    if (petId === 'none') return;

    // Pick dialogue when mood changes
    const pool = PET_DIALOGUES[petId]?.[mood === 'sleeping' ? 'idle' : mood] || [];
    if (pool.length > 0 && Math.random() > 0.4) {
      setSpeech(pool[Math.floor(Math.random() * pool.length)]);
      if (speechTimer.current) clearTimeout(speechTimer.current);
      speechTimer.current = window.setTimeout(() => setSpeech(null), 3800);
    }
  }, [mood, petId]);

  if (petId === 'none') return null;

  const handlePetClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    if (soundEnabled) sounds.playPetChirp();
    setCurrentMood('happy');

    // Add celebratory particles adapted to theme
    const rect = e.currentTarget.getBoundingClientRect();
    const treats =
      themeMode === 'halloween'
        ? ['🎃', '🍬', '👻', '✨', '🦇', '💖']
        : themeMode === 'candy'
        ? ['🍬', '🍭', '✨', '🍓', '🧁', '💖', '⭐']
        : ['✨', '⭐', '⚡', '💫', '💖', '🚀'];
    const chosenEmoji = treats[Math.floor(Math.random() * treats.length)];
    const newHeart = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left - 10,
      y: e.clientY - rect.top - 20,
      emoji: chosenEmoji,
    };
    setHearts(prev => [...prev.slice(-4), newHeart]);

    const happyQuotes = PET_DIALOGUES[petId]?.happy || ['*Happy noises* 💖'];
    setSpeech(happyQuotes[Math.floor(Math.random() * happyQuotes.length)]);

    if (speechTimer.current) clearTimeout(speechTimer.current);
    speechTimer.current = window.setTimeout(() => {
      setSpeech(null);
      setCurrentMood('idle');
    }, 3200);
  };

  const sizePixelMap = {
    small: 48,
    medium: 64,
    large: 84,
  };

  const positionClasses = {
    'bottom-right': 'fixed bottom-24 right-6 z-40',
    composer: 'absolute -top-16 right-4 z-30',
    header: 'inline-flex items-center ml-2 z-20',
    floating: 'fixed top-24 right-8 z-40',
  };

  const bubbleThemeStyles =
    themeMode === 'candy'
      ? currentMood === 'thinking'
        ? 'bg-white/95 border border-pink-300 text-slate-800 shadow-[0_4px_24px_rgba(244,114,182,0.25)]'
        : 'bg-white/95 border border-pink-200 text-slate-800 shadow-[0_4px_20px_rgba(244,114,182,0.18)]'
      : themeMode === 'dark'
      ? currentMood === 'thinking'
        ? 'bg-[#141824]/95 border border-blue-400/40 text-[#dce6ff] shadow-[0_4px_24px_rgba(59,130,246,0.25)]'
        : 'bg-[#101422]/95 border border-[#8ea8ff55] text-[#dce6ff]'
      : currentMood === 'thinking'
      ? 'bg-[#190a30]/95 border border-[#ff7a0088] text-[#ffe8d6] shadow-[0_4px_24px_rgba(255,122,0,0.25)]'
      : 'bg-[#101422]/95 border border-[#8ea8ff55] text-[#dce6ff]';

  return (
    <div className={`pet-container group select-none ${positionClasses[position]}`}>
      {/* Speech bubble */}
      {speech && (
        <div
          className={`pet-bubble absolute bottom-full mb-2 right-0 max-w-[220px] px-3.5 py-2.5 rounded-xl text-xs shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none z-50 transition-all ${bubbleThemeStyles}`}
        >
          {currentMood === 'thinking' && (
            <div
              className={`flex items-center gap-1.5 mb-1 pb-1 border-b text-[10px] font-mono font-bold uppercase tracking-wider ${
                themeMode === 'candy'
                  ? 'border-pink-200 text-pink-600'
                  : themeMode === 'dark'
                  ? 'border-blue-500/30 text-blue-400'
                  : 'border-orange-500/25 text-orange-400'
              }`}
            >
              <span className="text-xs">{themeMode === 'candy' ? '🍬' : themeMode === 'dark' ? '⚡' : '🎃'}</span>
              <span>{themeMode === 'candy' ? 'Sweet Deliberation' : themeMode === 'dark' ? 'Neural Deliberation' : 'Spooky Deliberation'}</span>
            </div>
          )}
          <p className="leading-snug">{speech}</p>
          <div
            className={`absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 ${
              themeMode === 'candy'
                ? 'bg-white border-r border-b border-pink-200'
                : themeMode === 'dark'
                ? 'bg-[#101422] border-r border-b border-[#8ea8ff55]'
                : 'bg-[#190a30] border-r border-b border-[#ff7a0088]'
            }`}
          />
        </div>
      )}

      {/* Floating Treats & Hearts */}
      {hearts.map(h => (
        <span
          key={h.id}
          className="absolute pointer-events-none text-sm animate-float-heart z-50 filter drop-shadow-[0_0_6px_rgba(255,140,0,0.6)]"
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
        >
          {(h as any).emoji || '💖'}
        </span>
      ))}

      {/* Pet Avatar Graphic */}
      <button
        type="button"
        onClick={handlePetClick}
        title={`Click to pet your ${themeMode === 'candy' ? 'candy companion' : themeMode === 'halloween' ? 'Halloween companion' : 'AI companion'}!`}
        className={`pet-avatar-btn playful-pop relative flex items-center justify-center p-2 rounded-2xl transition-all cursor-pointer shadow-xl ${
          themeMode === 'candy'
            ? 'bg-white/95 border border-pink-200 hover:border-pink-400 shadow-pink-100 hover:shadow-pink-200/50'
            : themeMode === 'dark'
            ? 'bg-[#121622]/90 border border-white/10 hover:border-blue-400/50 shadow-black/60'
            : 'bg-[#0b0f1a]/85 border border-[#2b354f] hover:border-[#ff8c00] hover:shadow-[#ff7a0033]'
        }`}
      >
        <PetArtwork
          petId={petId}
          mood={currentMood}
          size={sizePixelMap[size]}
          hasPumpkin={themeMode === 'halloween'}
        />

        {/* Ambient Thinking Indicator */}
        {currentMood === 'thinking' && (
          <div
            className="absolute -top-3.5 -right-2 flex items-center gap-0.5 animate-bounce z-30 pointer-events-none"
            title="Thoughts brewing!"
          >
            {themeMode === 'candy' ? (
              <>
                <span className="text-sm animate-pulse">🍬</span>
                <span className="text-[11px] animate-pulse">✨</span>
              </>
            ) : themeMode === 'dark' ? (
              <>
                <span className="text-sm text-blue-400 animate-pulse">⚡</span>
                <span className="text-[11px] text-cyan-300 animate-pulse">●</span>
              </>
            ) : (
              <>
                <span className="text-sm filter drop-shadow-[0_0_10px_rgba(255,122,0,0.95)] animate-pulse">🎃</span>
                <span className="text-[11px] text-purple-300 animate-pulse">👻</span>
              </>
            )}
          </div>
        )}
        {currentMood === 'happy' && (
          <span className="absolute -top-2 -left-1 text-xs animate-bounce filter drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]">
            {themeMode === 'candy' ? '🍬✨' : themeMode === 'dark' ? '⭐✨' : '🎃✨'}
          </span>
        )}
        {currentMood === 'typing' && (
          <span
            className={`absolute -bottom-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm ${
              themeMode === 'candy'
                ? 'bg-pink-500 text-white'
                : themeMode === 'dark'
                ? 'bg-blue-600 text-white'
                : 'bg-orange-500 text-black'
            }`}
          >
            {themeMode === 'candy' ? '🍭...' : themeMode === 'dark' ? '⚡...' : '🦇...'}
          </span>
        )}
      </button>
    </div>
  );
}
