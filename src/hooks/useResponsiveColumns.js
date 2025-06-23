import { useState, useEffect } from 'react';

export default function useResponsiveColumns() {
  const [columns, setColumns] = useState(5);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      setIsMobile(w <= 768);
      if (w < 640) setColumns(2);
      else if (w < 768) setColumns(3);
      else if (w < 1024) setColumns(4);
      else setColumns(5);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { columns, isMobile };
}