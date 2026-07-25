import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import BookingWidget from './components/BookingWidget';
import Footer from './components/Footer';
import Home from './components/Home';
import DevPage from './components/DevPage';

export default function App() {
  const [page, setPage] = useState<'home' | 'booking' | 'dev'>('home');

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F6F8F6] text-slate-800 relative overflow-x-hidden selection:bg-emerald-500/30">
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Support Side Tab */}
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
          <a href="#contact" className="bg-emerald-800 text-white px-4 py-2 rounded-t-xl font-bold uppercase text-xs tracking-widest shadow-lg -rotate-90 origin-right translate-x-full hover:translate-x-[calc(100%-8px)] transition-transform border-t border-l border-r border-emerald-700">
            Support
          </a>
        </div>
        
        <Header onNavigate={setPage} currentPage={page} />
        
        <main className="flex-grow flex flex-col items-center w-full">
          <AnimatePresence mode="wait">
            {page === 'dev' ? (
              <motion.div
                key="dev"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-grow flex flex-col"
              >
                <DevPage />
              </motion.div>
            ) : page === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-grow flex flex-col"
              >
                <Home onBookNow={() => setPage('booking')} />
              </motion.div>
            ) : (
              <motion.div
                key="booking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-grow flex flex-col"
              >
                <BookingWidget />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
