import React, { useState, useRef, useEffect } from 'react';
import AchievementService from '../services/achievements'; // Импортируем сервис
import '../styles/MarvelHistory.css';

// Типизация данных для лучшей читаемости
interface HistoryEvent {
  phase: string; // Добавляем фазу к событию
  year: string;
  title: string;
  description: string;
  imagePlaceholder?: string; // Placeholder для имени файла или просто текст
}

interface HistoryPhase {
  phase: string;
  events: Omit<HistoryEvent, 'phase'>[]; // Убираем дублирование phase
}

// Обновленные данные с более подробными описаниями
const marvelHistoryData: HistoryPhase[] = [
  {
    phase: "Фаза 1: Сбор Мстителей",
    events: [
      {
        year: "2008",
        title: "Железный человек",
        description: "Гениальный изобретатель и промышленник Тони Старк попадает в плен в Афганистане. Вместо создания оружия для террористов, он тайно конструирует высокотехнологичный бронекостюм и совершает побег. Вернувшись, Старк переосмысливает наследие своей компании и решает использовать костюм для защиты мира, становясь Железным человеком и вступая в конфронтацию со своим деловым партнером Обадайей Стейном.",
        imagePlaceholder: "iron-man-1.jpg"
      },
      {
        year: "2008",
        title: "Невероятный Халк",
        description: "Ученый Брюс Бэннер скрывается от генерала Росса после неудачного эксперимента с гамма-излучением, превратившего его в неконтролируемого монстра — Халка. В поисках лекарства он возвращается в США, но вынужден противостоять не только военным, но и новому, еще более опасному врагу — Мерзости, в которого превратился одержимый силой солдат Эмиль Блонски.",
        imagePlaceholder: "incredible-hulk.jpg"
      },
      {
        year: "2010",
        title: "Железный человек 2",
        description: "Мир знает тайну Тони Старка. Правительство требует передать технологию брони, а сам Старк страдает от отравления палладием из реактора в груди. Ситуация осложняется появлением Ивана Ванко, сына бывшего партнера Говарда Старка, который создает собственную броню с хлыстами и жаждет мести. Старку приходится найти новый элемент для реактора и объединиться с Джеймсом Роудсом (Воителем).",
        imagePlaceholder: "iron-man-2.jpg"
      },
      {
        year: "2011",
        title: "Тор",
        description: "Высокомерный наследник трона Асгарда, Тор, из-за своей опрометчивости разжигает войну с ледяными великанами и изгоняется отцом Одином на Землю, лишенный сил и молота Мьёльнира. Пока он учится смирению и находит любовь в лице астрофизика Джейн Фостер, его коварный брат Локи захватывает трон Асгарда. Тор должен доказать свою доблесть, вернуть силы и остановить Локи.",
        imagePlaceholder: "thor-1.jpg"
      },
      {
        year: "2011",
        title: "Первый мститель",
        description: "В разгар Второй мировой войны хилый, но храбрый Стив Роджерс мечтает служить своей стране. Он соглашается на участие в секретной программе «Суперсолдат», которая наделяет его невероятной силой и выносливостью. Став Капитаном Америка, он сражается с нацистской организацией ГИДРА и ее лидером Красным Черепом, обладающим мощью Тессеракта. В финале он жертвует собой, чтобы спасти США, и замерзает во льдах Арктики.",
        imagePlaceholder: "captain-america-1.jpg"
      },
      {
        year: "2012",
        title: "Мстители",
        description: "Локи, получивший скипетр с Камнем Разума от Таноса, прибывает на Землю и похищает Тессеракт (Камень Пространства), чтобы открыть портал для армии Читаури. Директор Щ.И.Т. Ник Фьюри активирует инициативу «Мстители», собирая команду из Железного человека, Капитана Америка (найденного во льдах), Тора, Халка, Черной Вдовы и Соколиного Глаза. Преодолев внутренние разногласия, герои объединяются в битве за Нью-Йорк, чтобы остановить вторжение.",
        imagePlaceholder: "avengers-1.jpg"
      }
    ]
  },
  {
    phase: "Фаза 2",
    events: [
      {
        year: "2013",
        title: "Железный человек 3",
        description: "После битвы за Нью-Йорк Тони Старк страдает от посттравматического синдрома. Он сталкивается с новой угрозой в лице террориста Мандарина, за которым стоит ученый Олдрич Киллиан и его разработка — вирус Экстремис, дающий сверхсилы, но нестабильный. Лишившись дома и костюмов, Старк должен найти в себе силы, чтобы защитить близких и остановить Киллиана.",
        imagePlaceholder: "iron-man-3.jpg"
      },
      {
        year: "2013",
        title: "Тор: Царство тьмы",
        description: "Древняя раса тёмных эльфов во главе с Малекитом пробуждается, чтобы погрузить вселенную во тьму с помощью Эфира (Камня Реальности). Эфир случайно попадает в Джейн Фостер. Тор вынужден вызволить Локи из темницы и объединиться с ним, чтобы спасти Джейн и остановить Малекита, битвы разворачиваются как в Асгарде, так и на Земле во время редкого явления — Конвергенции миров.",
        imagePlaceholder: "thor-2.jpg"
      },
      {
        year: "2014",
        title: "Первый мститель: Другая война",
        description: "Стив Роджерс адаптируется к современному миру, работая на Щ.И.Т. Вместе с Черной Вдовой и новым союзником Сэмом Уилсоном (Соколом) он раскрывает масштабный заговор: ГИДРА тайно проникла в Щ.И.Т. и готовится запустить проект «Озарение» для установления мирового господства. Капитану предстоит сразиться не только с агентами ГИДРы, но и с таинственным убийцей — Зимним Солдатом, которым оказывается его друг Баки Барнс.",
        imagePlaceholder: "captain-america-2.jpg"
      },
      {
        year: "2014",
        title: "Стражи Галактики",
        description: "Землянин Питер Квилл (Звёздный Лорд), похищенный в детстве Опустошителями, находит таинственную Сферу (содержащую Камень Силы). За Сферой охотится фанатик Крии Ронан Обвинитель, работающий на Таноса. Квилл неохотно объединяется с командой колоритных неудачников: Гаморой, Драксом Разрушителем, енотом Ракетой и древоподобным гуманоидом Грутом. Вместе они должны помешать Ронану уничтожить планету Ксандар.",
        imagePlaceholder: "guardians-1.jpg"
      },
      {
        year: "2015",
        title: "Мстители: Эра Альтрона",
        description: "Тони Старк и Брюс Бэннер пытаются создать глобальную программу защиты «Альтрон» на основе искусственного интеллекта из скипетра Локи. Однако Альтрон обретает самосознание и решает, что человечество — главная угроза. Он создает себе армию роботов и тело из вибраниума, заручается поддержкой мутантов Ртути и Алой Ведьмы. Мстители должны остановить его план по уничтожению мира, что приводит к созданию нового героя — Вижна.",
        imagePlaceholder: "avengers-2.jpg"
      },
      {
        year: "2015",
        title: "Человек-муравей",
        description: "Талантливый вор Скотт Лэнг выходит из тюрьмы и пытается наладить жизнь. Ученый Хэнк Пим, создатель технологии уменьшения, выбирает Лэнга своим преемником. Скотт должен освоить костюм Человека-муравья, позволяющий уменьшаться до микроскопических размеров и управлять муравьями, чтобы выкрасть аналогичную технологию «Желтый Жакет» у бывшего протеже Пима, Даррена Кросса, который планирует продать ее ГИДРЕ.",
        imagePlaceholder: "ant-man-1.jpg"
      }
    ]
  },
  {
    phase: "Фаза 3",
    events: [
      {
        year: "2016",
        title: "Первый мститель: Противостояние",
        description: "После разрушительных событий с участием Мстителей правительства мира принимают «Заковианский договор», регулирующий деятельность супергероев. Это вызывает раскол в команде: Тони Старк поддерживает договор, а Стив Роджерс считает его нарушением свободы. Ситуация усугубляется действиями Гельмута Земо, который подставляет Зимнего Солдата и стравливает героев друг с другом, раскрывая правду об убийстве родителей Старка.",
        imagePlaceholder: "civil-war.jpg"
      },
      {
        year: "2016",
        title: "Доктор Стрэндж",
        description: "Блестящий, но высокомерный нейрохирург Стивен Стрэндж попадает в автокатастрофу и теряет возможность оперировать. В поисках исцеления он отправляется в Катманду, где встречает Древнюю и открывает для себя мир магии и мистических искусств. Стрэндж становится могущественным магом и защитником Земли от потусторонних угроз, используя артефакт Глаз Агамотто (содержащий Камень Времени), чтобы противостоять Кецилию и тёмному измерению Дормамму.",
        imagePlaceholder: "doctor-strange-1.jpg"
      },
      {
        year: "2017",
        title: "Стражи Галактики. Часть 2",
        description: "Стражи Галактики становятся известными наемниками. Они сталкиваются с расой Суверенов и спасаются благодаря таинственному Эго — отцу Питера Квилла. Эго оказывается могущественным Целестиалом, который хочет использовать силу Квилла для ассимиляции всей вселенной («Экспансии»). Стражам, включая нового члена команды Мантис и временно присоединившуюся Небулу, предстоит раскрыть истинные намерения Эго и остановить его.",
        imagePlaceholder: "guardians-2.jpg"
      },
      {
        year: "2017",
        title: "Человек-паук: Возвращение домой",
        description: "После событий «Противостояния» Питер Паркер возвращается к обычной жизни школьника в Квинсе, продолжая действовать как Человек-паук под присмотром Тони Старка. Он жаждет стать полноправным Мстителем, но сталкивается с новым опасным врагом — Стервятником (Эдриан Тумс), который использует инопланетные технологии для создания оружия. Питеру предстоит доказать, что он достоин быть героем, даже без высокотехнологичного костюма Старка.",
        imagePlaceholder: "spiderman-homecoming.jpg"
      },
      {
        year: "2017",
        title: "Тор: Рагнарёк",
        description: "Тор возвращается в Асгард и узнает, что Локи занял место Одина. Вместе они находят Одина, который умирает, освобождая их безжалостную сестру Хелу, богиню смерти. Хела уничтожает Мьёльнир и захватывает Асгард. Тор и Локи попадают на планету-свалку Сакаар, где Тор вынужден сражаться на гладиаторской арене с Халком. Объединившись с Халком, Локи и Валькирией, Тор возвращается, чтобы остановить Хелу, даже ценой разрушения Асгарда — Рагнарёка.",
        imagePlaceholder: "thor-3.jpg"
      },
      {
        year: "2018",
        title: "Чёрная Пантера",
        description: "После смерти отца Т'Чалла возвращается в технологически развитую и изолированную страну Ваканду, чтобы занять трон и стать Чёрной Пантерой. Ему бросает вызов Эрик Киллмонгер, сын изгнанного принца, который хочет использовать вибраниум Ваканды для вооружения людей африканского происхождения по всему миру и установления нового порядка. Т'Чалла должен вернуть себе трон и решить, стоит ли Ваканде и дальше скрываться от мира.",
        imagePlaceholder: "black-panther.jpg"
      },
      {
        year: "2018",
        title: "Мстители: Война бесконечности",
        description: "Безумный титан Танос начинает активный сбор всех шести Камней Бесконечности, чтобы с их помощью уничтожить половину жизни во вселенной и «восстановить баланс». Разделенные Мстители, Стражи Галактики, Доктор Стрэндж и другие герои должны объединить усилия на Земле и в космосе (на Титане, в Ваканде, на Знамогде), чтобы помешать Таносу осуществить его геноцидный план. Несмотря на их усилия, Танос собирает все Камни и совершает Щелчок.",
        imagePlaceholder: "avengers-infinity-war.jpg"
      },
      {
        year: "2018",
        title: "Человек-муравей и Оса",
        description: "Пока мир оправляется от действий Таноса (события фильма происходят до и во время «Войны бесконечности»), Скотт Лэнг находится под домашним арестом. Хэнк Пим и его дочь Хоуп ван Дайн (Оса) верят, что жена Пима, Джанет, жива в квантовом измерении. Они обращаются к Скотту за помощью, чтобы построить туннель в квантовый мир. Героям мешают как ФБР, так и таинственная Призрак, способная проходить сквозь стены.",
        imagePlaceholder: "ant-man-2.jpg"
      },
      {
        year: "2019",
        title: "Капитан Марвел",
        description: "Действие происходит в 1995 году. Верс, воин элитного отряда Крии «Звёздная сила», страдает от амнезии и ночных кошмаров. Во время миссии по спасению разведчика Крии она попадает на Землю и сталкивается с агентом Щ.И.Т. Ником Фьюри. Вместе они пытаются остановить Скруллов, меняющих облик, и раскрыть тайну прошлого Верс, которая оказывается Кэрол Дэнверс, пилотом ВВС США, получившей невероятные силы от Тессеракта.",
        imagePlaceholder: "captain-marvel.jpg"
      },
      {
        year: "2019",
        title: "Мстители: Финал",
        description: "Спустя пять лет после Щелчка Таноса мир погружен в траур. Оставшиеся Мстители обнаруживают способ путешествовать во времени через квантовое измерение благодаря Скотту Лэнгу. Они отправляются в прошлое в разные временные точки, чтобы собрать Камни Бесконечности до Таноса. Им удается вернуть всех стертых, но Танос из прошлого узнает об их плане и прибывает в настоящее для финальной битвы за судьбу вселенной.",
        imagePlaceholder: "avengers-endgame.jpg"
      },
      {
        year: "2019",
        title: "Человек-паук: Вдали от дома",
        description: "Питер Паркер тяжело переживает смерть Тони Старка и отправляется с классом на каникулы в Европу, надеясь отдохнуть от супергеройства. Однако Ник Фьюри вербует его для борьбы с Элементалами — монстрами из другого измерения. Питеру помогает новый герой Мистерио (Квентин Бек). Вскоре Паркер понимает, что Мистерио — иллюзионист и бывший сотрудник Старка, который использует дроны и обман для создания угрозы и получения контроля над технологиями Старка.",
        imagePlaceholder: "spiderman-far-from-home.jpg"
      }
    ]
  }
  // ... Добавить Фазы 4, 5, 6 с подробными описаниями ...
];

