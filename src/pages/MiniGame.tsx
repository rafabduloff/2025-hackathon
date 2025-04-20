import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveMinigameResult, getTopScoresForDifficulty } from '../database/db';
import AchievementService from '../services/achievements';
import AchievementNotification from '../components/Achievements/AchievementNotification';
import { Achievement } from '../types/achievements';
import '../styles/MiniGame.css';
import LeaderboardSidebar, { LeaderboardSidebarEntry } from '../components/Leaderboard/LeaderboardSidebar';

interface QuoteChallenge {
  id: number;
  quote: string;
  correctMovie: string;
  movieOptions: string[];
  correctCharacter: string;
  characterOptions: string[];
  movieHint?: string;
  characterHint?: string;
}

const placeholderChallenges: QuoteChallenge[] = [
  {
    id: 1,
    quote: "Я — Железный человек.",
    correctMovie: "Железный человек",
    movieOptions: ["Мстители", "Железный человек", "Тор", "Первый мститель"],
    correctCharacter: "Тони Старк",
    characterOptions: ["Тони Старк", "Стив Роджерс", "Брюс Беннер", "Ник Фьюри"],
    movieHint: "Фильм, 2008",
    characterHint: "Миллиардер, плейбой, филантроп",
  },
  {
    id: 2,
    quote: "Я могу так целый день.",
    correctMovie: "Первый мститель",
    movieOptions: ["Мстители: Финал", "Первый мститель", "Железный человек 2", "Тор: Рагнарёк"],
    correctCharacter: "Стив Роджерс",
    characterOptions: ["Баки Барнс", "Стив Роджерс", "Ник Фьюри", "Сэм Уилсон"],
    movieHint: "Фильм о Второй мировой",
    characterHint: "Капитан Америка",
  },
  {
    id: 3,
    quote: "Мы есть Грут.",
    correctMovie: "Стражи Галактики",
    movieOptions: ["Мстители: Война бесконечности", "Тор: Любовь и гром", "Стражи Галактики", "Доктор Стрэндж"],
    correctCharacter: "Грут",
    characterOptions: ["Звёздный Лорд", "Ракета", "Гамора", "Грут"],
    movieHint: "Космическая команда",
    characterHint: "Дерево",
  },
  {
    id: 4,
    quote: "Не заставляй меня злиться. Тебе не понравится, когда я злюсь.",
    correctMovie: "Невероятный Халк",
    movieOptions: ["Мстители", "Невероятный Халк", "Тор: Рагнарёк", "Мстители: Эра Альтрона"],
    correctCharacter: "Брюс Беннер",
    characterOptions: ["Тони Старк", "Брюс Беннер", "Халкбастер", "Танос"],
    movieHint: "Фильм 2008 года с другим актером",
    characterHint: "Ученый с проблемой гнева",
   },
   {
    id: 5,
    quote: "Победить нас можно только вместе.",
    correctMovie: "Мстители",
    movieOptions: ["Мстители: Эра Альтрона", "Мстители", "Мстители: Война бесконечности", "Мстители: Финал"],
    correctCharacter: "Тони Старк",
    characterOptions: ["Тор", "Стив Роджерс", "Ник Фьюри", "Тони Старк"],
    movieHint: "Первый сбор команды",
    characterHint: "Собрал команду в первом фильме",
   },
  {
    id: 6,
    quote: "Ваканда навсегда!",
    correctMovie: "Чёрная пантера",
    movieOptions: ["Мстители: Война бесконечности", "Чёрная пантера", "Первый мститель: Противостояние", "Чёрная пантера: Ваканда навеки"],
    correctCharacter: "Т'Чалла",
    characterOptions: ["Шури", "Окойе", "Т'Чалла", "М'Баку"],
    movieHint: "Скрытая африканская страна",
    characterHint: "Король Ваканды",
  },
  {
    id: 7,
    quote: "Выше, дальше, быстрее, детка.",
    correctMovie: "Капитан Марвел",
    movieOptions: ["Мстители: Финал", "Капитан Марвел", "Стражи Галактики", "Мисс Марвел"],
    correctCharacter: "Кэрол Дэнверс",
    characterOptions: ["Моника Рамбо", "Ник Фьюри", "Кэрол Дэнверс", "Мария Рамбо"],
    movieHint: "Фильм о 90-х",
    characterHint: "Один из сильнейших Мстителей",
  },
  {
    id: 8,
    quote: "Дормамму, я пришёл договориться.",
    correctMovie: "Доктор Стрэндж",
    movieOptions: ["Мстители: Война бесконечности", "Доктор Стрэндж в мультивселенной безумия", "Доктор Стрэндж", "Тор: Рагнарёк"],
    correctCharacter: "Доктор Стрэндж",
    characterOptions: ["Вонг", "Древняя", "Барон Мордо", "Доктор Стрэндж"],
    movieHint: "Магия и мистицизм",
    characterHint: "Верховный чародей",
  },
  {
    id: 9,
    quote: "Идеальный баланс. Как и должно быть во всём.",
    correctMovie: "Мстители: Война бесконечности",
    movieOptions: ["Мстители: Эра Альтрона", "Стражи Галактики", "Мстители: Война бесконечности", "Мстители: Финал"],
    correctCharacter: "Танос",
    characterOptions: ["Эбони Мо", "Проксима Миднайт", "Танос", "Кулл Обсидиан"],
    movieHint: "Щелчок пальцами",
    characterHint: "Безумный титан",
  },
  {
    id: 10,
    quote: "Человек-паук? Это что-то новенькое.",
    correctMovie: "Человек-паук: Возвращение домой",
    movieOptions: ["Человек-паук: Вдали от дома", "Мстители: Финал", "Первый мститель: Противостояние", "Человек-паук: Возвращение домой"],
    correctCharacter: "Питер Паркер",
    characterOptions: ["Тони Старк", "Нед Лидс", "Питер Паркер", "Мистерио"],
    movieHint: "Школьные годы супергероя",
    characterHint: "Дружелюбный сосед",
   },
   {
    id: 11,
    quote: "Это мой секрет, Капитан. Я всегда зол.",
    correctMovie: "Мстители",
    movieOptions: ["Мстители: Эра Альтрона", "Невероятный Халк", "Мстители", "Тор: Рагнарёк"],
    correctCharacter: "Брюс Беннер",
    characterOptions: ["Халк", "Тони Старк", "Брюс Беннер", "Стив Роджерс"],
    movieHint: "Битва за Нью-Йорк",
    characterHint: "Становится зеленым",
  },
  {
    id: 12,
    quote: "Клянусь тебе, брат, солнце снова взойдет над нами.",
    correctMovie: "Мстители: Война бесконечности",
    movieOptions: ["Тор", "Тор: Рагнарёк", "Мстители", "Мстители: Война бесконечности"],
    correctCharacter: "Локи",
    characterOptions: ["Тор", "Хеймдалль", "Локи", "Танос"],
    movieHint: "Начало фильма с Таносом",
    characterHint: "Бог обмана",
  },
  {
    id: 13,
    quote: "Я не выбирал быть героем. Меня создали.",
    correctMovie: "Мстители: Эра Альтрона",
    movieOptions: ["Железный человек 3", "Мстители: Эра Альтрона", "Человек-паук: Возвращение домой", "Вижен и Ванда"],
    correctCharacter: "Вижен",
    characterOptions: ["Альтрон", "Ванда Максимофф", "Вижен", "Тони Старк"],
    movieHint: "Фильм про злого ИИ",
    characterHint: "Андроид с камнем разума",
  },
  {
    id: 14,
    quote: "Муравей может многое. Главное - это команда.",
    correctMovie: "Человек-муравей и Оса",
    movieOptions: ["Человек-муравей", "Мстители: Финал", "Человек-муравей и Оса", "Первый мститель: Противостояние"],
    correctCharacter: "Скотт Лэнг",
    characterOptions: ["Хоуп ван Дайн", "Хэнк Пим", "Скотт Лэнг", "Луис"],
    movieHint: "Фильм про квантовый мир",
    characterHint: "Умеет уменьшаться и увеличиваться",
  },
  {
    id: 15,
    quote: "Я сама судьба.",
    correctMovie: "Мстители: Финал",
    movieOptions: ["Мстители: Война бесконечности", "Мстители: Эра Альтрона", "Мстители", "Мстители: Финал"],
    correctCharacter: "Танос",
    characterOptions: ["Железный человек", "Тор", "Капитан Америка", "Танос"],
    movieHint: "Завершение Саги Бесконечности",
    characterHint: "Главный антагонист Саги",
   },
];

