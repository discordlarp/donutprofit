'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Layers, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/sound';
import { formatCash } from '@/lib/format';
import { secureRandom } from '@/lib/cryptoRandom';

const FLOOR_MULTIPLIERS = [1.25, 1.45, 1.65, 1.80, 1.95, 2.00];

interface FloorState {
  tiles: ('hidden' | 'gem' | 'bomb')[];
  bombIdx: number;
}

export default function TowersGame() {
  const { user, recordBet } = useGame();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [currentFloor, setCurrentFloor] = useState<number>(0);
  const [floors, setFloors] = useState<FloorState[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const startTowers = () => {
    if (gameActive) return;
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please sign in to play.');
      return;
    }
    if (betAmount <= 0) {
      setErrorMsg('Enter a valid bet amount.');
      return;
    }
    if (betAmount > user.balance) {
      setErrorMsg('Insufficient Cash balance!');
      return;
    }

    // Generate random bomb position for each of the 6 floors using secure hardware RNG
    const newFloors: FloorState[] = FLOOR_MULTIPLIERS.map(() => ({
      tiles: ['hidden', 'hidden', 'hidden'],
      bombIdx: Math.floor(secureRandom() * 3),
    }));

    setFloors(newFloors);
    setCurrentFloor(0);
    setGameActive(true);
    sound.playClick();
  };

  const pickTile = (tileIndex: number) => {
    if (!gameActive) return;

    const floor = floors[currentFloor];
    const isBomb = tileIndex === floor.bombIdx;

    const updatedFloors = [...floors];
    const newTiles: ('hidden' | 'gem' | 'bomb')[] = [...floor.tiles];
    newTiles[tileIndex] = isBomb ? 'bomb' : 'gem';
    updatedFloors[currentFloor] = { ...floor, tiles: newTiles };
    setFloors(updatedFloors);

    if (isBomb) {
      // Hit TNT!
      sound.playBomb();
      setGameActive(false);
      recordBet('towers', betAmount, 0, false, { floor: currentFloor });
    } else {
      // Safe Emerald!
      sound.playGem();
      const nextFloor = currentFloor + 1;
      setCurrentFloor(nextFloor);

      if (nextFloor >= FLOOR_MULTIPLIERS.length) {
        // Beat all 6 floors! (MAX 4.00X)
        sound.playWin();
        setGameActive(false);
        const maxMult = 2.00;
        recordBet('towers', betAmount, maxMult, true, { reachedFloor: 6 });
        confetti({ particleCount: 100, spread: 80 });
      }
    }
  };

  const cashOut = () => {
    if (!gameActive || currentFloor === 0) return;
    const mult = Math.min(2.00, FLOOR_MULTIPLIERS[currentFloor - 1]);
    sound.playWin();
    setGameActive(false);
    recordBet('towers', betAmount, mult, true, { reachedFloor: currentFloor });
    confetti({ particleCount: 75, spread: 60 });
  };

  return (
    <div className="bg-[#0f1118] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">DONUT TOWERS</h2>
            <span className="bg-emerald-500/20 text-[#00e701] text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm">
              MAX 2.00X
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pick safe emerald blocks on each level to climb the tower. Cash out anytime before hitting a TNT bomb!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3D Tower Floors Stage (Climbing Bottom to Top) */}
      <div className="bg-[#090a0f] border border-white/5 rounded-2xl p-6 mb-6 flex flex-col gap-2.5 max-w-lg mx-auto shadow-inner">
        {[...FLOOR_MULTIPLIERS].reverse().map((mult, revIdx) => {
          const floorIdx = FLOOR_MULTIPLIERS.length - 1 - revIdx;
          const isCurrent = currentFloor === floorIdx && gameActive;
          const isPassed = currentFloor > floorIdx;
          const floorData = floors[floorIdx];

          return (
            <div
              key={floorIdx}
              className={`p-2.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                isCurrent
                  ? 'bg-gradient-to-r from-emerald-950/60 via-[#102419] to-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                  : isPassed
                  ? 'bg-emerald-950/20 border-emerald-600/30 text-emerald-400'
                  : 'bg-[#12141c]/60 border-white/5 opacity-50'
              }`}
            >
              {/* Floor Label & Multiplier */}
              <div className="flex items-center gap-2 pl-2">
                <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 text-white font-mono font-black text-xs flex items-center justify-center">
                  {floorIdx + 1}
                </span>
                <span className={`font-mono font-black text-xs ${isPassed || isCurrent ? 'text-[#00e701]' : 'text-neutral-400'}`}>
                  {mult.toFixed(2)}x
                </span>
              </div>

              {/* 3 Tower Block Tiles */}
              <div className="flex items-center gap-2.5">
                {[0, 1, 2].map((tIdx) => {
                  const tileState = floorData ? floorData.tiles[tIdx] : 'hidden';
                  return (
                    <button
                      key={tIdx}
                      disabled={!isCurrent}
                      onClick={() => pickTile(tIdx)}
                      className={`w-12 h-11 sm:w-14 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-150 transform ${
                        tileState === 'gem'
                          ? 'bg-gradient-to-b from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/50 scale-105 border border-emerald-300'
                          : tileState === 'bomb'
                          ? 'bg-gradient-to-b from-red-600 to-rose-900 shadow-lg shadow-red-500/50 scale-105 border border-red-400 animate-shake'
                          : isCurrent
                          ? 'bg-[#1b2230] hover:bg-[#253245] border border-white/20 hover:border-emerald-400 cursor-pointer shadow-md active:scale-90 hover:scale-105'
                          : 'bg-[#141722] border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      {tileState === 'gem' ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse">
                          <svg viewBox="0 0 40 40" className="w-full h-full">
                            <polygon points="20,2 37,12 37,28 20,38 3,28 3,12" fill="#10B981" stroke="#A7F3D0" strokeWidth="2" />
                            <polygon points="20,6 33,14 20,22 7,14" fill="#6EE7B7" opacity="0.9" />
                            <polygon points="7,14 20,22 20,34 7,26" fill="#059669" />
                            <polygon points="33,14 20,22 20,34 33,26" fill="#047857" />
                          </svg>
                        </div>
                      ) : tileState === 'bomb' ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-shake">
                          <svg viewBox="0 0 40 40" className="w-full h-full">
                            <rect x="5" y="8" width="30" height="26" rx="3" fill="#DC2626" stroke="#7F1D1D" strokeWidth="2" />
                            <rect x="5" y="17" width="30" height="8" fill="#FFFFFF" />
                            <text x="20" y="23.5" fontSize="6.5" fontWeight="900" fill="#000000" textAnchor="middle" fontFamily="monospace">TNT</text>
                          </svg>
                        </div>
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-sm transition-all ${isCurrent ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-white/10'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Betting & Cashout Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#090a0f] p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-extrabold text-neutral-400">BET:</span>
          <input
            type="number"
            min={1}
            disabled={gameActive}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
            className="w-28 bg-[#151824] border border-white/10 rounded-xl py-2 px-3 text-white font-mono font-bold text-xs outline-none focus:border-emerald-500"
          />
          <div className="flex gap-1.5">
            <button
              disabled={gameActive}
              onClick={() => setBetAmount(prev => Math.max(1, Math.floor(prev / 2)))}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-neutral-300 font-extrabold"
            >
              1/2
            </button>
            <button
              disabled={gameActive}
              onClick={() => setBetAmount(prev => prev * 2)}
              className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-neutral-300 font-extrabold"
            >
              2X
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {gameActive && currentFloor > 0 && (
            <button
              onClick={cashOut}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition animate-pulse"
            >
              CASHOUT {formatCash(FLOOR_MULTIPLIERS[currentFloor - 1] * betAmount)} ({FLOOR_MULTIPLIERS[currentFloor - 1]}x)
            </button>
          )}

          {!gameActive ? (
            <button
              onClick={startTowers}
              className="flex-1 sm:flex-none px-8 py-3.5 bg-[#00e701] hover:bg-[#00c901] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
            >
              START CLIMBING
            </button>
          ) : (
            currentFloor === 0 && (
              <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1.5">
                <span>👆</span> Pick a Floor 1 block!
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
