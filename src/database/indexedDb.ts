import { Achievement, AchievementProgress, UserAchievements, AchievementCategory } from '../types/achievements';
import { QuizQuestion } from './db';

class IndexedDB {
  private static instance: IndexedDB;
  private db: IDBDatabase | null = null;
  private dbName = 'marvel_quiz';
  private dbVersion = 5;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    this.initDB();
  }

  public static getInstance(): IndexedDB {
    if (!IndexedDB.instance) {
      IndexedDB.instance = new IndexedDB();
    }
    return IndexedDB.instance;
  }

  private initDB(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      // --- Сразу открываем базу данных, НЕ УДАЛЯЕМ --- 
      console.log(`Attempting to open database: ${this.dbName} version: ${this.dbVersion}`);
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Ошибка открытия базы данных:', request.error);
        this.initPromise = null; // Сбрасываем промис при ошибке
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('База данных успешно открыта');
        this.db = request.result;
        
        // Добавляем обработчик versionchange здесь, после успешного открытия
        this.db.onversionchange = (event) => {
           console.warn('Database version change requested, closing connection.');
           this.db?.close();
           this.db = null;
           this.initPromise = null; // Сбросить промис, чтобы новая версия могла инициализироваться
           alert("Версия базы данных устарела, пожалуйста, обновите страницу.");
         };
         
        resolve(); // Разрешаем промис ИНИЦИАЛИЗАЦИИ
      };

      request.onupgradeneeded = (event) => {
        console.log('Обновление базы данных (onupgradeneeded)');
        this.db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        
        // Добавляем обработчик versionchange и сюда, на случай если onsuccess не сработает до смены версии
         this.db.onversionchange = (event) => {
           console.warn('Database version change requested during upgrade, closing connection.');
           this.db?.close();
           this.db = null;
            this.initPromise = null;
           alert("Версия базы данных устарела, пожалуйста, обновите страницу.");
         };

        // --- Логика создания хранилищ --- 
        // (код создания users, quiz_questions и т.д. остается здесь)
        if (!this.db.objectStoreNames.contains('users')) {
            console.log('Создание хранилища users');
            const userStore = this.db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            userStore.createIndex('username', 'username', { unique: true });
            userStore.createIndex('email', 'email', { unique: true });
        } else {
             // Если нужно обновить существующее хранилище users (например, добавить индекс)
             // Это делается здесь, но аккуратно, чтобы не потерять данные.
             // В нашем случае пока не требуется.
             console.log('Хранилище users уже существует.');
        }

        if (!this.db.objectStoreNames.contains('quiz_questions')) {
            console.log('Создание хранилища quiz_questions');
            const questionStore = this.db.createObjectStore('quiz_questions', { keyPath: 'id', autoIncrement: true });
            questionStore.createIndex('difficulty', 'difficulty');
            
            // Добавление вопросов
            const questions = [
              {
                question: "Какой камень бесконечности контролирует разум?",
                options: ["Камень разума", "Камень времени", "Камень силы", "Камень пространства"],
                correct_answer: "Камень разума",
                difficulty: "easy",
                hint: "Этот камень имеет фиолетовый цвет"
              },
              {
                question: "Как зовут отца Тора?",
                options: ["Один", "Локи", "Хеймдалль", "Бальдр"],
                correct_answer: "Один",
                difficulty: "easy",
                hint: "Этот персонаж является королем Асгарда"
              },
              {
                question: "Как зовут кота Капитана Марвел?",
                options: ["Гусь", "Чешир", "Мурзик", "Флеркен"],
                correct_answer: "Гусь",
                difficulty: "easy",
                hint: "Этот 'кот' на самом деле опасный инопланетянин"
              },
              {
                question: "Какой супергерой носит маску с паучьей символикой?",
                options: ["Человек-паук", "Черная пантера", "Соколиный глаз", "Сорвиголова"],
                correct_answer: "Человек-паук",
                difficulty: "easy",
                hint: "Этот герой получил свои способности от укуса паука"
              },
              {
                question: "Как настоящее имя Черной Вдовы?",
                options: ["Наташа Романофф", "Ванда Максимофф", "Пеппер Поттс", "Кэрол Денверс"],
                correct_answer: "Наташа Романофф",
                difficulty: "easy",
                hint: "Она - бывшая шпионка КГБ"
              },
              {
                question: "Кто является лучшим другом Капитана Америки?",
                options: ["Баки Барнс", "Тони Старк", "Сэм Уилсон", "Брюс Беннер"],
                correct_answer: "Баки Барнс",
                difficulty: "easy",
                hint: "Он также известен как Зимний Солдат"
              },
              {
                question: "Какой цвет у Халка?",
                options: ["Зеленый", "Красный", "Синий", "Серый"],
                correct_answer: "Зеленый",
                difficulty: "easy",
                hint: "Это его самый известный облик"
              },
              {
                question: "Назовите альтер эго Железного человека.",
                options: ["Тони Старк", "Брюс Уэйн", "Питер Паркер", "Стив Роджерс"],
                correct_answer: "Тони Старк",
                difficulty: "easy",
                hint: "Он - гений, миллиардер, плейбой, филантроп"
              },
              {
                question: "Кто такой Грут?",
                options: ["Древоподобный гуманоид", "Енот", "Воин", "Бог"],
                correct_answer: "Древоподобный гуманоид",
                difficulty: "easy",
                hint: "Он говорит только одну фразу"
              },
              {
                question: "Как называется молот Тора?",
                options: ["Мьёльнир", "Громсекира", "Гунгнир", "Стормбрейкер"],
                correct_answer: "Мьёльнир",
                difficulty: "easy",
                hint: "Его могут поднять только достойные"
              },

              {
                question: "Кто создал Вижена?",
                options: ["Ультрон", "Тони Старк и Брюс Беннер", "Хэнк Пим", "Танос"],
                correct_answer: "Ультрон",
                difficulty: "medium",
                hint: "Главный антагонист фильма 'Эра Альтрона'"
              },
              {
                question: "Какой металл используется для создания щита Капитана Америки?",
                options: ["Вибраниум", "Адамантий", "Уру", "Карбонадий"],
                correct_answer: "Вибраниум",
                difficulty: "medium",
                hint: "Этот металл добывается в Ваканде"
              },
              {
                question: "Какой супергерой использует молот Мьёльнир (кроме Тора)?",
                options: ["Капитан Америка", "Вижен", "Халк", "Железный человек"],
                correct_answer: "Капитан Америка",
                difficulty: "medium",
                hint: "Он поднял его в 'Мстители: Финал'"
              },
              {
                question: "Какой супергерой является королем Ваканды?",
                options: ["Черная пантера", "Человек-муравей", "Доктор Стрэндж", "Соколиный глаз"],
                correct_answer: "Черная пантера",
                difficulty: "medium",
                hint: "Его настоящее имя Т'Чалла"
              },
              {
                question: "Какой артефакт использует Доктор Стрэндж для управления временем?",
                options: ["Глаз Агамотто", "Плащ Левитации", "Книга Вишанти", "Сфера Агамотто"],
                correct_answer: "Глаз Агамотто",
                difficulty: "medium",
                hint: "В нем находился Камень Времени"
              },
              {
                question: "Кто является главным антагонистом первого фильма 'Мстители'?",
                options: ["Локи", "Танос", "Красный Череп", "Ультрон"],
                correct_answer: "Локи",
                difficulty: "medium",
                hint: "Сводный брат Тора"
              },
               {
                question: "Какая организация создала Зимнего Солдата?",
                options: ["Гидра", "Щ.И.Т.", "А.И.М.", "Десять колец"],
                correct_answer: "Гидра",
                difficulty: "medium",
                hint: "Тайная организация, проникшая в Щ.И.Т."
              },
              {
                question: "Как зовут искусственный интеллект Тони Старка (первый)?",
                options: ["ДЖАРВИС", "ПЯТНИЦА", "Карен", "ЭДИТ"],
                correct_answer: "ДЖАРВИС",
                difficulty: "medium",
                hint: "Аббревиатура: Just A Rather Very Intelligent System"
              },
              {
                question: "Кто из Стражей Галактики является приемной дочерью Таноса?",
                options: ["Гамора", "Небула", "Мантис", "Ракета"],
                correct_answer: "Гамора",
                difficulty: "medium",
                hint: "У нее зеленая кожа"
              },
              {
                question: "Какой персонаж обладает суперскоростью в 'Эре Альтрона'?",
                options: ["Ртуть", "Алая Ведьма", "Сокол", "Вижен"],
                correct_answer: "Ртуть",
                difficulty: "medium",
                hint: "Брат-близнец Ванды Максимофф"
              },

              {
                question: "Какой актер сыграл Таноса в фильмах Marvel?",
                options: ["Джош Бролин", "Марк Руффало", "Крис Хемсворт", "Роберт Дауни мл."],
                correct_answer: "Джош Бролин",
                difficulty: "hard",
                hint: "Этот актер также играл Кейбла в 'Дэдпуле 2'"
              },
              {
                question: "Кто был первым супергероем, появившимся в комиксах Marvel (Timely Comics)?",
                options: ["Человек-факел (андроид)", "Капитан Америка", "Намор", "Ангел"],
                correct_answer: "Человек-факел (андроид)",
                difficulty: "hard",
                hint: "Не тот Человек-факел, что в Фантастической четверке"
              },
              {
                question: "Какой супергерой является мастером боевых искусств и слепым?",
                options: ["Сорвиголова", "Дэдпул", "Росомаха", "Железный Кулак"],
                correct_answer: "Сорвиголова",
                difficulty: "hard",
                hint: "Его настоящее имя Мэтт Мёрдок"
              },
              {
                question: "Какой супергерой может изменять свой размер с помощью частиц Пима?",
                options: ["Человек-муравей", "Оса", "Великан", "Голиаф"],
                correct_answer: "Человек-муравей",
                difficulty: "hard",
                hint: "Скотт Лэнг - один из носителей этого имени"
              },
              {
                question: "Как называется родная планета Тора?",
                options: ["Асгард", "Ксандар", "Земля", "Сакаар"],
                correct_answer: "Асгард",
                difficulty: "hard",
                hint: "Была разрушена Суртуром"
              },
               {
                question: "Какой камень бесконечности был спрятан на Вормире?",
                options: ["Камень Души", "Камень Реальности", "Камень Силы", "Камень Времени"],
                correct_answer: "Камень Души",
                difficulty: "hard",
                hint: "Требует великой жертвы для получения"
              },
               {
                question: "Кто убил родителей Тони Старка?",
                options: ["Зимний Солдат", "Красный Череп", "Обадайя Стейн", "Локи"],
                correct_answer: "Зимний Солдат",
                difficulty: "hard",
                hint: "Действовал под контролем Гидры"
              },
              {
                question: "Назовите полное имя Ника Фьюри.",
                options: ["Николас Джозеф Фьюри", "Натаниэль Джонатан Фьюри", "Норман Джеймс Фьюри", "Нельсон Джордж Фьюри"],
                correct_answer: "Николас Джозеф Фьюри",
                difficulty: "hard",
                hint: "Директор Щ.И.Т."
              },
              {
                question: "Из какого материала сделан костюм Черной Пантеры?",
                options: ["Вибраниум", "Адамантий", "Уру", "Нанотехнологии"],
                correct_answer: "Вибраниум",
                difficulty: "hard",
                hint: "Тот же металл, что и в щите Капитана Америки"
              },
               {
                question: "Кто такой Адам Уорлок?",
                options: ["Искусственно созданное существо", "Бог", "Мутант", "Колдун"],
                correct_answer: "Искусственно созданное существо",
                difficulty: "hard",
                hint: "Создан Суверенами для уничтожения Стражей Галактики"
              }
            ];
            
            if (transaction) { // Используем транзакцию из события
              const store = transaction.objectStore('quiz_questions');
               console.log('Adding default quiz questions...');
              questions.forEach(question => {
                 try {
                   store.add(question);
                 } catch (e) {
                   console.error('Error adding question:', question, e);
                 }
               });
               console.log('Default quiz questions added.');
            } else {
               console.error('Transaction not available during onupgradeneeded for adding questions.');
            }
        } else {
             console.log('Хранилище quiz_questions уже существует.');
        }

        // Обновлено: Правильное имя хранилища 'results'
        let resultsStore: IDBObjectStore;
        if (!this.db.objectStoreNames.contains('results')) {
            console.log('Создание хранилища results');
            resultsStore = this.db.createObjectStore('results', { keyPath: 'id', autoIncrement: true });
        } else {
            resultsStore = transaction!.objectStore('results');
            console.log('Хранилище results уже существует.');
        }
        
        // Обновлено: Создание или проверка индекса 'userId'
        if (!resultsStore.indexNames.contains('userId')) {
            console.log('Создание индекса userId в results');
            resultsStore.createIndex('userId', 'userId');
        }

        // Обновлено: Создание или проверка составного индекса 'userId_difficulty'
        if (!resultsStore.indexNames.contains('userId_difficulty')) {
            console.log('Создание индекса userId_difficulty в results');
            resultsStore.createIndex('userId_difficulty', ['userId', 'difficulty']);
        }

         if (!this.db.objectStoreNames.contains('achievements')) {
             console.log('Создание хранилища achievements');
             const achievementStore = this.db.createObjectStore('achievements', { keyPath: 'id' });
             achievementStore.createIndex('category', 'category');
          }
          
          if (!this.db.objectStoreNames.contains('user_achievements')) {
            console.log('Создание хранилища user_achievements');
            const userAchievementStore = this.db.createObjectStore('user_achievements', { keyPath: ['userId', 'achievementId'] });
            userAchievementStore.createIndex('userId', 'userId');
          }

        console.log('Обновление базы данных (onupgradeneeded) завершено');
        // Не вызываем resolve() здесь, ждем request.onsuccess
      };
      // --- Конец onupgradeneeded ---
      
      request.onblocked = (event) => {
          console.warn('Открытие базы данных заблокировано другой вкладкой. Закройте другие вкладки.', event);
          alert('Пожалуйста, закройте другие вкладки с этим сайтом и обновите страницу.');
          this.initPromise = null; // Сбрасываем промис, т.к. открытие не удалось
          reject(new Error('Database open blocked'));
       };
       
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.initPromise) {
       console.warn('[getStore] initPromise is null, calling initDB directly.');
       await this.initDB();
    } else {
       await this.initPromise; 
    }
    
    if (!this.db) {
        console.error('[getStore] Database is still null after initPromise resolved!');
        throw new Error('Database initialization failed.');
    }
    
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  public async getQuizQuestions(difficulty: string = 'medium', limit: number = 5): Promise<QuizQuestion[]> {
    console.log(`Получение ${limit} вопросов для сложности: ${difficulty}`);
    const store = await this.getStore('quiz_questions');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allQuestions = request.result as QuizQuestion[];
        console.log('Всего вопросов в базе:', allQuestions.length);
        
        const filteredQuestions = allQuestions.filter(q => q.difficulty === difficulty);
        console.log(`Найдено вопросов для сложности ${difficulty}:`, filteredQuestions.length);
        
        const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
        
        const selectedQuestions = shuffled.slice(0, limit);
        console.log('Выбрано вопросов:', selectedQuestions.length);

        if (selectedQuestions.length < limit && filteredQuestions.length > 0) {
          console.warn(`Недостаточно вопросов сложности ${difficulty} для выбора ${limit}. Найдено: ${filteredQuestions.length}, Возвращено: ${selectedQuestions.length}`);
        } else if (filteredQuestions.length === 0) {
           console.error(`Вопросы сложности ${difficulty} не найдены в базе данных.`);
           resolve([]);
           return;
        }

        resolve(selectedQuestions);
      };
      
      request.onerror = () => {
        console.error('Ошибка при получении вопросов:', request.error);
        reject(request.error);
      };
    });
  }

  public async saveQuizResult(userId: number, difficulty: string, score: number, totalQuestions: number): Promise<void> {
    console.log(`[indexedDb] saveQuizResult called. userId: ${userId}, difficulty: ${difficulty}, score: ${score}, total: ${totalQuestions}`);
    const store = await this.getStore('results', 'readwrite');
    return new Promise((resolve, reject) => {
      const resultData = {
        userId: userId,
        difficulty: difficulty,
        score: score,
        totalQuestions: totalQuestions,
        timestamp: new Date().getTime()
      };
      console.log('[indexedDb] Attempting to add result:', resultData);
      const request = store.add(resultData);
      
      request.onsuccess = (event) => {
         const generatedId = (event.target as IDBRequest).result;
         console.log(`[indexedDb] saveQuizResult successful. Record ID: ${generatedId}`);
         resolve();
      };
      request.onerror = () => {
         console.error('[indexedDb] saveQuizResult failed:', request.error);
         reject(request.error);
      };
    });
  }

  public async getUserResults(userId: number): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) return reject('Database not initialized');
      try {
        const store = await this.getStore('results');
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          const sortedResults = request.result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          resolve(sortedResults);
        };
        request.onerror = () => {
          console.error('Ошибка получения результатов пользователя:', request.error);
          reject(request.error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public async createUser(username: string, password: string, email: string): Promise<number> {
    const hashedPassword = password; // Пока хэширование не реализовано
    let transaction: IDBTransaction;
    let store: IDBObjectStore;
    let createdUserId: number | null = null;

    // Запускаем Promise, который будет ждать завершения транзакции
    return new Promise(async (resolve, reject) => {
      try {
        // Начинаем транзакцию
        if (!this.db) {
           // Убедимся, что БД инициализирована перед транзакцией
           if (!this.initPromise) await this.initDB();
           else await this.initPromise;
           if (!this.db) throw new Error('Database connection failed after init.');
        }
        transaction = this.db.transaction(['users'], 'readwrite');
        store = transaction.objectStore('users');

        // Устанавливаем обработчики ЗАВЕРШЕНИЯ транзакции
        transaction.oncomplete = () => {
          console.log('[createUser] Transaction completed.');
          if (createdUserId !== null) {
            resolve(createdUserId); // Разрешаем промис ТОЛЬКО здесь
          } else {
            // Этого не должно произойти, если addRequest был успешен
            reject(new Error('Transaction completed but userId was not assigned.'));
          }
        };

        transaction.onerror = (event) => {
          console.error('[createUser] Transaction error:', transaction.error, event);
          reject(transaction.error || new Error('Transaction failed'));
        };

        transaction.onabort = (event) => {
           console.error('[createUser] Transaction aborted:', transaction.error, event);
           reject(transaction.error || new Error('Transaction aborted'));
        }

        // --- Логика проверки и добавления ВНУТРИ транзакции --- 

        const usernameIndex = store.index('username');
        const emailIndex = store.index('email');
        const usernameRequest = usernameIndex.get(username);
        const emailRequest = emailIndex.get(email);
        let userExists = false;

        // Обрабатываем запрос на проверку username
        usernameRequest.onsuccess = () => {
          if (usernameRequest.result) {
            userExists = true;
          }
          // Обрабатываем запрос на проверку email ПОСЛЕ username
          emailRequest.onsuccess = () => {
            if (emailRequest.result) {
              userExists = true;
            }

            if (userExists) {
              // Если пользователь есть, прерываем транзакцию
              const error = new Error('User with this username or email already exists.');
              console.error(error.message);
              transaction.abort(); // Явно прерываем
              // Reject сработает через transaction.onabort или transaction.onerror
              return;
            }

            // Если пользователь не найден, добавляем нового
            const newUser = {
              username,
              password: hashedPassword,
              email,
              nickname: '', 
              avatar: '', 
              bio: '',  
              created_at: new Date().toISOString()
            };
            const addRequest = store.add(newUser);

            addRequest.onsuccess = (event) => {
              createdUserId = (event.target as IDBRequest).result as number;
              console.log(`[createUser] addRequest successful, assigned ID: ${createdUserId}. Waiting for transaction commit...`);
              // НЕ РЕЗОЛВИМ ЗДЕСЬ! Ждем transaction.oncomplete
            };

            // Ошибку addRequest обрабатывает transaction.onerror
            addRequest.onerror = (event) => {
              console.error('[createUser] addRequest error:', addRequest.error, event);
               // Ошибка запроса также вызовет transaction.onerror или transaction.onabort
            };
          };

          emailRequest.onerror = (event) => {
             console.error('[createUser] email check request error:', emailRequest.error, event);
             // Ошибка запроса также вызовет transaction.onerror или transaction.onabort
          };
        };

        usernameRequest.onerror = (event) => {
           console.error('[createUser] username check request error:', usernameRequest.error, event);
           // Ошибка запроса также вызовет transaction.onerror или transaction.onabort
        };
        
      } catch (error) {
        console.error('[createUser] Caught error before starting transaction:', error);
        reject(error);
      }
    });
  }

  public async verifyUser(username: string, password: string): Promise<any> {
    // Гарантируем инициализацию перед чтением
    if (!this.db) {
      if (!this.initPromise) await this.initDB();
      else await this.initPromise;
      if (!this.db) throw new Error('Database connection failed after init.');
    }
    const store = await this.getStore('users'); // getStore теперь ожидает initPromise
    return new Promise((resolve, reject) => {
      const request = store.index('username').get(username);
      request.onsuccess = () => {
        const user = request.result;
        if (user && user.password === password) {
          resolve(user);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getUserProfile(userId: number): Promise<any> {
    console.log(`[indexedDb] getUserProfile called with userId: ${userId}, type: ${typeof userId}`);
    return new Promise(async (resolve, reject) => {
      try {
        const store = await this.getStore('users');
        const request = store.get(userId);
        request.onsuccess = () => {
          console.log('[indexedDb] getUserProfile request.onsuccess. Result:', request.result);
          if (request.result) {
            // Удаляем пароль перед возвратом
            const { password, ...userProfile } = request.result;
            resolve(userProfile);
          } else {
            console.log(`[indexedDb] User not found for ID: ${userId}`);
            resolve(null); // Пользователь не найден
          }
        };
        request.onerror = () => {
          console.error(`[indexedDb] getUserProfile request.onerror for ID ${userId}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error(`[indexedDb] getUserProfile caught error for ID ${userId}:`, error);
        reject(error);
      }
    });
  }

  public async updateUserProfile(userId: number, profileData: { nickname?: string; avatar?: string; bio?: string }): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
       if (!this.db) return reject('Database not initialized');
       try {
         const store = await this.getStore('users', 'readwrite');
         const getRequest = store.get(userId);

         getRequest.onsuccess = () => {
           const user = getRequest.result;
           if (user) {
             // Обновляем только предоставленные поля
             const updatedUser = { ...user, ...profileData };
             const putRequest = store.put(updatedUser);

             putRequest.onsuccess = () => resolve(true);
             putRequest.onerror = () => {
               console.error('Ошибка обновления профиля:', putRequest.error);
               reject(putRequest.error);
             };
           } else {
             reject('User not found');
           }
         };
         getRequest.onerror = () => {
           console.error('Ошибка получения пользователя для обновления:', getRequest.error);
           reject(getRequest.error);
         };
       } catch (error) {
         reject(error);
       }
     });
   }

  // ---> Новый метод для получения всех пользователей <--- 
  public async getAllUsers(): Promise<any[]> { 
    await this.initDB();
    if (!this.db) throw new Error('База данных не инициализирована');

    return new Promise(async (resolve, reject) => {
        try {
            const store = await this.getStore('users', 'readonly');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []); // Возвращаем массив пользователей или пустой массив
            };

            request.onerror = () => {
                console.error('Ошибка получения всех пользователей:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('Ошибка при доступе к хранилищу users:', error);
            reject(error);
        }
    });
  }

  // Новая функция для получения ЛУЧШЕГО результата пользователя по сложности
  public async getBestUserResult(userId: number, difficulty: string): Promise<any | null> {
    await this.initDB(); // Убедимся, что БД инициализирована
    if (!this.db) throw new Error('База данных не инициализирована');

    return new Promise(async (resolve, reject) => {
      try {
        // Обновлено: Правильное имя хранилища 'results'
        const store = await this.getStore('results', 'readonly');
        // Обновлено: Используем составной индекс 'userId_difficulty'
        const index = store.index('userId_difficulty');
        const range = IDBKeyRange.only([userId, difficulty]);
        const request = index.getAll(range);

        request.onsuccess = () => {
          const results = request.result;
          if (!results || results.length === 0) {
            resolve(null); // Нет результатов для этой сложности
            return;
          }
          // Ищем результат с максимальным score
          const bestResult = results.reduce((best, current) => {
            // Добавим проверку, что best вообще существует (для первого элемента)
            if (!best) return current; 
            return current.score > best.score ? current : best;
          }, null); // Начинаем с null
          resolve(bestResult);
        };

        request.onerror = () => {
          console.error(`Ошибка получения лучших результатов для userId ${userId} и difficulty ${difficulty}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('Ошибка при доступе к хранилищу для получения лучших результатов:', error);
        reject(error);
      }
    });
  }

  // ---> Новый метод для получения ТОП результатов по сложности/игре <--- 
  public async getTopScoresForDifficulty(difficulty: string, limit: number = 10): Promise<any[]> {
    await this.initDB();
    if (!this.db) throw new Error('База данных не инициализирована');

    return new Promise(async (resolve, reject) => {
        try {
            const resultsStore = await this.getStore('results', 'readonly');
            const usersStore = await this.getStore('users', 'readonly'); // Нужен доступ к данным пользователей
            const request = resultsStore.getAll(); // Получаем ВСЕ результаты

            request.onsuccess = async () => {
                const allResults = request.result || [];
                
                // 1. Фильтруем по нужной сложности
                const filteredResults = allResults.filter(r => r.difficulty === difficulty);
                
                // 2. Группируем результаты по userId и находим лучший для каждого
                const bestScoresByUser = new Map<number, any>();
                filteredResults.forEach(result => {
                    const currentBest = bestScoresByUser.get(result.userId);
                    if (!currentBest || result.score > currentBest.score) {
                        bestScoresByUser.set(result.userId, result);
                    }
                });
                
                // 3. Преобразуем в массив лучших результатов
                const bestScoresArray = Array.from(bestScoresByUser.values());
                
                // 4. Сортируем по убыванию очков
                bestScoresArray.sort((a, b) => b.score - a.score);
                
                // 5. Берем топ N (limit)
                const topScores = bestScoresArray.slice(0, limit);
                
                // 6. Получаем данные пользователей для топ-N
                const leaderboardEntriesPromises = topScores.map(async (scoreEntry, index) => {
                    let user: any | null = null;
                    try {
                        const usersStore = await this.getStore('users', 'readonly'); // Получаем store внутри map
                        const userRequest = usersStore.get(scoreEntry.userId);
                        user = await new Promise<any | null>((res, rej) => {
                            userRequest.onsuccess = () => res(userRequest.result || null);
                            userRequest.onerror = () => {
                                console.error(`Error fetching user data for ID ${scoreEntry.userId}:`, userRequest.error);
                                // Не реджектим промис, а возвращаем null, чтобы обработать ниже
                                res(null); 
                            };
                        });
                        
                        // Используем никнейм, если есть, иначе имя пользователя, иначе запасной вариант
                        const nickname = user?.nickname || user?.username || `User #${scoreEntry.userId}`; 
                        const username = user?.username || `User #${scoreEntry.userId}`; // Запасной вариант для username
                        const avatar = user?.avatar || '/default-avatar.png'; // Запасной вариант для аватара

                        return {
                            rank: index + 1,
                            userId: scoreEntry.userId,
                            username: username, 
                            nickname: nickname, 
                            avatar: avatar,
                            score: scoreEntry.score,
                            totalQuestions: scoreEntry.totalQuestions, 
                        };
                    } catch (processingError) {
                        // Эта ошибка может возникнуть не при запросе к БД, а при обработке данных
                        console.error(`Failed to process leaderboard entry for userId ${scoreEntry.userId} after fetching user data:`, processingError);
                        // Возвращаем заглушку с ID пользователя
                        return {
                            rank: index + 1,
                            userId: scoreEntry.userId,
                            username: `User #${scoreEntry.userId}`,
                            nickname: `User #${scoreEntry.userId}`,
                            avatar: '/default-avatar.png',
                            score: scoreEntry.score,
                            totalQuestions: scoreEntry.totalQuestions, 
                        };
                    }
                });
                
                // Ожидаем завершения всех запросов данных пользователей
                const leaderboardEntries = await Promise.all(leaderboardEntriesPromises);
                
                resolve(leaderboardEntries);
            };

            request.onerror = () => {
                console.error(`Ошибка получения всех результатов для лидерборда (сложность ${difficulty}):`, request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error(`Ошибка при доступе к хранилищам для лидерборда (сложность ${difficulty}):`, error);
            reject(error);
        }
    });
  }
}

export default IndexedDB; 