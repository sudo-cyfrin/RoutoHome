import { useState, useEffect } from 'react';
import { LOGO_URL as DEFAULT_LOGO } from '../constants';

export function useLogo() {
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo');
    const savedLocked = localStorage.getItem('app_logo_locked');
    
    if (savedLogo) {
      setLogo(savedLogo);
    }
    if (savedLocked === 'true') {
      setIsLocked(true);
    }
  }, []);

  const updateLogo = (newLogo: string) => {
    if (isLocked) return;
    setLogo(newLogo);
    localStorage.setItem('app_logo', newLogo);
  };

  const lockLogo = () => {
    setIsLocked(true);
    localStorage.setItem('app_logo_locked', 'true');
  };

  const resetLogo = () => {
    setLogo(DEFAULT_LOGO);
    setIsLocked(false);
    localStorage.removeItem('app_logo');
    localStorage.removeItem('app_logo_locked');
  };

  return { logo, updateLogo, lockLogo, isLocked, resetLogo };
}
