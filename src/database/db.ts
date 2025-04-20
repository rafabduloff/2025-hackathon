import IndexedDB from './indexedDb';

const db = IndexedDB.getInstance();

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  selectedAnswer?: string;
}

export interface Quote {
  id: number;
  quote: string;
  character: string;
  movie: string;
  difficulty: string;
}

export async function getQuizQuestions(difficulty: string = 'medium', limit: number = 10): Promise<QuizQuestion[]> {
  return db.getQuizQuestions(difficulty, limit);
}

export async function saveQuizResult(userId: number, difficulty: string, score: number, totalQuestions: number): Promise<void> {
  return db.saveQuizResult(userId, difficulty, score, totalQuestions);
}

export async function getUserResults(userId: number): Promise<any[]> {
  return db.getUserResults(userId);
}

export async function createUser(username: string, password: string, email: string): Promise<number> {
  return db.createUser(username, password, email);
}

export async function verifyUser(username: string, password: string): Promise<any> {
  return db.verifyUser(username, password);
}

export async function getUserProfile(userId: number): Promise<any> {
  return db.getUserProfile(userId);
}

// Новая функция для обновления профиля
export async function updateUserProfile(userId: number, profileData: { nickname?: string; avatar?: string; bio?: string }): Promise<boolean> {
  return db.updateUserProfile(userId, profileData);
}

// Новая функция для получения лучшего результата по ID пользователя и сложности/игре
export async function getBestUserResult(userId: number, difficulty: string): Promise<any | null> {
  return db.getBestUserResult(userId, difficulty);
}

// Функции для работы с цитатами
export async function getQuotes(difficulty: string, limit: number = 5): Promise<Quote[]> {
  const questions = await db.getQuizQuestions(difficulty, limit);
  // Фильтруем вопросы без ID и маппим
  return questions
    .filter(q => q.id !== undefined) // Убедимся, что ID есть
    .map(q => ({
    id: q.id!, // Используем Non-null assertion operator, т.к. отфильтровали undefined
    quote: q.question,
    character: q.correct_answer,
    movie: q.options[0],
    difficulty: q.difficulty
  }));
}

export async function saveMinigameResult(userId: number, score: number, totalQuestions: number): Promise<void> {
  return db.saveQuizResult(userId, 'minigame', score, totalQuestions);
}

export async function getUserMinigameResults(userId: number): Promise<any[]> {
  return db.getUserResults(userId);
}

// Функции для работы с достижениями
export async function checkAchievements(userId: number, gameType: 'quiz' | 'minigame', score: number, total: number, difficulty: string): Promise<void> {
  // TODO: Реализовать проверку достижений
  return Promise.resolve();
}

// Функции для работы с сбросом пароля
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  // TODO: Реализовать сброс пароля
  return Promise.resolve(true);
}

// Новая функция для получения всех пользователей
export async function getAllUsers(): Promise<any[]> {
    return db.getAllUsers();
}

// ---> Новая функция для получения топа лидеров по сложности/игре <--- 
export async function getTopScoresForDifficulty(difficulty: string, limit: number = 10): Promise<any[]> {
    return db.getTopScoresForDifficulty(difficulty, limit);
} 