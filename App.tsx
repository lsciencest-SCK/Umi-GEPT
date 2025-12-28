
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuizMode, Question, QuizState, DialoguePart } from './types';
import { generateQuiz } from './data';

const App: React.FC = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [quiz, setQuiz] = useState<QuizState>({
    currentStep: 'MENU',
    mode: QuizMode.QUESTION_RESPONSE,
    questions: [],
    currentIndex: 0,
    score: 0,
    answers: {}
  });
  const [showScript, setShowScript] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<Set<string>>(new Set());
  const [isCorrecting, setIsCorrecting] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = (freq: number, type: OscillatorType, startTime: number, duration: number) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  const playCorrectSound = () => {
    // Livelier arpeggio: C5, E5, G5, C6
    const duration = 0.15;
    playTone(523.25, 'sine', 0, duration); 
    playTone(659.25, 'sine', 0.1, duration);
    playTone(783.99, 'sine', 0.2, duration);
    playTone(1046.50, 'sine', 0.3, 0.4); 
  };

  const playWrongSound = () => {
    playTone(180, 'sawtooth', 0, 0.4); 
  };

  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const defaultVoice = availableVoices.find(v => v.name.includes('Google US') || v.lang === 'en-US' || v.lang.includes('en'));
      if (defaultVoice && !selectedVoice) {
        setSelectedVoice(defaultVoice.name);
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoice]);

  const getSecondaryVoice = () => {
    // Find a distinct English voice for Speaker B
    return voices.find(v => (v.name !== selectedVoice) && (v.lang.startsWith('en'))) || voices[0];
  };

  const speak = async (question: Question) => {
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const voiceA = voices.find(v => v.name === selectedVoice) || null;
    const voiceB = getSecondaryVoice() || voiceA;
    const voiceNarrator = voiceA;

    if (question.dialogueParts && question.dialogueParts.length > 0) {
      // Conversation Mode
      for (const part of question.dialogueParts) {
        await new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(part.text);
          utterance.rate = 0.6; //放慢至 0.6
          
          if (part.speaker === 0) utterance.voice = voiceA;
          else if (part.speaker === 1) utterance.voice = voiceB;
          else utterance.voice = voiceNarrator;

          // Slightly differentiate voices by pitch if they are the same actual voice
          if (part.speaker === 1 && voiceA?.name === voiceB?.name) {
            utterance.pitch = 1.2;
          }

          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }
    } else {
      // Question Response Mode
      const utterance = new SpeechSynthesisUtterance(question.audioText);
      utterance.voice = voiceA;
      utterance.rate = 0.6; 
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      return;
    }
    setIsSpeaking(false);
  };

  const startQuiz = (mode: QuizMode) => {
    const questions = generateQuiz(mode);
    setQuiz({
      currentStep: 'QUIZ',
      mode,
      questions,
      currentIndex: 0,
      score: 0,
      answers: {}
    });
    setShowScript(false);
    setFailedAttempts(new Set());
  };

  const handleAnswer = (option: string) => {
    const currentQuestion = quiz.questions[quiz.currentIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playCorrectSound();
      setIsCorrecting(true);
      const wasFirstTry = failedAttempts.size === 0;
      
      setQuiz(prev => ({
        ...prev,
        score: wasFirstTry ? prev.score + 1 : prev.score,
        answers: { ...prev.answers, [prev.currentIndex]: option }
      }));

      setTimeout(() => {
        setIsCorrecting(false);
        if (quiz.currentIndex < quiz.questions.length - 1) {
          setQuiz(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
          setShowScript(false);
          setFailedAttempts(new Set());
        } else {
          setQuiz(prev => ({ ...prev, currentStep: 'RESULT' }));
        }
      }, 1500);
    } else {
      playWrongSound();
      setFailedAttempts(prev => new Set(prev).add(option));
    }
  };

  const quit = () => {
    setQuiz(prev => ({ ...prev, currentStep: 'MENU' }));
    window.speechSynthesis.cancel();
  };

  return (
    <div className="min-h-screen chii-kawa-gradient p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 mb-8 flex justify-between items-center border-4 border-yellow-400">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🐱</div>
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600">Master Chii-kawa</h1>
        </div>
        <div className="text-4xl">🐰</div>
      </header>

      <div className="w-full max-w-2xl bg-white/80 rounded-2xl p-4 mb-6 flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-600">🎤 語音發音設定 (Voice Settings):</label>
        <select 
          className="w-full p-2 rounded-lg border-2 border-blue-200 text-lg"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map((v, i) => (
            <option key={i} value={v.name}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </div>

      <main className="w-full max-w-2xl">
        {quiz.currentStep === 'MENU' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold text-blue-800">選擇練習題型</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <button 
                onClick={() => startQuiz(QuizMode.QUESTION_RESPONSE)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-lg transition-transform transform active:scale-95"
              >
                問答 (Response)
              </button>
              <button 
                onClick={() => startQuiz(QuizMode.SHORT_CONVERSATION)}
                className="bg-blue-400 hover:bg-blue-500 text-white text-xl font-bold py-6 px-4 rounded-2xl shadow-lg transition-transform transform active:scale-95"
              >
                簡短對話 (Conversation)
              </button>
            </div>
          </div>
        )}

        {quiz.currentStep === 'QUIZ' && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-600 font-bold text-xl">Question {quiz.currentIndex + 1} / {quiz.questions.length}</span>
              <button onClick={quit} className="bg-red-400 hover:bg-red-500 text-white px-4 py-2 rounded-xl font-bold">Quit</button>
            </div>

            <div className="flex flex-col items-center gap-2 py-4">
              <button 
                onClick={() => speak(quiz.questions[quiz.currentIndex])}
                className={`w-24 h-24 rounded-full shadow-inner border-8 flex items-center justify-center transition-all ${isSpeaking ? 'bg-yellow-500 border-yellow-200 animate-pulse' : 'bg-yellow-400 border-yellow-100 hover:scale-105'}`}
              >
                <span className="text-4xl">{isSpeaking ? '🔊' : '▶️'}</span>
              </button>
              <p className="text-gray-500 font-bold text-sm">點擊按鈕撥放 (速度: 0.6)</p>
              
              {quiz.mode === QuizMode.SHORT_CONVERSATION && quiz.questions[quiz.currentIndex].questionText && (
                <div className="w-full bg-blue-50 p-4 rounded-xl text-center mt-2 border border-blue-100">
                  <p className="text-xl font-bold text-blue-800">Q: {quiz.questions[quiz.currentIndex].questionText}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setShowScript(!showScript)}
                className="bg-gray-100 hover:bg-gray-200 text-blue-600 font-bold py-2 rounded-xl border border-dashed border-blue-300"
              >
                {showScript ? '🙈 隱藏內容' : '📖 查看聽力內容'}
              </button>
              
              {showScript && (
                <div className="bg-yellow-50 p-4 rounded-2xl border-2 border-yellow-200 animate-fade-in text-sm md:text-base">
                  <p className="font-bold text-gray-700">聽力原文：</p>
                  <p className="italic text-gray-600 mb-2">{quiz.questions[quiz.currentIndex].audioText}</p>
                  <p className="font-bold text-blue-600">解析：</p>
                  <p className="text-gray-600">{quiz.questions[quiz.currentIndex].explanation}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              {quiz.questions[quiz.currentIndex].options.map((opt, idx) => {
                const label = ['(A)', '(B)', '(C)', '(D)'][idx];
                const isFailed = failedAttempts.has(opt);
                const isCorrectAnswer = opt === quiz.questions[quiz.currentIndex].correctAnswer;
                const isChosenCorrect = isCorrecting && isCorrectAnswer;

                let btnClass = "text-left text-lg md:text-xl p-4 rounded-2xl border-4 transition-all ";
                if (isChosenCorrect) {
                  btnClass += "border-green-400 bg-green-100 text-green-800 animate-bounce";
                } else if (isFailed) {
                  btnClass += "border-red-300 bg-red-50 text-red-400 opacity-60 cursor-not-allowed";
                } else {
                  btnClass += "border-blue-100 hover:bg-blue-50 active:scale-[0.98]";
                }

                return (
                  <button 
                    key={idx}
                    disabled={isFailed || isCorrecting}
                    onClick={() => handleAnswer(opt)}
                    className={btnClass}
                  >
                    <span className="font-bold mr-2">{label}</span> {opt}
                  </button>
                );
              })}
            </div>
            
            {failedAttempts.size > 0 && !isCorrecting && (
              <p className="text-center text-red-500 font-bold animate-pulse">答錯囉，請再聽一次並重新選擇！</p>
            )}
          </div>
        )}

        {quiz.currentStep === 'RESULT' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-blue-800">測驗結束！</h2>
            <div className="text-8xl my-4">🏆</div>
            <div className="text-center">
              <p className="text-2xl mb-2 text-gray-600">總結成績：</p>
              <p className="text-7xl font-black text-yellow-500">{Math.round((quiz.score / quiz.questions.length) * 100)} 分</p>
              <p className="text-xl mt-4 text-gray-500">一次答對題數：{quiz.score} / {quiz.questions.length}</p>
            </div>
            <button onClick={() => setQuiz(prev => ({ ...prev, currentStep: 'MENU' }))} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-12 rounded-2xl shadow-lg">回主選單</button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-blue-400 text-sm font-bold flex items-center gap-2">
        <span>© 2024 Chii-kawa Expert</span>
      </footer>
    </div>
  );
};

export default App;