type GameState = 'loading' | 'guessingMovie' | 'guessingCharacter' | 'showingFeedback' | 'gameOver';
type FeedbackType = 'movieCorrect' | 'movieIncorrect' | 'characterCorrect' | 'characterIncorrect' | null;

// Устанавливаем фиксированную длину игры
const FIXED_GAME_LENGTH = 10;

const MiniGame: React.FC = () => {
  // --- Состояния ---
  // Начинаем сразу с загрузки
  const [gameState, setGameState] = useState<GameState>('loading');
  const [challenges, setChallenges] = useState<QuoteChallenge[]>([]);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null);
  const [movieGuessedCorrectly, setMovieGuessedCorrectly] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const [movieHintAvailable, setMovieHintAvailable] = useState(true);
  const [characterHintAvailable, setCharacterHintAvailable] = useState(true);
  const [showMovieHint, setShowMovieHint] = useState(false);
  const [showCharacterHint, setShowCharacterHint] = useState(false);

  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  const navigate = useNavigate();

  // ---> Новые состояния для лидерборда <--- 
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardSidebarEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const leaderboardTitle = "Лидеры (Мини-Игра)"; // Фиксированный заголовок

  // ---> Функция для загрузки лидерборда <--- 
  const loadLeaderboard = async () => {
    // Загружаем только если сайдбар открыт и данных еще нет (или принудительно)
    // Или можно всегда загружать при открытии
    if (!isLeaderboardOpen || leaderboardData.length > 0) { // Простая оптимизация
        // return; 
        // Решил всегда загружать при открытии для актуальности
    }
    console.log(`[MiniGame] Loading leaderboard for minigame`);
    setIsLeaderboardLoading(true);
    setLeaderboardError(null);
    // setLeaderboardData([]); // Не очищаем, чтобы старые данные были видны во время загрузки?

    try {
      const topScores = await getTopScoresForDifficulty('minigame', 10); // Загружаем топ-10
      setLeaderboardData(topScores);
      console.log(`[MiniGame] Leaderboard data loaded for minigame:`, topScores);
    } catch (err) {
      console.error(`Ошибка загрузки лидерборда для мини-игры:`, err);
      setLeaderboardError('Не удалось загрузить лидеров.');
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  // Загружаем лидерборд при открытии сайдбара
  useEffect(() => {
      if (isLeaderboardOpen) {
          loadLeaderboard();
      }
  }, [isLeaderboardOpen]);

  // --- Загрузка и старт игры ---
  // Переименовываем и упрощаем - всегда загружаем 10
  const loadGame = () => {
    setGameState('loading');

    // TODO: Заменить на реальный вызов getQuoteChallenges()
    // Перемешиваем ВСЕ доступные вопросы
    const shuffled = shuffleArray(placeholderChallenges);
    // Берем первые FIXED_GAME_LENGTH (10)
    const gameChallenges = shuffled.slice(0, FIXED_GAME_LENGTH);

    const processedChallenges = gameChallenges.map(challenge => ({
      ...challenge,
      movieOptions: shuffleArray(challenge.movieOptions),
      characterOptions: shuffleArray(challenge.characterOptions),
    }));

    setChallenges(processedChallenges);
    setCurrentChallengeIndex(0);
    setScore(0);
    setFeedback(null);
    setMovieGuessedCorrectly(false);
    setSelectedAnswer(null);
    setMovieHintAvailable(true);
    setCharacterHintAvailable(true);
    setShowMovieHint(false);
    setShowCharacterHint(false);
    setNewAchievement(null);
    setShowNotification(false);

    setTimeout(() => {
      if (processedChallenges.length > 0) {
        setGameState('guessingMovie');
      } else {
        // Обработка случая, если вопросы не загрузились
        console.error("Не удалось загрузить вопросы для мини-игры.");
        alert("Ошибка загрузки вопросов. Попробуйте снова.");
        // Можно перенаправить или показать сообщение об ошибке без возможности начать
        // setGameState('selectingMode'); // Это состояние удалено
        // Пока оставим игрока в состоянии загрузки или покажем кнопку возврата
        // Или можно установить gameState в какое-то новое состояние 'error'
      }
    }, 500); // 0.5 секунды задержки
  };

  // --- Хук для автозагрузки при монтировании ---
  useEffect(() => {
    loadGame(); // Загружаем игру при первом рендере
  }, []); // Пустой массив зависимостей - выполнится один раз

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const currentChallenge = useMemo(() => {
    return challenges && challenges.length > currentChallengeIndex ? challenges[currentChallengeIndex] : null;
  }, [challenges, currentChallengeIndex]);

  const handleMovieGuess = (guessedMovie: string) => {
    if (!currentChallenge || selectedAnswer) return;

    setSelectedAnswer(guessedMovie);
    const isCorrect = guessedMovie === currentChallenge.correctMovie;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setMovieGuessedCorrectly(true);
      setFeedback({ type: 'movieCorrect', message: 'Правильно! Это из фильма "${currentChallenge.correctMovie}".' });
    } else {
      setMovieGuessedCorrectly(false);
      setFeedback({ type: 'movieIncorrect', message: `Неверно. Правильный ответ: "${currentChallenge.correctMovie}".` });
    }
    setGameState('showingFeedback');
  };

  const handleCharacterGuess = (guessedCharacter: string) => {
    if (!currentChallenge || selectedAnswer || !movieGuessedCorrectly) return;

    setSelectedAnswer(guessedCharacter);
    const isCorrect = guessedCharacter === currentChallenge.correctCharacter;

    if (isCorrect) {
      setScore(prev => prev + 2);
      setFeedback({ type: 'characterCorrect', message: `Верно! Это ${currentChallenge.correctCharacter}.` });
    } else {
      setFeedback({ type: 'characterIncorrect', message: `Не угадали. Цитату произнес ${currentChallenge.correctCharacter}.` });
    }
    setGameState('showingFeedback');
  };

  const proceedToNextStep = () => {
    setFeedback(null);
    setSelectedAnswer(null);

    if (gameState === 'showingFeedback') {
      if (feedback?.type === 'movieCorrect' || feedback?.type === 'movieIncorrect') {
        if (movieGuessedCorrectly) {
          setGameState('guessingCharacter');
        } else {
          moveToNextChallenge();
        }
      }
      else if (feedback?.type === 'characterCorrect' || feedback?.type === 'characterIncorrect') {
        moveToNextChallenge();
      }
    }
  };

  const moveToNextChallenge = async () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1);
      setMovieGuessedCorrectly(false);
      setShowMovieHint(false);
      setShowCharacterHint(false);
      setGameState('guessingMovie');
    } else {
      setGameState('gameOver');
      console.log("Игра окончена! Финальный счет:", score);
      const userId = localStorage.getItem('userId');
      const numericUserId = userId ? parseInt(userId) : null;

      if (numericUserId && FIXED_GAME_LENGTH > 0) {
        // Сохраняем результат
        await saveMinigameResult(numericUserId, score, FIXED_GAME_LENGTH);
        
        // Обновляем достижения
        const achievementService = AchievementService.getInstance();
        
        // Достижения за очки (прогресс устанавливается по текущему счету)
        await achievementService.updateAchievementProgress(numericUserId, 'minigame-score-100', score);
        await achievementService.updateAchievementProgress(numericUserId, 'minigame-score-500', score);

        // Достижение за первую победу (условие: score > 0)
        // Проверяем текущее состояние достижения, чтобы не обновлять каждый раз
        const userAchievementsData = await achievementService.getUserAchievements(numericUserId);
        const firstWinAch = userAchievementsData.achievements.find(a => a.id === 'minigame-first-win');
        if (score > 0 && firstWinAch && !firstWinAch.isUnlocked) {
             await achievementService.updateAchievementProgress(numericUserId, 'minigame-first-win', 1);
        }

        // Достижение за серию побед (требует отдельной логики отслеживания серии)
        // await achievementService.updateAchievementProgress(numericUserId, 'minigame-streak-5', currentStreak); 

        // Логика показа уведомлений (пока пропустим)
        /*
        const updatedAchievements = await achievementService.getUserAchievements(numericUserId);
        // Ищем новые разблокированные достижения
        // ...
        */

        // Добавляем проверку достижения 'minigame-master'
        try {
            // Проверяем на максимальный балл (по 2 очка за каждый челлендж)
            if (score === FIXED_GAME_LENGTH * 2) {
                await achievementService.updateAchievementProgress(numericUserId, 'minigame-master', 1);
                console.log('Checked minigame-master achievement (perfect score)');
                // TODO: Показать уведомление о новом достижении? 
                // (Требует доработки AchievementNotification и логики его вызова)
            }
        } catch (achieveError) {
             console.error("Error updating minigame-master achievement:", achieveError);
        }
      }
    }
  };

  const useMovieHint = () => {
    if (!movieHintAvailable || showMovieHint) return;
    setShowMovieHint(true);
    setMovieHintAvailable(false);
    console.log("Использована подсказка для фильма");
  };

  const useCharacterHint = () => {
    if (!characterHintAvailable || showCharacterHint || !movieGuessedCorrectly) return;
    setShowCharacterHint(true);
    setCharacterHintAvailable(false);
    console.log("Использована подсказка для персонажа");
  };

  // --- Функции рестарта ---
  const restartGame = () => {
    // Вместо возврата к выбору режима, просто перезагружаем игру
    // setGameState('selectingMode');
    loadGame();
  };

  if (gameState === 'loading') {
    return (
      <div className="minigame-container loading-container">
        <p>Загрузка челленджей...</p>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="minigame-container result-container">
        <h2>Игра окончена!</h2>
        <p>Ваш финальный счет: {score} из {FIXED_GAME_LENGTH * 3} возможных</p>
        <div className="result-buttons">
          <button onClick={restartGame} className="restart-button">Играть снова</button>
          <button onClick={() => navigate('/')} className="home-button">На главную</button>
        </div>
        {showNotification && newAchievement && (
          <AchievementNotification
            achievement={newAchievement}
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>
    );
  }

  if (!currentChallenge) {
    return (
      <div className="minigame-container error-container">
        <p>Произошла ошибка при загрузке челленджа.</p>
        <button onClick={restartGame} className="restart-button">Начать заново</button>
      </div>
    );
  }

  return (
    <>
      <div className="minigame-container">
          {/* ---> Кнопка для открытия лидерборда <--- */} 
          <button 
              className="toggle-leaderboard-button"
              onClick={() => setIsLeaderboardOpen(true)}
              title="Показать лидеров"
          >
              🏆
          </button>
          
          {/* --- Загрузка --- */} 
          {gameState === 'loading' && <div className="game-loading">Загрузка игры...</div>}
          
          {/* --- Игровой процесс (Возвращаем оригинальную структуру) --- */} 
          {!['loading', 'gameOver'].includes(gameState) && currentChallenge && (
            <div className="game-active-container"> { /* Обертка для активной игры */}
                <div className="minigame-header">
                    <span>Вопрос {currentChallengeIndex + 1} из {FIXED_GAME_LENGTH}</span>
                    <span className="score">Счет: {score}</span>
                </div>
                <div className="quote-challenge-card">
                    <p className="quote-text">"{currentChallenge.quote}"</p>
                    
                    {/* Подсказки */} 
                    <div className="hints-section-minigame">
                         {gameState === 'guessingMovie' && currentChallenge.movieHint && (
                             <button onClick={useMovieHint} disabled={!movieHintAvailable || showMovieHint} className={`hint-button ${!movieHintAvailable ? 'used' : ''}`}>
                               Подсказка (Фильм) {showMovieHint ? `: ${currentChallenge.movieHint}` : ''}
                             </button>
                         )}
                         {gameState === 'guessingCharacter' && currentChallenge.characterHint && (
                             <button onClick={useCharacterHint} disabled={!characterHintAvailable || showCharacterHint} className={`hint-button ${!characterHintAvailable ? 'used' : ''}`}>
                               Подсказка (Персонаж) {showCharacterHint ? `: ${currentChallenge.characterHint}` : ''}
                             </button>
                         )}
                    </div>

                    {/* Этап угадывания фильма */} 
                    {gameState === 'guessingMovie' && (
                        <div className="guessing-stage">
                             <h4>Из какого фильма/сериала эта цитата?</h4>
                             <div className="options-grid">
                                 {currentChallenge.movieOptions.map((option, index) => (
                                     <button key={`movie-${index}`} onClick={() => handleMovieGuess(option)} className={`option-button ${selectedAnswer === option ? (option === currentChallenge.correctMovie ? 'correct' : 'wrong') : ''}`} disabled={!!selectedAnswer}>
                                        {option}
                                     </button>
                                 ))}
                             </div>
                        </div>
                    )}
                    
                    {/* Этап угадывания персонажа */} 
                    {gameState === 'guessingCharacter' && movieGuessedCorrectly && (
                         <div className="guessing-stage">
                             <p className="correct-movie-info">Фильм: {currentChallenge.correctMovie}</p>
                             <h4>Кто произнес эту цитату?</h4>
                             <div className="options-grid">
                                 {currentChallenge.characterOptions.map((option, index) => (
                                     <button key={`char-${index}`} onClick={() => handleCharacterGuess(option)} className={`option-button ${selectedAnswer === option ? (option === currentChallenge.correctCharacter ? 'correct' : 'wrong') : ''}`} disabled={!!selectedAnswer}>
                                        {option}
                                     </button>
                                 ))}
                             </div>
                         </div>
                    )}

                    {/* Обратная связь */} 
                    {gameState === 'showingFeedback' && feedback && (
                       <div className={`feedback-message ${feedback.type || ''}`}>
                         <p>{feedback.message}</p>
                         <button onClick={proceedToNextStep} className="next-step-button">
                           {/* ... логика текста кнопки ... */}
                            { (
                                (feedback.type === 'movieCorrect' && currentChallengeIndex < FIXED_GAME_LENGTH) ||
                                (feedback.type === 'characterCorrect' || feedback.type === 'characterIncorrect')
                            ) && currentChallengeIndex < FIXED_GAME_LENGTH - 1
                                ? 'Дальше'
                                : (feedback.type === 'movieIncorrect' && currentChallengeIndex < FIXED_GAME_LENGTH - 1)
                                ? 'Следующий вопрос'
                                : 'Завершить'
                           }
                         </button>
                       </div>
                    )}
                </div>
            </div>
          )}

          {/* --- Конец игры (Возвращаем оригинальную структуру) --- */} 
          {gameState === 'gameOver' && (
              <div className="minigame-game-over">
                <h2>Игра окончена!</h2>
                <p className="final-score">Ваш итоговый счет: {score} из {challenges.length * 2}</p>
                <p>Спасибо за игру!</p>
                <div className="game-over-buttons">
                    <button onClick={loadGame} className="restart-button">Сыграть еще раз</button>
                    <button onClick={() => navigate('/')} className="home-button">На главную</button>
                </div>
              </div>
          )}
          
      </div>
      
      {/* ---> Отображение сайдбара лидерборда <--- */} 
      <LeaderboardSidebar 
        title={leaderboardTitle}
        data={leaderboardData}
        isLoading={isLeaderboardLoading}
        error={leaderboardError}
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </>
  );
};

export default MiniGame;