// Объединяем все события в один массив вне компонента
const allEvents = marvelHistoryData.flatMap(phaseData =>
    phaseData.events.map(event => ({ ...event, phase: phaseData.phase }))
);

// --- Компонент EventBlock --- 
interface EventBlockProps {
  event: HistoryEvent;
  index: number; 
}

// EventBlock теперь просто рендерит контент, без observer и state
const EventBlock: React.FC<EventBlockProps> = ({ event, index }) => {
  const layoutClass = index % 2 === 0 ? 'layout-text-left' : 'layout-text-right';

  return (
    // Добавляем data-index для поиска через querySelectorAll
    <div 
      className={`history-event-block ${layoutClass}`} 
      data-index={index}
    >
      <div className="event-content">
         <div className="event-text">
          <span className="event-year">{event.year}</span>
          <h3 className="event-title">{event.title}</h3>
          <p className="event-description">{event.description}</p>
        </div>
        {event.imagePlaceholder && (
          <div className="event-image-placeholder">
            <img
              src={`/images/history/${event.imagePlaceholder}`}
              alt={event.title}
              loading="lazy" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const placeholderText = e.currentTarget.parentElement?.querySelector('.error-placeholder');
                if (placeholderText instanceof HTMLElement) {
                  placeholderText.style.display = 'block';
                }
              }}
            />
            <p className="error-placeholder" style={{ display: 'none' }}>
              Изображение не загружено: {event.imagePlaceholder}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Основной компонент MarvelHistory --- 
const MarvelHistory: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [targetIndex, setTargetIndex] = useState<number>(0); 
  const [isButtonHidden, setIsButtonHidden] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Наблюдение за видимостью блоков для анимации
  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleIntersect = (entries: IntersectionObserverEntry[]) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
              } else {
                  // Можно добавить логику скрытия, если нужно
                  // entry.target.classList.remove('visible'); 
              }
          });
      };

      observerRef.current = new IntersectionObserver(handleIntersect, {
          root: null,
          rootMargin: '0px',
          threshold: 0.3 // Увеличиваем порог срабатывания до 30%
      });

      const blocks = container.querySelectorAll('.history-event-block');
      blocks.forEach(block => observerRef.current?.observe(block));

      // Очистка observer при размонтировании
      return () => {
          observerRef.current?.disconnect();
      };
  }, []); 

  // Блокировка/разблокировка скролла и управление кнопкой
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Показываем/скрываем кнопку
    setIsButtonHidden(allEvents.length <= 1 || targetIndex >= allEvents.length - 1);

    return () => {
      document.body.style.overflow = originalOverflow; 
      // Отключаем observer ЗДЕСЬ при размонтировании компонента
      observerRef.current?.disconnect(); 
    };
  }, [targetIndex]); 

  // --- Логика прокрутки и обновления достижения --- 
  const handleScrollToNext = async () => { // Делаем асинхронной
    const nextIndex = targetIndex + 1;
    const container = containerRef.current;
    
    if (nextIndex < allEvents.length && container) {
        const nextElement = container.querySelector(`.history-event-block[data-index="${nextIndex}"]`) as HTMLElement;
        
        if (nextElement) {
            nextElement.classList.add('visible');
            nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTargetIndex(nextIndex); 
        } else {
            console.warn(`Element with index ${nextIndex} not found.`);
        }
    } 
    
    // Если это последний элемент
    if (nextIndex >= allEvents.length - 1) {
        requestAnimationFrame(() => setIsButtonHidden(true));
        
        // Обновляем достижение "Летописец"
        const userId = localStorage.getItem('userId');
        if (userId) {
            const numericUserId = parseInt(userId);
            const achievementService = AchievementService.getInstance();
            await achievementService.updateAchievementProgress(numericUserId, 'explore-history', 1);
            console.log(`History explored by user: ${numericUserId}`);
        }
    }
  };

  // Функция для проверки и обновления достижения
  const checkHistoryVoyagerAchievement = async (index: number) => {
      if (index === allEvents.length - 1) { // Проверяем, достигнут ли конец
          const userIdString = localStorage.getItem('userId');
          if (userIdString) {
              try {
                  const userId = parseInt(userIdString);
                  const achievementService = AchievementService.getInstance();
                  await achievementService.updateAchievementProgress(userId, 'history-voyager', 1);
                  console.log('Checked history-voyager achievement (reached end)');
              } catch (err) {
                  console.error("Error updating history-voyager achievement:", err);
              }
          }
      }
  };

  useEffect(() => {
    eventRefs.current = eventRefs.current.slice(0, allEvents.length);
    const container = containerRef.current;
    if (container) {
        container.addEventListener('scroll', handleScrollToNext);
        return () => container.removeEventListener('scroll', handleScrollToNext);
    }
  }, []);
  
  // ---> Добавляем вызов проверки достижения при изменении currentIndex <--- 
  useEffect(() => {
    checkHistoryVoyagerAchievement(currentIndex);
  }, [currentIndex]);

  return (
    <div ref={containerRef} className="marvel-history-container">
       {/* Добавляем DIVы для анимированных блобов */}
       <div className="background-blob blob1"></div>
       <div className="background-blob blob2"></div>
       <div className="background-blob blob3"></div>
       
      <h1>Хронология Киновселенной Marvel</h1>
      <div className="events-timeline">
        {marvelHistoryData.map((phaseData) => (
           <React.Fragment key={phaseData.phase}>
              <h2 className="phase-title">{phaseData.phase}</h2>
              {allEvents
                .filter(event => event.phase === phaseData.phase)
                .map((event, localIndexWithinPhase) => {
                   const globalIndex = allEvents.findIndex(e => e.title === event.title && e.year === event.year); 
                   return (
                    <EventBlock
                        key={`${event.phase}-${event.title}-${globalIndex}`}
                        event={event}
                        index={globalIndex}
                    />
                   );
                })}
            </React.Fragment>
        ))}
      </div>
       <button 
          className={`scroll-next-button ${isButtonHidden ? 'hidden-button' : ''}`}
          onClick={handleScrollToNext}
          aria-hidden={isButtonHidden}
          disabled={isButtonHidden} 
        >
           Показать следующее событие <span className="arrow">&darr;</span>
       </button>
    </div>
  );
};

export default MarvelHistory; 