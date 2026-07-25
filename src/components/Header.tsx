import { Compass } from 'lucide-react';
import { useRef } from 'react';

export default function Header({ onNavigate, currentPage }: { onNavigate: (page: 'home' | 'booking' | 'dev') => void, currentPage: string }) {
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (!clickTimer.current) {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
        clickTimer.current = null;
      }, 6000);
    }
    
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      onNavigate('dev');
    } else {
      if (clickCount.current === 1) {
        onNavigate('home');
      }
    }
  };
  return (
    <header className="sticky top-0 z-50 px-4 lg:px-12 py-3 lg:py-4 flex justify-between items-center bg-white/90 backdrop-blur-md border-b border-emerald-900/10 relative">
      
      {/* Mobile Layout */}
      <div className="md:hidden flex items-center justify-between w-full h-[48px] relative">
        <div 
          className="cursor-pointer z-10"
          onClick={handleLogoClick}
        >
          <img src="/logo.png" alt="Yazdani Travels Logo" className="h-12 w-auto object-contain rounded-xl" />
        </div>
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer whitespace-nowrap"
          onClick={() => onNavigate('home')}
        >
          <h1 className="text-[28px] font-bold tracking-tight text-emerald-950 m-0">
            Yazdani <span className="italic text-emerald-700">Travels</span>
          </h1>
        </div>
      </div>

      {/* Desktop Layout */}
      <div 
        className="hidden md:flex items-center gap-3 cursor-pointer group"
        onClick={handleLogoClick}
      >
        <img src="/logo.png" alt="Yazdani Travels Logo" className="h-14 w-auto object-contain rounded-xl" />
      </div>

      <div 
        className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        onClick={() => onNavigate('home')}
      >
        <h1 className="text-4xl font-bold tracking-tight text-emerald-950 whitespace-nowrap m-0">Yazdani <span className="italic text-emerald-700">Travels</span></h1>
      </div>

      <nav className="hidden md:flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
        <button 
          onClick={() => onNavigate('home')}
          className={`${currentPage === 'home' ? 'text-emerald-800' : 'hover:text-emerald-950'} transition-colors`}
        >
          Home
        </button>
        <button 
          onClick={() => onNavigate('booking')}
          className={`${currentPage === 'booking' ? 'text-emerald-800' : 'hover:text-emerald-950'} transition-colors`}
        >
          Fleet & Booking
        </button>
      </nav>
    </header>
  );
}
