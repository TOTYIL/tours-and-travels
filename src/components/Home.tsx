import { useState, useEffect } from 'react';
import { ArrowRight, Mountain, ShieldCheck, Map, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { getSlideshow } from '../lib/data';
import { heroBgBase64 } from '../assets/heroBgBase64';

export default function Home({ onBookNow }: { onBookNow: () => void }) {
  const [slideshow, setSlideshow] = useState<string[]>([]);
  useEffect(() => {
    setSlideshow(getSlideshow());
  }, []);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => slideshow.length ? (prev + 1) % slideshow.length : 0);
    }, 4000);
    return () => clearInterval(timer);
  }, [slideshow.length]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full relative z-10 flex flex-col items-center">
      {/* Hero Background */}
      <div className="absolute top-0 left-0 right-0 h-[650px] md:h-[700px] z-0 pointer-events-none select-none">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-100" style={{ backgroundImage: `url(${heroBgBase64})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F6F8F6]/40 to-[#F6F8F6]"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-emerald-950 tracking-tight mb-5">
            Corbett's Premier <span className="italic font-serif text-white">Bike Rental</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-light mb-8 leading-relaxed">
            Experience the wild beauty of Jim Corbett National Park and Nainital on two wheels. We provide top-tier, well-maintained motorcycles and scooters for your Himalayan adventure.
          </p>
          <button 
            onClick={onBookNow}
            className="inline-flex items-center justify-center gap-2 bg-emerald-800 text-white px-8 py-3.5 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/20"
          >
            Book Your Ride <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-emerald-900/5 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mb-5">
              <Mountain className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-3">All-Terrain Fleet</h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed">From rugged Royal Enfields for mountain passes to nimble scooters for local exploration.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-emerald-900/5 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mb-5">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-3">Verified & Insured</h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed">Every rental includes comprehensive insurance, ISI-certified helmets, and 24/7 roadside assistance.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-emerald-900/5 flex flex-col items-center text-center transition-transform hover:-translate-y-1 duration-300">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mb-5">
              <Map className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-emerald-950 mb-3">Local Expertise</h3>
            <p className="text-slate-500 text-sm font-light leading-relaxed">Get personalized itineraries, hidden trail maps, and safari booking assistance from our local team.</p>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="w-full max-w-7xl mx-auto rounded-[32px] bg-emerald-950 border border-emerald-900 py-16 mb-20 px-6 lg:px-12 text-white relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/3">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Our Happy <span className="italic font-serif text-emerald-400 font-normal">Riders</span></h2>
            <p className="text-emerald-100/80 font-light mb-8 leading-relaxed text-sm">
              Join thousands of travelers who have chosen xyz Travels for their Corbett and Nainital expeditions. 
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-[10px]">
              <Users className="w-4 h-4" /> Over 5,000+ Journeys
            </div>
          </div>
          <div className="lg:w-2/3 w-full aspect-[21/9] rounded-[24px] overflow-hidden shadow-2xl shadow-black/50 relative border border-white/10">
            {slideshow.map((img, i) => (
              <img 
                key={i}
                src={img} 
                alt="Happy customer" 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
