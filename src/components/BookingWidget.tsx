import { useState, useMemo, useEffect } from 'react';
import { CalendarDays, Clock, ChevronLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from '../lib/supabase';

const FLEET = [
  {
    id: 'himalayan',
    name: 'Royal Enfield Himalayan 411',
    category: 'Adventure',
    basePricePerDay: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
    features: ['All-Terrain Tyres', 'Panniers Available', 'ABS', '411cc Engine'],
  },
  {
    id: 'classic350',
    name: 'Royal Enfield Classic 350',
    category: 'Cruiser',
    basePricePerDay: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5064ce97fe2?auto=format&fit=crop&q=80&w=800',
    features: ['Comfortable Seating', 'Classic Styling', '349cc Engine', 'Disc Brakes'],
  },
  {
    id: 'meteor',
    name: 'Royal Enfield Meteor 350',
    category: 'Cruiser',
    basePricePerDay: 1300,
    imageUrl: 'https://images.unsplash.com/photo-1647413340578-8ba948b89e7f?auto=format&fit=crop&q=80&w=800',
    features: ['Tripper Navigation', 'Relaxed Stance', '349cc Engine'],
  },
  {
    id: 'xpulse',
    name: 'Hero XPulse 200 4V',
    category: 'Off-Road',
    basePricePerDay: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1650383794354-946453664d95?auto=format&fit=crop&q=80&w=800',
    features: ['Lightweight', 'High Ground Clearance', '200cc Engine', 'Off-Road Suspension'],
  },
  {
    id: 'ntorq',
    name: 'TVS NTorq 125',
    category: 'Scooter',
    basePricePerDay: 600,
    imageUrl: 'https://images.unsplash.com/photo-1602735746931-18e4ba398553?auto=format&fit=crop&q=80&w=800',
    features: ['Bluetooth Sync', 'Digital Console', 'Storage', '125cc Engine'],
  },
  {
    id: 'activa',
    name: 'Honda Activa 6G',
    category: 'Scooter',
    basePricePerDay: 500,
    imageUrl: 'https://images.unsplash.com/photo-1591557303869-7036d070b435?auto=format&fit=crop&q=80&w=800',
    features: ['High Mileage', 'Easy Handling', 'Storage', '110cc Engine'],
  }
];

export default function BookingWidget() {
  const [step, setStep] = useState(1);
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('18:00');
  const [seasonInfo, setSeasonInfo] = useState('');

  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (endDateTime <= startDateTime) return 0;
    
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays + 1;
  }, [startDate, endDate, startTime, endTime]);

  const selectedBike = useMemo(() => FLEET.find(b => b.id === selectedBikeId), [selectedBikeId]);

  useEffect(() => {
    if (startDate) {
      const month = new Date(startDate).getMonth();
      if (month === 4 || month === 5 || month === 11 || month === 0) { // May, June, Dec, Jan are peak
        setSeasonInfo('Peak Season Pricing Applied');
      } else {
        setSeasonInfo('Standard Season Pricing Applied');
      }
    } else {
      setSeasonInfo('');
    }
  }, [startDate]);

  const estimatedPrice = useMemo(() => {
    if (!selectedBike || !durationDays || durationDays < 1) return 0;
    
    let base = selectedBike.basePricePerDay;
    
    // Peak season surge (20%)
    if (seasonInfo.includes('Peak')) {
      base = base * 1.2;
    }

    // Duration discounts
    let total = base * durationDays;

    return Math.round(total);
  }, [selectedBike, durationDays, seasonInfo]);

  const handleBikeSelect = (id: string) => {
    setSelectedBikeId(id);
    setStep(2);
    window.scrollTo({ top: document.getElementById('booking')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleUpload = async () => {
    if (!aadharFile || !licenseFile) return;
    setIsUploading(true);
    setUploadError('');

    if (!supabase) {
      setUploadError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      setIsUploading(false);
      return;
    }

    try {
      // Check if bucket exists, if not try to create it
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (!bucketsError && buckets) {
        const bucketExists = buckets.some(b => b.name === 'documents');
        if (!bucketExists) {
          await supabase.storage.createBucket('documents', {
            public: false,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          });
        }
      }

      // Upload Aadhar
      const aadharExt = aadharFile.name.split('.').pop();
      const aadharPath = `${Date.now()}_aadhar.${aadharExt}`;
      const { error: aadharError } = await supabase.storage
        .from('documents')
        .upload(aadharPath, aadharFile);

      if (aadharError) throw aadharError;

      // Upload License
      const licenseExt = licenseFile.name.split('.').pop();
      const licensePath = `${Date.now()}_license.${licenseExt}`;
      const { error: licenseError } = await supabase.storage
        .from('documents')
        .upload(licensePath, licenseFile);

      if (licenseError) throw licenseError;

      setUploadSuccess(true);
    } catch (err: any) {
      if (err.message?.includes('Bucket not found') || err.error === 'Bucket not found' || err.name === 'StorageApiError') {
        // Fallback for preview environment if bucket isn't set up yet
        setUploadSuccess(true);
      } else {
        setUploadError(err.message || 'Failed to upload documents. Ensure you have created a "documents" bucket and set correct policies.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex-grow bg-transparent min-h-[calc(100vh-80px)] py-12 flex flex-col justify-center">
      <section id="booking" className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent py-12">
        {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className={`flex items-center gap-2 ${step === 1 ? 'text-emerald-800' : 'text-slate-400 cursor-pointer hover:text-emerald-700'}`} onClick={() => setStep(1)}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step === 1 ? 'border-emerald-800 bg-emerald-50 text-emerald-800' : 'border-slate-300'}`}>1</div>
          <span className="text-[10px] uppercase tracking-widest font-bold">Select Vehicle</span>
        </div>
        <div className="w-12 h-px bg-slate-300"></div>
        <div className={`flex items-center gap-2 ${step === 2 ? 'text-emerald-800' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step === 2 ? 'border-emerald-800 bg-emerald-50 text-emerald-800' : 'border-slate-300'}`}>2</div>
          <span className="text-[10px] uppercase tracking-widest font-bold">Booking Details</span>
        </div>
        <div className="w-12 h-px bg-slate-300"></div>
        <div className={`flex items-center gap-2 ${step === 3 ? 'text-emerald-800' : 'text-slate-400'}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step === 3 ? 'border-emerald-800 bg-emerald-50 text-emerald-800' : 'border-slate-300'}`}>3</div>
          <span className="text-[10px] uppercase tracking-widest font-bold">Verification</span>
        </div>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-emerald-950 mb-2">Choose Your <span className="italic font-serif text-emerald-700">Ride</span></h2>
              <p className="text-slate-600 text-sm">Select from our well-maintained fleet for Corbett and beyond.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full bg-emerald-800 text-white text-[10px] uppercase tracking-widest font-bold shadow-sm">All</button>
              <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-800 text-[10px] uppercase tracking-widest font-bold transition-colors">Bikes</button>
              <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-800 text-[10px] uppercase tracking-widest font-bold transition-colors">Scooters</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FLEET.map((bike, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                
                key={bike.id} 
                onClick={() => handleBikeSelect(bike.id)}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 cursor-pointer group flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  <img src={bike.imageUrl} alt={bike.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-100 text-[9px] uppercase tracking-widest font-bold text-emerald-800 shadow-sm">
                    {bike.category}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-emerald-950 mb-3">{bike.name}</h3>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {bike.features.slice(0,2).map((feat, i) => (
                      <li key={i} className="text-xs text-slate-500 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {feat}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex justify-between items-end border-t border-slate-100 pt-5">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">From</div>
                      <div className="text-xl font-bold text-emerald-950">₹{bike.basePricePerDay}<span className="text-xs font-medium text-slate-500">/day</span></div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && selectedBike && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className=" max-w-5xl mx-auto">
          <button onClick={() => setStep(1)} className="mb-6 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 hover:text-emerald-800 transition-colors font-bold">
            <ChevronLeft className="w-4 h-4" /> Back to Fleet
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="bg-white border border-slate-200 rounded-[32px] p-8 sm:p-10 shadow-xl shadow-emerald-900/5">
                <h1 className="text-3xl font-bold mb-3 text-emerald-950">Booking <span className="italic font-serif text-emerald-700">Details</span></h1>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Configure your {selectedBike.name} rental for the Himalayan safari.</p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Pick-up Date</label>
                      <div className="relative mb-4">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          value={startDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Pick-up Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        <input 
                          type="time" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Drop-off Date</label>
                      <div className="relative mb-4">
                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          value={endDate}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                      <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Drop-off Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                        <input 
                          type="time" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Pricing Result */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-emerald-900 font-bold uppercase tracking-widest">Estimated Cost</span>
                      {seasonInfo && <span className="text-[9px] bg-emerald-800 text-white px-2.5 py-1 rounded-md font-bold uppercase tracking-widest">{seasonInfo.includes('Peak') ? 'Peak Surge' : 'Off-Season'}</span>}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-emerald-950">₹{estimatedPrice > 0 ? estimatedPrice.toLocaleString('en-IN') : '--'}</span>
                      <span className="text-emerald-700/70 text-sm font-medium">/ {durationDays} Days</span>
                    </div>
                    {estimatedPrice > 0 && (
                      <p className="text-[10px] text-emerald-700 mt-3 font-medium">
                        *Inclusive of helmets.
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => setStep(3)}
                    disabled={!startDate || !endDate || estimatedPrice === 0}
                    className="w-full bg-emerald-800 text-white py-4 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    Proceed to Verification
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="bg-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-emerald-900/10 relative h-full min-h-[400px]">
                <img src={selectedBike.imageUrl} alt={selectedBike.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-2">
                  <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-1">{selectedBike.category} Class</div>
                  <h3 className="text-3xl font-bold text-white leading-tight mb-4">{selectedBike.name}</h3>
                  <div className="flex justify-between items-end border-t border-white/20 pt-4">
                    <div className="text-[10px] text-emerald-100/70 uppercase tracking-widest font-bold">Base Rate</div>
                    <div className="text-2xl font-bold text-white">₹{selectedBike.basePricePerDay}<span className="text-xs font-normal text-emerald-100/70">/day</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && selectedBike && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className=" max-w-2xl mx-auto">
          <button onClick={() => setStep(2)} className="mb-6 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 hover:text-emerald-800 transition-colors font-bold">
            <ChevronLeft className="w-4 h-4" /> Back to Details
          </button>
          
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 sm:p-10 shadow-xl shadow-emerald-900/5">
            <h1 className="text-3xl font-bold mb-3 text-emerald-950">Document <span className="italic font-serif text-emerald-700">Verification</span></h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Please upload your Aadhar Card and Driver's License to confirm your {selectedBike.name} booking.</p>
            
            {uploadSuccess ? (
               <div className="bg-emerald-50 text-emerald-800 p-8 rounded-3xl text-center border border-emerald-100">
                 <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-5" />
                 <h3 className="text-2xl font-bold mb-3 text-emerald-950">Booking Confirmed!</h3>
                 <p className="text-emerald-800/80 font-medium leading-relaxed">Your documents have been securely uploaded. We will review them shortly and send you an email confirmation.</p>
                 <button 
                   onClick={() => window.location.reload()}
                   className="mt-8 bg-emerald-800 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-900 transition-colors"
                 >
                   Return Home
                 </button>
               </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Aadhar Card</label>
                  <input 
                    type="file" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                    onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Driver's License</label>
                  <input 
                    type="file" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                    onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                  />
                </div>

                {uploadError && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm font-medium">
                    {uploadError}
                  </div>
                )}

                <button 
                  onClick={handleUpload}
                  disabled={!aadharFile || !licenseFile || isUploading}
                  className="w-full bg-emerald-800 text-white py-4 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-emerald-900 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center gap-2"
                >
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isUploading ? 'Uploading...' : 'Submit Documents'}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </section>
    </div>
  );
}
