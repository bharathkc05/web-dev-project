import React, { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

import logo from '../../../assets/logo.png';

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

export const AuthVisualPanel = ({ isTyping, passwordLength, showPassword }) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const getRandomBlinkInterval = () => Math.random() * 4000 + 3000;
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, getRandomBlinkInterval());
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (passwordLength > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };
      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
    }
  }, [passwordLength, showPassword]);

  const calculatePosition = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  return (
    <div className="relative hidden lg:flex flex-col justify-between bg-[#BAA38C] p-12 text-white">
      <div className="relative z-20">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="size-10 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg">
            <img src={logo} alt="Velvet Bites Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
          </div>
          <span>Velvet Bites</span>
        </div>
      </div>

      <div className="relative z-20 flex-1 flex items-center justify-center w-full min-h-[300px]">
        {/* Cartoon Characters */}
        <div className="relative scale-[0.65] sm:scale-75 origin-center" style={{ width: '550px', height: '400px' }}>
          {/* Purple tall rectangle character */}
          <div 
            ref={purpleRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '70px',
              width: '180px',
              height: (isTyping || (passwordLength > 0 && !showPassword)) ? '440px' : '400px',
              backgroundColor: '#6C3FF5', 
              borderRadius: '10px 10px 0 0',
              zIndex: 1,
              transform: (passwordLength > 0 && showPassword)
                ? `skewX(0deg)`
                : (isTyping || (passwordLength > 0 && !showPassword))
                  ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` 
                  : `skewX(${purplePos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            {/* Eyes */}
            <div 
              className="absolute flex gap-8 transition-all duration-700 ease-in-out"
              style={{
                left: (passwordLength > 0 && showPassword) ? `20px` : isLookingAtEachOther ? `55px` : `${45 + purplePos.faceX}px`,
                top: (passwordLength > 0 && showPassword) ? `35px` : isLookingAtEachOther ? `65px` : `${40 + purplePos.faceY}px`,
              }}
            >
              <EyeBall 
                size={18} 
                pupilSize={7} 
                maxDistance={5} 
                eyeColor="white" 
                pupilColor="#2D2D2D" 
                isBlinking={isPurpleBlinking}
                forceLookX={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                forceLookY={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
              />
              <EyeBall 
                size={18} 
                pupilSize={7} 
                maxDistance={5} 
                eyeColor="white" 
                pupilColor="#2D2D2D" 
                isBlinking={isPurpleBlinking}
                forceLookX={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
                forceLookY={(passwordLength > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
              />
            </div>
          </div>

          {/* Black tall rectangle character */}
          <div 
            ref={blackRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '240px',
              width: '120px',
              height: '310px',
              backgroundColor: '#2D2D2D',
              borderRadius: '8px 8px 0 0',
              zIndex: 2,
              transform: (passwordLength > 0 && showPassword)
                ? `skewX(0deg)`
                : isLookingAtEachOther
                  ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                  : (isTyping || (passwordLength > 0 && !showPassword))
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                    : `skewX(${blackPos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            {/* Eyes */}
            <div 
              className="absolute flex gap-6 transition-all duration-700 ease-in-out"
              style={{
                left: (passwordLength > 0 && showPassword) ? `10px` : isLookingAtEachOther ? `32px` : `${26 + blackPos.faceX}px`,
                top: (passwordLength > 0 && showPassword) ? `28px` : isLookingAtEachOther ? `12px` : `${32 + blackPos.faceY}px`,
              }}
            >
              <EyeBall 
                size={16} 
                pupilSize={6} 
                maxDistance={4} 
                eyeColor="white" 
                pupilColor="#2D2D2D" 
                isBlinking={isBlackBlinking}
                forceLookX={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
              />
              <EyeBall 
                size={16} 
                pupilSize={6} 
                maxDistance={4} 
                eyeColor="white" 
                pupilColor="#2D2D2D" 
                isBlinking={isBlackBlinking}
                forceLookX={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined}
                forceLookY={(passwordLength > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined}
              />
            </div>
          </div>

          {/* Orange semi-circle character */}
          <div 
            ref={orangeRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '0px',
              width: '240px',
              height: '200px',
              zIndex: 3,
              backgroundColor: '#FF9B6B',
              borderRadius: '120px 120px 0 0',
              transform: (passwordLength > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            {/* Eyes - just pupils */}
            <div 
              className="absolute flex gap-8 transition-all duration-200 ease-out"
              style={{
                left: (passwordLength > 0 && showPassword) ? `50px` : `${82 + (orangePos.faceX || 0)}px`,
                top: (passwordLength > 0 && showPassword) ? `85px` : `${90 + (orangePos.faceY || 0)}px`,
              }}
            >
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
            </div>
          </div>

          {/* Yellow tall rectangle character */}
          <div 
            ref={yellowRef}
            className="absolute bottom-0 transition-all duration-700 ease-in-out"
            style={{
              left: '310px',
              width: '140px',
              height: '230px',
              backgroundColor: '#E8D754',
              borderRadius: '70px 70px 0 0',
              zIndex: 4,
              transform: (passwordLength > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
              transformOrigin: 'bottom center',
            }}
          >
            {/* Eyes - just pupils */}
            <div 
              className="absolute flex gap-6 transition-all duration-200 ease-out"
              style={{
                left: (passwordLength > 0 && showPassword) ? `20px` : `${52 + (yellowPos.faceX || 0)}px`,
                top: (passwordLength > 0 && showPassword) ? `35px` : `${40 + (yellowPos.faceY || 0)}px`,
              }}
            >
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
              <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(passwordLength > 0 && showPassword) ? -5 : undefined} forceLookY={(passwordLength > 0 && showPassword) ? -4 : undefined} />
            </div>
            {/* Mouth */}
            <div 
              className="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
              style={{
                left: (passwordLength > 0 && showPassword) ? `10px` : `${40 + (yellowPos.faceX || 0)}px`,
                top: (passwordLength > 0 && showPassword) ? `88px` : `${88 + (yellowPos.faceY || 0)}px`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-20 flex items-center gap-8 text-sm text-white/70">
        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" className="hover:text-white transition-colors">Contact</a>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 bg-white/[0.03] bg-[size:20px_20px]" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)'}} />
      <div className="absolute top-1/4 right-1/4 size-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 size-96 bg-black/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
