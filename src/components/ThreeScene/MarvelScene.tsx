import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import './styles/MarvelScene.css';

interface CharacterProps {
  position: [number, number, number];
  model: string;
  name: string;
  onClick: () => void;
  isActive: boolean;
}

const Character: React.FC<CharacterProps> = ({ position, model, name, onClick, isActive }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(model);

  useEffect(() => {
    if (meshRef.current) {
      // Сбрасываем все свойства модели
      meshRef.current.scale.set(1, 1, 1);
      meshRef.current.position.set(0, 0, 0);
      meshRef.current.rotation.set(0, 0, 0);

      // Создаем ограничивающий параллелепипед для всей сцены
      const box = new THREE.Box3().setFromObject(meshRef.current);
      
      // Находим центр ограничивающего параллелепипеда
      const center = box.getCenter(new THREE.Vector3());
      
      // Находим размеры модели
      const size = box.getSize(new THREE.Vector3());
      
      // Находим максимальный размер для масштабирования
      const maxSize = Math.max(size.x, size.y, size.z);
      
      // Нормализуем размер модели
      const scale = 2 / maxSize;
      
      // Применяем масштаб
      meshRef.current.scale.set(scale, scale, scale);

      // Создаем новый ограничивающий параллелепипед после масштабирования
      const scaledBox = new THREE.Box3().setFromObject(meshRef.current);
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledSize = scaledBox.getSize(new THREE.Vector3());

      // Специфические настройки для каждой модели
      switch (name) {
        case 'Iron Man':
          // Железный человек - стандартное центрирование
          meshRef.current.position.x = -scaledCenter.x;
          meshRef.current.position.z = -scaledCenter.z;
          meshRef.current.position.y = -scaledBox.min.y - 0.3;
          break;

        case 'Thor':
          // Тор - немного приподнят и смещен
          meshRef.current.position.x = -scaledCenter.x + 0.3;
          meshRef.current.position.z = -scaledCenter.z;
          meshRef.current.position.y = -scaledBox.min.y - 0.2;
          break;

        case 'Captain America':
          // Капитан Америка - специальная обработка
          meshRef.current.position.x = -scaledCenter.x;
          meshRef.current.position.z = -scaledCenter.z;
          // Для Капитана Америки используем более точное позиционирование
          const modelScene = scene.clone();
          modelScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const geometry = child.geometry;
              geometry.computeBoundingBox();
              const box = geometry.boundingBox!;
              const center = new THREE.Vector3();
              box.getCenter(center);
              geometry.translate(-center.x, -center.y, -center.z);
            }
          });
          meshRef.current.position.y = -scaledBox.min.y - 0.5;
          break;
      }

      // Обновляем матрицу преобразования
      meshRef.current.updateMatrix();
      meshRef.current.updateMatrixWorld(true);
    }
  }, [scene, model, name]);

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
        <group ref={meshRef} onClick={onClick}>
          <primitive object={scene.clone()} />
        </group>
      </Float>
      <Text
        position={[0, -2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

const Scene: React.FC<{ selectedCharacter: number; onCharacterSelect: (index: number) => void }> = ({ 
  selectedCharacter, 
  onCharacterSelect 
}) => {
  const { camera } = useThree();

  const characters = [
    {
      name: 'Iron Man',
      model: 'https://ucarecdn.com/1b8b4216-700d-4607-8177-a583b985676b.glb',
      position: [0, 0, 0] as [number, number, number],
    },
    {
      name: 'Thor',
      model: '/models/thor_textured_no_rig.glb',
      position: [0, 0, 0] as [number, number, number],
    },
    {
      name: 'Captain America',
      model: '/models/captain_america.glb',
      position: [0, 0, 0] as [number, number, number],
    }
  ];

  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [selectedCharacter, camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="city" />
      
      <Suspense fallback={
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Загрузка...
        </Text>
      }>
        <Character
          position={characters[selectedCharacter].position}
          model={characters[selectedCharacter].model}
          name={characters[selectedCharacter].name}
          onClick={() => onCharacterSelect((selectedCharacter + 1) % characters.length)}
          isActive={true}
        />
      </Suspense>

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>

      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        target={[0, 0, 0]}
      />
    </>
  );
};

const MarvelScene: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const navigate = useNavigate();

  const characters = [
    {
      id: 'iron-man',
      name: 'Iron Man',
      description: 'Гений, миллиардер, плейбой, филантроп. Тони Старк - создатель брони Железного человека и один из основателей Мстителей.'
    },
    {
      id: 'thor',
      name: 'Thor',
      description: 'Бог грома, принц Асгарда. Тор обладает невероятной силой и контролирует молнии с помощью своего легендарного молота Мьёльнира.'
    },
    {
      id: 'captain-america',
      name: 'Captain America',
      description: 'Первый мститель, символ надежды и свободы. Стив Роджерс - суперсолдат, который сражается за идеалы справедливости и чести.'
    }
  ];

  const handlePrev = () => {
    setSelectedCharacter((prev) => (prev - 1 + characters.length) % characters.length);
  };

  const handleNext = () => {
    setSelectedCharacter((prev) => (prev + 1) % characters.length);
  };

  return (
    <div className="marvel-scene">
      <div className="scene-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Scene 
            selectedCharacter={selectedCharacter} 
            onCharacterSelect={setSelectedCharacter} 
          />
        </Canvas>
      </div>

      <div className="character-description">
        <h2>{characters[selectedCharacter].name}</h2>
        <p>{characters[selectedCharacter].description}</p>
        <button 
          className="more-details-button"
          onClick={() => navigate(`/characters/${characters[selectedCharacter].id}`)}
        >
          Узнать больше
        </button>
      </div>

      <div className="slider-controls">
        <button onClick={handlePrev} className="slider-button">
          ←
        </button>
        <div className="slider-dots">
          {characters.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === selectedCharacter ? 'active' : ''}`}
              onClick={() => setSelectedCharacter(index)}
            />
          ))}
        </div>
        <button onClick={handleNext} className="slider-button">
          →
        </button>
      </div>
    </div>
  );
};

export default MarvelScene; 
