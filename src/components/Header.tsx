import { Compass, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useRef } from 'react';
import { logoBase64 } from '../assets/logoBase64';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'home';
  const onNavigate = (page) => navigate(page === 'home' ? '/' : `/${page}`);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-50 px-4 lg:px-12 py-2 flex justify-between items-center bg-emerald-100/60 backdrop-blur-md border-b border-emerald-900/10">
      
      {/* Mobile Layout */}
      <div className="md:hidden flex items-center justify-between w-full h-[40px] relative z-10">
        <div className="flex items-center gap-3">
          <div className="cursor-pointer z-10" onClick={handleLogoClick}>
            <img src={logoBase64} alt="xyz Travels Logo" className="h-10 w-auto object-contain rounded-xl" />
          </div>
          <div className="cursor-pointer whitespace-nowrap z-10" onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}>
            <h1 className="text-[24px] font-bold tracking-tight text-emerald-950 m-0">
              xyz <span className="italic text-emerald-700">Travels</span>
            </h1>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(!isMobileMenuOpen); }} className="p-2 text-emerald-900 focus:outline-none pointer-events-auto z-50 relative overflow-hidden flex items-center justify-center w-10 h-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isMobileMenuOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Desktop Layout */}
      <div 
        className="hidden md:flex items-center gap-3 cursor-pointer group z-10"
        onClick={handleLogoClick}
      >
        <img src={logoBase64} alt="xyz Travels Logo" className="h-10 w-auto object-contain rounded-xl" />
        <h1 className="text-3xl font-bold tracking-tight text-emerald-950 whitespace-nowrap m-0" onClick={(e) => { e.stopPropagation(); onNavigate('home'); }}>
          xyz <span className="italic text-emerald-700">Travels</span>
        </h1>
      </div>

      <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest z-10">
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
        <button 
          onClick={() => onNavigate('trails')}
          className={`${currentPage === 'trails' ? 'text-emerald-800' : 'hover:text-emerald-950'} transition-colors`}
        >
          Scenic Trails
        </button>
        <button 
          onClick={() => onNavigate('support')}
          className={`${currentPage === 'support' ? 'text-emerald-800' : 'hover:text-emerald-950'} transition-colors`}
        >
          Support
        </button>

      </nav>
      
      <div className="hidden md:block w-[100px]"></div>

    
      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-900/10 flex flex-col items-center py-6 gap-6 md:hidden z-40"
        >
          <button 
            onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
            className={`${currentPage === 'home' ? 'text-emerald-800' : 'text-slate-600'} text-sm font-bold uppercase tracking-widest`}
          >
            Home
          </button>
          <button 
            onClick={() => { onNavigate('booking'); setIsMobileMenuOpen(false); }}
            className={`${currentPage === 'booking' ? 'text-emerald-800' : 'text-slate-600'} text-sm font-bold uppercase tracking-widest`}
          >
            Fleet & Booking
          </button>
          <button 
            onClick={() => { onNavigate('trails'); setIsMobileMenuOpen(false); }}
            className={`${currentPage === 'trails' ? 'text-emerald-800' : 'text-slate-600'} text-sm font-bold uppercase tracking-widest`}
          >
            Scenic Trails
          </button>
          <button 
            onClick={() => { onNavigate('support'); setIsMobileMenuOpen(false); }}
            className={`${currentPage === 'support' ? 'text-emerald-800' : 'text-slate-600'} text-sm font-bold uppercase tracking-widest`}
          >
            Support
          </button>

        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
