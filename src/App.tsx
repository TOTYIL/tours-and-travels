import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Header from './components/Header';
import BookingWidget from './components/BookingWidget';
import Footer from './components/Footer';
import Home from './components/Home';
import DevPage from './components/DevPage';
import Support from './components/Support';
import Trails from './components/Trails';
import DevChat from './components/DevChat';


export default function App() {
  const [page, setPage] = useState<'home' | 'booking' | 'trails' | 'dev' | 'support'>('home');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F6F8F6] text-slate-800 relative overflow-x-clip selection:bg-emerald-500/30">
      
      <div className="relative z-10 flex flex-col min-h-screen">

        
        {page !== 'dev' && <Header onNavigate={setPage} currentPage={page} />}
        {page === 'dev' && <DevChat />}
        
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
                <DevPage onNavigate={setPage} />
              </motion.div>
            ) : page === 'trails' ? (
              <motion.div
                key="trails"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-grow flex flex-col"
              >
                <Trails />
              </motion.div>
            ) : page === 'support' ? (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex-grow flex flex-col"
              >
                <Support onBack={() => setPage('home')} />
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
