import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, getBestUserResult } from '../database/db';
import AchievementService from '../services/achievements';
import '../styles/UserProfile.css'; // Создадим этот файл позже

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  bio: string;
}

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [editData, setEditData] = useState({ nickname: '', avatar: '', bio: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bestScores, setBestScores] = useState<Record<string, any | null>>({
    quizEasy: null,
    quizMedium: null,
    quizHard: null,
    minigame: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }
      try {
        const numericUserId = parseInt(userId);
        const profileData = await getUserProfile(numericUserId);

        if (profileData) {
          setProfile(profileData);
          setEditData({
            nickname: profileData.nickname || '',
            avatar: profileData.avatar || '',
            bio: profileData.bio || ''
          });
          setPreviewUrl(profileData.avatar || null);

          const easyResult = await getBestUserResult(numericUserId, 'easy');
          const mediumResult = await getBestUserResult(numericUserId, 'medium');
          const hardResult = await getBestUserResult(numericUserId, 'hard');
          const minigameResult = await getBestUserResult(numericUserId, 'minigame');

          setBestScores({
            quizEasy: easyResult,
            quizMedium: mediumResult,
            quizHard: hardResult,
            minigame: minigameResult,
          });

        } else {
          setError('Не удалось загрузить профиль.');
        }
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        setError('Произошла ошибка при загрузке профиля.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    if (name === 'avatar') {
        setSelectedFile(null);
        setPreviewUrl(value || null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditData(prev => ({ ...prev, avatar: '' }));
    } else {
        setSelectedFile(null);
        setPreviewUrl(editData.avatar || (profile?.avatar || null)); 
    }
  };
  
  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };
  
  const clearFileSelection = () => {
     setSelectedFile(null);
     setPreviewUrl(profile?.avatar || null);
     if(fileInputRef.current) {
         fileInputRef.current.value = "";
     }
   };

  const handleSaveChanges = async () => {
    if (!profile) return;
    setIsLoading(true);
    setError(null);

    let finalAvatarData = editData.avatar;

    if (selectedFile) {
      try {
        finalAvatarData = await readFileAsDataURL(selectedFile);
      } catch (err) {
        console.error('Ошибка чтения файла аватара:', err);
        setError('Не удалось обработать файл аватара.');
        setIsLoading(false);
        return;
      }
    }

    const dataToSave = {
      nickname: editData.nickname,
      avatar: finalAvatarData,
      bio: editData.bio
    };

    try {
      const success = await updateUserProfile(profile.id, dataToSave);
      if (success) {
        setProfile(prev => prev ? { ...prev, ...dataToSave } : null);
        setIsEditing(false);
        setSelectedFile(null);
        alert('Профиль успешно обновлен!');

        // Проверяем и обновляем достижение "Заполненный профиль"
        if (dataToSave.nickname && dataToSave.avatar && dataToSave.bio) {
           const achievementService = AchievementService.getInstance();
           await achievementService.updateAchievementProgress(profile.id, 'profile-complete', 1);
           console.log(`Profile complete achievement updated for userId: ${profile.id}`);
        }

      } else {
        setError('Не удалось обновить профиль.');
      }
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
      setError('Произошла ошибка при обновлении профиля.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const readFileAsDataURL = (file: File): Promise<string> => {
       return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result as string);
         reader.onerror = (error) => reject(error);
         reader.readAsDataURL(file);
       });
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
    window.location.reload();
  };

  if (isLoading) {
    return <div className="profile-container loading">Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="profile-container error">Ошибка: {error}</div>;
  }

  if (!profile) {
    return <div className="profile-container">Не удалось найти профиль.</div>;
  }

  return (
    <div className="profile-container">
      <h2>Профиль пользователя</h2>
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={isEditing ? (previewUrl || '/default-avatar.png') : (profile.avatar || '/default-avatar.png')}
            alt="Аватар"
            className="profile-avatar"
            onError={(e) => { 
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/default-avatar.png'; 
            }}
          />
          <div className="profile-info">
            <h3>{profile.nickname || profile.username}</h3>
            <p>@{profile.username}</p>
            <p>{profile.email}</p>
          </div>
          {!isEditing && <button onClick={() => setIsEditing(true)} className="edit-button">Редактировать</button>}
        </div>

        {isEditing ? (
          <div className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="nickname">Псевдоним:</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={editData.nickname}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group avatar-group">
              <label>Аватар:</label>
              <div className="avatar-preview-container">
                <img 
                  src={previewUrl || '/default-avatar.png'}
                  alt="Предпросмотр аватара"
                  className="avatar-preview"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/default-avatar.png'; }}
                />
              </div>
              <input
                type="file"
                id="avatar-file"
                name="avatar-file"
                accept=".png, .jpg, .jpeg, .gif, .svg, .webp"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
               <div className="avatar-buttons">
                <button type="button" onClick={triggerFileInput} className="upload-button">
                  Выбрать файл
                </button>
                {selectedFile && (
                    <button type="button" onClick={clearFileSelection} className="clear-file-button">
                     Удалить файл
                    </button>
                )}
              </div>
              <label htmlFor="avatar" style={{ marginTop: '1rem' }}>Или вставьте URL:</label>
              <input
                type="text"
                id="avatar"
                name="avatar"
                placeholder="https://example.com/avatar.png"
                value={editData.avatar}
                onChange={handleInputChange}
                disabled={!!selectedFile}
              />
            </div>
            <div className="form-group bio-group">
              <label htmlFor="bio">О себе:</label>
              <textarea
                id="bio"
                name="bio"
                value={editData.bio}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            <div className="edit-actions">
              <button onClick={handleSaveChanges} disabled={isLoading} className="save-button">
                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <button onClick={() => { setIsEditing(false); clearFileSelection(); }} className="cancel-button">Отмена</button>
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <div className="profile-bio">
              <h4>О себе:</h4>
              <p>{profile.bio || 'Пользователь пока ничего не рассказал о себе.'}</p>
            </div>
          </div>
        )}

        {/* --- Добавленный блок: Лучшие результаты (обернут во фрагмент) --- */}
        {!isEditing && (
          <>
            {/* Добавляем разделительную линию */}
            <hr className="section-divider" />
            <div className="profile-best-scores">
                <h3>Лучшие результаты</h3>
                <div className="scores-grid">
                    <div className="score-item quiz-easy">
                        <h4>Квиз (Легко)</h4>
                        {bestScores.quizEasy ? (
                            <p>{bestScores.quizEasy.score} / {bestScores.quizEasy.totalQuestions}</p>
                        ) : (
                            <p>Нет данных</p>
                        )}
                    </div>
                    <div className="score-item quiz-medium">
                        <h4>Квиз (Средне)</h4>
                        {bestScores.quizMedium ? (
                            <p>{bestScores.quizMedium.score} / {bestScores.quizMedium.totalQuestions}</p>
                        ) : (
                            <p>Нет данных</p>
                        )}
                    </div>
                    <div className="score-item quiz-hard">
                        <h4>Квиз (Сложно)</h4>
                        {bestScores.quizHard ? (
                            <p>{bestScores.quizHard.score} / {bestScores.quizHard.totalQuestions}</p>
                        ) : (
                            <p>Нет данных</p>
                        )}
                    </div>
                    <div className="score-item minigame">
                        <h4>Мини-игра</h4>
                        {bestScores.minigame ? (
                            <p>{bestScores.minigame.score} / {bestScores.minigame.totalQuestions}</p>
                        ) : (
                            <p>Нет данных</p>
                        )}
                    </div>
                </div>
            </div>
          </>
        )}

      </div>

      <button onClick={handleLogout} className="logout-button">
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default UserProfile; 