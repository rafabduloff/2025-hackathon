import { userQueries, quizQueries, minigameQueries, hashPassword } from './db';


export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  created_at: string;
  last_login: string | null;
}

export interface QuizQuestion {
  id: number;
  question: string;
  correct_answer: string;
  wrong_answer1: string;
  wrong_answer2: string;
  wrong_answer3: string;
  difficulty: string;
  category: string;
  hint: string;
}

interface Quote {
  id: number;
  quote: string;
  character: string;
  movie: string;
  difficulty: string;
}


export const authAPI = {
  register: async (username: string, password: string, email: string): Promise<User> => {
    try {
      const hashedPassword = hashPassword(password);
      const result = userQueries.createUser.run({
        username,
        password: hashedPassword,
        email
      });
      return userQueries.getUserByUsername.get({ username }) as User;
    } catch (error) {
      throw new Error('Ошибка при регистрации пользователя');
    }
  },

  login: async (username: string, password: string): Promise<User> => {
    try {
      const user = userQueries.getUserByUsername.get({ username }) as User;
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        throw new Error('Неверный пароль');
      }

      userQueries.updateLastLogin.run({ id: user.id });
      return user;
    } catch (error) {
      throw new Error('Ошибка при входе в систему');
    }
  }
};


export const quizAPI = {
  getQuestions: async (difficulty: string, limit: number = 10): Promise<QuizQuestion[]> => {
    try {
      return quizQueries.getQuestions.all({ difficulty, limit }) as QuizQuestion[];
    } catch (error) {
      throw new Error('Ошибка при получении вопросов');
    }
  },

  saveResult: async (userId: number, difficulty: string, score: number, totalQuestions: number): Promise<void> => {
    try {
      quizQueries.saveQuizResult.run({
        user_id: userId,
        difficulty,
        score,
        total_questions: totalQuestions
      });
    } catch (error) {
      throw new Error('Ошибка при сохранении результата');
    }
  },

  getUserResults: async (userId: number): Promise<any[]> => {
    try {
      return quizQueries.getUserQuizResults.all({ user_id: userId });
    } catch (error) {
      throw new Error('Ошибка при получении результатов');
    }
  }
};


export const minigameAPI = {
  getQuotes: async (difficulty: string, limit: number = 10): Promise<Quote[]> => {
    try {
      return minigameQueries.getQuotes.all({ difficulty, limit }) as Quote[];
    } catch (error) {
      throw new Error('Ошибка при получении цитат');
    }
  },

  saveResult: async (userId: number, score: number, totalQuestions: number): Promise<void> => {
    try {
      minigameQueries.saveMinigameResult.run({
        user_id: userId,
        score,
        total_questions: totalQuestions
      });
    } catch (error) {
      throw new Error('Ошибка при сохранении результата');
    }
  },

  getUserResults: async (userId: number): Promise<any[]> => {
    try {
      return minigameQueries.getUserMinigameResults.all({ user_id: userId });
    } catch (error) {
      throw new Error('Ошибка при получении результатов');
    }
  }
}; 
