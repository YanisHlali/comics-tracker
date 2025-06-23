import useMobileBreakpoint from '@/hooks/useMobileBreakpoint';

export default function Layout({ children }) {
  const isMobile = useMobileBreakpoint(640);
  return (
    <div className={`w-full h-full m-0 ${isMobile ? 'px-4' : 'px-8'}`}>
      {children}
    </div>
  );
}
