import { db } from './db';

const seedDatabase = () => {
  
  const quizQuestions = [
    {
      question: "Какой камень бесконечности контролирует разум?",
      correct_answer: "Камень разума",
      wrong_answer1: "Камень времени",
      wrong_answer2: "Камень силы",
      wrong_answer3: "Камень пространства",
      difficulty: "easy",
      category: "Камни бесконечности"
    },
    {
      question: "Кто создал Вижена?",
      correct_answer: "Ультрон",
      wrong_answer1: "Тони Старк",
      wrong_answer2: "Брюс Беннер",
      wrong_answer3: "Хэнк Пим",
      difficulty: "medium",
      category: "Персонажи"
    },
    {
      question: "Какой актер сыграл Таноса в фильмах Marvel?",
      correct_answer: "Джош Бролин",
      wrong_answer1: "Марк Руффало",
      wrong_answer2: "Крис Хемсворт",
      wrong_answer3: "Роберт Дауни мл.",
      difficulty: "hard",
      category: "Актеры"
    }
  ];

  
  const quotes = [
    {
      quote: "Я есть Грут",
      character: "Грут",
      movie: "Стражи Галактики",
      difficulty: "easy"
    },
    {
      quote: "Я могу делать это весь день",
      character: "Капитан Америка",
      movie: "Первый мститель",
      difficulty: "medium"
    },
    {
      quote: "Я всегда был человеком, который смотрит в будущее, а не в прошлое",
      character: "Тони Старк",
      movie: "Мстители: Финал",
      difficulty: "hard"
    }
  ];

  
  const insertQuestion = db.prepare(`
    INSERT INTO quiz_questions (
      question, correct_answer, wrong_answer1, wrong_answer2, wrong_answer3, difficulty, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  
  const insertQuote = db.prepare(`
    INSERT INTO quotes (quote, character, movie, difficulty)
    VALUES (?, ?, ?, ?)
  `);

  
  const insertData = db.transaction(() => {
    for (const question of quizQuestions) {
      insertQuestion.run(
        question.question,
        question.correct_answer,
        question.wrong_answer1,
        question.wrong_answer2,
        question.wrong_answer3,
        question.difficulty,
        question.category
      );
    }

    for (const quote of quotes) {
      insertQuote.run(
        quote.quote,
        quote.character,
        quote.movie,
        quote.difficulty
      );
    }
  });

  
  insertData();
};

export default seedDatabase; 
