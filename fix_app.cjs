const fs = require('fs');

let appCode = `import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BookingWidget from './components/BookingWidget';
import Footer from './components/Footer';
import Home from './components/Home';
import DevPage from './components/DevPage';
import Support from './components/Support';
import Trails from './components/Trails';
import DevChat from './components/DevChat';

function AnimatedRoutes() {
  const location = useLocation();
  const isDev = location.pathname === '/dev';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F6F8F6] text-slate-800 relative overflow-x-clip selection:bg-emerald-500/30">
      <div className="relative z-10 flex flex-col min-h-screen">
        {!isDev && <Header />}
        {isDev && <DevChat />}
        <main className="flex-grow flex flex-col items-center w-full">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex-grow flex flex-col">
                  <Home />
                </motion.div>
              } />
              <Route path="/booking" element={
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex-grow flex flex-col">
                  <BookingWidget />
                </motion.div>
              } />
              <Route path="/trails" element={
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex-grow flex flex-col">
                  <Trails />
                </motion.div>
              } />
              <Route path="/support" element={
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex-grow flex flex-col">
                  <Support />
                </motion.div>
              } />
              <Route path="/dev" element={
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="w-full flex-grow flex flex-col">
                  <DevPage />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
`;
fs.writeFileSync('src/App.tsx', appCode);
console.log("Updated App.tsx");
