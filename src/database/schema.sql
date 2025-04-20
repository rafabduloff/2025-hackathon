-- Таблица достижений
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL,
    points INTEGER NOT NULL,
    is_secret BOOLEAN NOT NULL DEFAULT 0,
    max_progress INTEGER NOT NULL
);

-- Таблица прогресса достижений пользователей
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id INTEGER NOT NULL,
    achievement_id TEXT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    is_unlocked BOOLEAN NOT NULL DEFAULT 0,
    unlock_date DATETIME,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id); 