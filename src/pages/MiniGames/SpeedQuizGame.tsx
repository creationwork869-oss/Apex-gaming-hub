import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Award, CheckCircle2, XCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';

interface Question {
  question: string;
  options: string[];
  answer: number;
}

const QUESTIONS: Question[] = [
  {
    question: 'In esports, what does the abbreviation "FPS" stand for in gaming categories?',
    options: ['First Person Shooter', 'Frames Per Second', 'Fast Player Strike', 'Final Point Score'],
    answer: 0
  },
  {
    question: 'How many numbered sides does a standard cube gaming dice have?',
    options: ['4', '6', '8', '12'],
    answer: 1
  },
  {
    question: 'In Indian card games, which combination outranks a Straight sequence in Teen Patti?',
    options: ['Color (Flush)', 'Pair', 'Trio / Trail', 'High Card'],
    answer: 2
  },
  {
    question: 'Which cryptographic algorithm guarantees provable fairness in AURUM Gaming?',
    options: ['SHA-256', 'MD5', 'AES-128', 'DES'],
    answer: 0
  },
  {
    question: 'What is the sum of dots on two standard dice when both show 6?',
    options: ['10', '12', '14', '16'],
    answer: 1
  }
];

export const SpeedQuizGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser, setCurrentUser, showToast } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'SUMMARY'>('START');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const entryFee = 25;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0 && selectedOption === null) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedOption === null && gameState === 'PLAYING') {
      handleAnswer(-1); // Timed out
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, selectedOption]);

  const startGame = () => {
    if (currentUser.balance < entryFee) {
      showToast('Insufficient wallet balance (₹25 required).', 'error');
      return;
    }
    sound.playClick();
    setCurrentUser((prev) => ({ ...prev, balance: prev.balance - entryFee }));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(10);
    setSelectedOption(null);
    setGameState('PLAYING');
  };

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const q = QUESTIONS[currentIndex];
    const isCorrect = optionIndex === q.answer;

    if (isCorrect) {
      sound.playWin();
      setScore((s) => s + 1);
    } else {
      sound.playTick();
    }

    setTimeout(() => {
      if (currentIndex + 1 < QUESTIONS.length) {
        setCurrentIndex((i) => i + 1);
        setTimeLeft(10);
        setSelectedOption(null);
      } else {
        // Finished
        setGameState('SUMMARY');
        const finalScore = score + (isCorrect ? 1 : 0);
        if (finalScore >= 4) {
          const reward = 100;
          setCurrentUser((prev) => ({ ...prev, balance: prev.balance + reward }));
          sound.playWin();
          showToast(`Mastery Achieved! Scored ${finalScore}/5. Awarded ₹${reward}!`, 'success');
        } else if (finalScore >= 3) {
          const reward = 40;
          setCurrentUser((prev) => ({ ...prev, balance: prev.balance + reward }));
          showToast(`Good job! Scored ${finalScore}/5. Awarded ₹${reward}!`, 'success');
        } else {
          showToast(`Quiz completed. Scored ${finalScore}/5. Try again!`, 'info');
        }
      }
    }, 1200);
  };

  const currentQ = QUESTIONS[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-900/40">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </button>
        <span className="text-xs font-bold text-amber-400">Speed Quiz Arena</span>
      </div>

      {gameState === 'START' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Speed Trivia Challenge</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Answer 5 rapid questions in 10 seconds each. Score 4 or 5 correct to win up to 4x your entry fee!
            </p>
          </div>

          <div className="flex justify-center gap-4 text-xs font-medium text-slate-300">
            <span>Entry: ₹25</span>
            <span>·</span>
            <span>5 Questions</span>
            <span>·</span>
            <span className="text-amber-400">Prize: Up to ₹100</span>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Start Quiz (₹25)
          </button>
        </div>
      )}

      {gameState === 'PLAYING' && currentQ && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Progress & Timer */}
          <div className="flex items-center justify-between pb-4 border-b border-purple-900/30">
            <span className="text-xs font-bold text-slate-400">
              Question {currentIndex + 1} of {QUESTIONS.length}
            </span>
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>00:{timeLeft.toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQ.answer;

              let btnStyle = 'bg-purple-950/40 hover:bg-purple-900/40 border-purple-800/40 text-slate-200';
              if (selectedOption !== null) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950 border-rose-500 text-rose-200';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={selectedOption !== null}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${btnStyle}`}
                >
                  <span>{option}</span>
                  {selectedOption !== null && isCorrectAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                  )}
                  {selectedOption !== null && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'SUMMARY' && (
        <div className="bg-[#121124] border border-purple-900/40 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-700/50 flex items-center justify-center mx-auto text-amber-400">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Round Completed!</h2>
            <p className="text-sm text-slate-400 mt-1">
              You scored <span className="text-amber-400 font-bold">{score} / {QUESTIONS.length}</span> correct
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={startGame}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-bold text-xs shadow transition-all cursor-pointer"
            >
              Play Again (₹25)
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-slate-300 font-semibold text-xs border border-purple-800/40 transition-colors cursor-pointer"
            >
              Exit to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
