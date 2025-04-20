import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuizQuestions, saveQuizResult, QuizQuestion } from '../database/db';
import AchievementService from '../services/achievements';
import AchievementNotification from '../components/Achievements/AchievementNotification';
import { Achievement } from '../types/achievements';
import '../styles/Quiz.css';
import LeaderboardSidebar, { LeaderboardSidebarEntry } from '../components/Leaderboard/LeaderboardSidebar';
import { getTopScoresForDifficulty } from '../database/db';

// Удаляем локальное определение QuizQuestion
/*
interface QuizQuestion {
  question: string;
  correct_answer: string;
  options: string[]; // Предполагаем, что здесь все варианты, включая правильный
  hint?: string;
  selectedAnswer: string | null; // Приводим тип к string | null
}
*/

// Убираем selectedAnswer из ProcessedQuizQuestion, предполагая, что он есть в импортированном QuizQuestion
interface ProcessedQuizQuestion extends QuizQuestion {
  shuffledOptions: string[];
}

const Quiz: React.FC = () => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  // Используем новый тип ProcessedQuizQuestion
  const [questions, setQuestions] = useState<ProcessedQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Состояния для подсказок
  const [isFiftyFiftyUsed, setIsFiftyFiftyUsed] = useState(false);
  const [isSimpleHintUsed, setIsSimpleHintUsed] = useState(false);
  const [showSimpleHint, setShowSimpleHint] = useState(false);
  // Состояние для отслеживания отключенных кнопок после 50/50
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);

  // ---> Новые состояния для лидерборда <--- 
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardSidebarEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardTitle, setLeaderboardTitle] = useState('Лидеры');

  // Функция для перемешивания массива (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ---> Функция для загрузки лидерборда <--- 
  const loadLeaderboard = async (level: 'easy' | 'medium' | 'hard') => {
    console.log(`[Quiz] Loading leaderboard for difficulty: ${level}`);
    setIsLeaderboardLoading(true);
    setLeaderboardError(null);
    setLeaderboardData([]); // Очищаем перед загрузкой
    let title = 'Лидеры';
    if (level === 'easy') title = 'Лидеры (Легко)';
    if (level === 'medium') title = 'Лидеры (Средне)';
    if (level === 'hard') title = 'Лидеры (Сложно)';
    setLeaderboardTitle(title);

    try {
      const topScores = await getTopScoresForDifficulty(level, 10); // Загружаем топ-10
      setLeaderboardData(topScores);
      console.log(`[Quiz] Leaderboard data loaded for ${level}:`, topScores);
    } catch (err) {
      console.error(`Ошибка загрузки лидерборда для ${level}:`, err);
      setLeaderboardError('Не удалось загрузить лидеров.');
    } finally {
      setIsLeaderboardLoading(false);
    }
  };

  const loadQuestions = async (level: 'easy' | 'medium' | 'hard') => {
    setIsLoading(true);
    // Сброс состояний подсказок при загрузке новых вопросов
    setIsFiftyFiftyUsed(false);
    setIsSimpleHintUsed(false);
    setShowSimpleHint(false);
    setDisabledOptions([]);
    
    // ---> Скрываем лидерборд при выборе новой сложности <--- 
    setIsLeaderboardOpen(false); 
    
    try {
      console.log('Начало загрузки вопросов для сложности:', level);
      const loadedQuestions = await getQuizQuestions(level, 5);
      console.log('Загружено вопросов:', loadedQuestions.length);

      if (!loadedQuestions || loadedQuestions.length === 0) {
        throw new Error('Вопросы не найдены');
      }

      // Обрабатываем вопросы: создаем shuffledOptions
      // Теперь предполагаем, что loadedQuestions уже типа QuizQuestion[] из db.ts
      const processedQuestions: ProcessedQuizQuestion[] = loadedQuestions.map(q => {
        // Создаем массив всех вариантов ответа из q.options
        // Предполагаем, что q.options содержит все варианты, включая правильный
        // Если это не так, логику нужно будет скорректировать на основе реальной структуры QuizQuestion
        const allOptions = q.options ? [...q.options] : [q.correct_answer]; // Базовая проверка на наличие options

        // Убедимся, что correct_answer точно есть в options, если options существуют
        if (q.options && !q.options.includes(q.correct_answer)) {
           allOptions.push(q.correct_answer);
        }
        // Если options нет, но есть incorrect_answers (альтернативное предположение)
        // else if (!q.options && q.incorrect_answers) {
        //    allOptions = [...q.incorrect_answers, q.correct_answer];
        // }

        const shuffledOptions = shuffleArray(allOptions);
        return {
          ...q,
          shuffledOptions: shuffledOptions,
          // Инициализируем selectedAnswer как undefined, чтобы соответствовать возможному типу QuizQuestion
          selectedAnswer: undefined
        };
      });

      setQuestions(processedQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResult(false);
      setDifficulty(level);
      
      // ---> Загружаем лидерборд для выбранной сложности <--- 
      // Можно загружать сразу или только при открытии сайдбара.
      // Пока загрузим сразу.
      await loadLeaderboard(level);

    } catch (error) {
      console.error('Ошибка загрузки вопросов:', error);
      alert('Ошибка загрузки вопросов. Пожалуйста, обновите страницу.');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  // ---> Рефакторинг логики внутри setTimeout <--- 
  const processEndOfQuiz = async (currentQuestions: ProcessedQuizQuestion[]) => {
    const userIdString = localStorage.getItem('userId');
    const numericUserId = userIdString ? parseInt(userIdString) : null;

    // Вычисляем финальный счет надежно из массива вопросов
    const finalScore = currentQuestions.reduce((acc, q) => {
        return acc + (q.selectedAnswer === q.correct_answer ? 1 : 0);
    }, 0);
    
    // Обновляем состояние счета на финальное значение (на всякий случай, для UI)
    setScore(finalScore);
    setShowResult(true);

    if (numericUserId) {
        // Сохраняем результат с правильным финальным счетом
        await saveQuizResult(numericUserId, difficulty!, finalScore, currentQuestions.length);
        console.log(`[Quiz End] Saved result: ${finalScore}/${currentQuestions.length}`); // Добавляем лог

        // Обновляем достижения
        const achievementService = AchievementService.getInstance();
        
        // 1. Достижения за прохождение уровня сложности
        console.log('[Quiz End] Checking difficulty achievements...'); // Лог
        if (difficulty === 'easy') {
          await achievementService.updateAchievementProgress(numericUserId, 'quiz-beginner', 1);
        } else if (difficulty === 'medium') {
          await achievementService.updateAchievementProgress(numericUserId, 'quiz-advanced', 1);
        } else if (difficulty === 'hard') {
          await achievementService.updateAchievementProgress(numericUserId, 'quiz-expert', 1);
        }

        // 2. Достижение за идеальный результат (Используем finalScore)
        console.log(`[Quiz End] Checking perfect score: ${finalScore} === ${currentQuestions.length}?`); // Лог
        if (finalScore === currentQuestions.length) {
          console.log('[Quiz End] Perfect score detected! Updating achievement...'); // Лог
          await achievementService.updateAchievementProgress(numericUserId, 'quiz-perfect-score', 1);
        }

        // 3. Достижение за прохождение без подсказок (на сложном уровне)
        console.log('[Quiz End] Checking no-hints achievement...'); // Лог
        if (difficulty === 'hard' && !isFiftyFiftyUsed && !isSimpleHintUsed) {
           await achievementService.updateAchievementProgress(numericUserId, 'quiz-no-hints', 1);
        }
        
        // 4. Достижение 'quiz-veteran' (инкремент)
        console.log('[Quiz End] Checking veteran achievement (increment)...'); // Лог
        try {
           await achievementService.updateAchievementProgress(numericUserId, 'quiz-veteran', 1, { increment: true });
        } catch (achieveError) {
             console.error("Error updating quiz-veteran achievement:", achieveError);
        }

        // TODO: Логика уведомлений 
    }
  }

  const handleAnswer = async (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    // Проверяем, не был ли уже дан ответ на текущий вопрос
    if (currentQuestion.selectedAnswer) return;

    const isCorrect = answer === currentQuestion.correct_answer;

    // Обновляем состояние вопроса, добавляя выбранный ответ
    const updatedQuestions = questions.map((q, i) =>
      i === currentQuestionIndex ? { ...q, selectedAnswer: answer } : q
    );
    setQuestions(updatedQuestions);

    // Немедленно обновляем счет, если ответ верный (для UI)
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Сбрасываем отключенные опции и показ подсказки для следующего вопроса
    setDisabledOptions([]);
    setShowSimpleHint(false);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // ---> Вызываем новую функцию для обработки конца квиза <--- 
        processEndOfQuiz(updatedQuestions); 
      }
    }, 1500); 
  };


  const restartQuiz = () => {
    setDifficulty(null);
    // Сброс всех состояний квиза при полном рестарте
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setIsFiftyFiftyUsed(false);
    setIsSimpleHintUsed(false);
    setShowSimpleHint(false);
    setDisabledOptions([]);
    setNewAchievement(null);
    setShowNotification(false);
  };


  // Функция для использования подсказки 50/50
  const useFiftyFifty = () => {
    // Проверяем, что currentQuestion существует и имеет selectedAnswer
    const currentQuestion = questions[currentQuestionIndex];
    if (isFiftyFiftyUsed || !currentQuestion || currentQuestion.selectedAnswer) return;

    // Фильтруем неправильные ответы из shuffledOptions
    const incorrect = currentQuestion.shuffledOptions.filter(
      option => option !== currentQuestion.correct_answer
    );

    // Случайно выбираем два неверных ответа для удаления
    const shuffledIncorrect = shuffleArray(incorrect);
    const optionsToDisable = shuffledIncorrect.slice(0, 2);

    setDisabledOptions(optionsToDisable);
    setIsFiftyFiftyUsed(true);
  };

  // Функция для использования простой подсказки
  const useSimpleHint = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (isSimpleHintUsed || !currentQuestion || currentQuestion.selectedAnswer) return;
    setShowSimpleHint(true);
    setIsSimpleHintUsed(true);
  };


  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
    }
  }, [navigate]);

  // Memoize current question to avoid recalculations
  const currentQuestion = useMemo(() => {
    return questions && questions.length > currentQuestionIndex ? questions[currentQuestionIndex] : null;
  }, [questions, currentQuestionIndex]);


  if (!difficulty) {
    return (
      <div className="quiz-container">
        <h2>Выберите сложность квиза</h2>
        <div className="difficulty-buttons">
          <button onClick={() => loadQuestions('easy')}>Легко</button>
          <button onClick={() => loadQuestions('medium')}>Средне</button>
          <button onClick={() => loadQuestions('hard')}>Сложно</button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="quiz-container">
        <p>Загрузка вопросов...</p>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="quiz-container">
        <h2>Результат квиза</h2>
        <p>Ваш счет: {score} из {questions.length}</p>
        <button onClick={restartQuiz}>Пройти квиз снова</button>
        {showNotification && newAchievement && (
          <AchievementNotification
            achievement={newAchievement}
            onClose={() => setShowNotification(false)}
          />
        )}
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-container">
        <p>Не удалось загрузить вопрос. Попробуйте выбрать сложность заново.</p>
        <button onClick={restartQuiz} className="restart-button">Выбрать сложность</button>
      </div>
    );
  }

  // Добавляем лог перед рендерингом
  console.log('Rendering question card for:', currentQuestion);

  // Если все в порядке, рендерим карточку вопроса
  return (
    <>
      <div className="quiz-container">
        {/* ---> Кнопка для открытия лидерборда <--- */} 
        <button 
            className="toggle-leaderboard-button"
            onClick={() => setIsLeaderboardOpen(true)}
            title="Показать лидеров"
        >
            🏆
        </button>

        <div className="quiz-header">
          <span>Вопрос {currentQuestionIndex + 1} из {questions.length}</span>
          <span className="score">Счет: {score}</span>
        </div>

        <div className="question-card">
          <p className="question-text">{currentQuestion.question}</p>

          {/* Отображение простой подсказки */}
          {showSimpleHint && currentQuestion.hint && (
            <div className="hint">
              <h4>Подсказка:</h4>
              <p>{currentQuestion.hint}</p>
            </div>
          )}

          {/* Используем options-grid для размещения кнопок */}
          <div className="options-grid">
            {currentQuestion.shuffledOptions.map((option, index) => {
              const isSelected = currentQuestion.selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;
              const isDisabledByFiftyFifty = disabledOptions.includes(option);
              // Проверяем currentQuestion?.selectedAnswer на null/undefined
              const isAnswered = currentQuestion?.selectedAnswer !== undefined;
              const isDisabled = isAnswered || isDisabledByFiftyFifty;

              let buttonClass = 'option-button';
              // Проверяем currentQuestion?.selectedAnswer на null/undefined
              if (isAnswered) {
                if (isSelected) {
                  buttonClass += isCorrect ? ' correct' : ' wrong';
                } else if (isCorrect) {
                  buttonClass += ' correct'; // Подсветить правильный, если выбран неверный
                }
              }
               if (isDisabledByFiftyFifty) {
                 buttonClass += ' disabled-fifty-fifty'; // Доп. класс для скрытия или стилизации
               }


              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={buttonClass}
                  // Отключаем кнопку если ответ выбран ИЛИ она отключена 50/50
                  disabled={isDisabled}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Секция с кнопками подсказок */}
          <div className="hints-section">
            <button
              onClick={useFiftyFifty}
              // Проверяем currentQuestion?.selectedAnswer на null/undefined
              disabled={isFiftyFiftyUsed || currentQuestion?.selectedAnswer !== undefined}
              className={`hint-button ${isFiftyFiftyUsed ? 'used' : ''}`}
            >
              50/50
            </button>
            {currentQuestion.hint && ( // Показываем кнопку только если есть подсказка
               <button
                 onClick={useSimpleHint}
                 // Проверяем currentQuestion?.selectedAnswer на null/undefined
                 disabled={isSimpleHintUsed || currentQuestion?.selectedAnswer !== undefined || showSimpleHint}
                 className={`hint-button ${isSimpleHintUsed ? 'used' : ''}`}
               >
                Показать подсказку
               </button>
            )}
          </div>
        </div>
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

export default Quiz; 