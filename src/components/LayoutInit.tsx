import { useEffect } from 'react';
import { initRightPanel } from './RightPanel';
import { layoutActions } from '@/stores/layout';

export function LayoutInit() {
  useEffect(() => {
    initRightPanel();
    
    // Mobile-specific initialization
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      layoutActions.setMobile(isMobile);
      if (isMobile) {
        layoutActions.setRightSize('Closed');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return null;
}