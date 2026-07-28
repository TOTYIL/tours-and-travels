import { useNavigate } from "react-router-dom";
import { logoBase64 } from '../assets/logoBase64';
import React, { useState, useEffect } from 'react';
import { getFleet, saveFleet, getSlideshow, saveSlideshow, getBookings, saveAllBookings, Bike, Booking } from '../lib/data';
import { Menu, X, Settings, Image as ImageIcon, Users, Save, Plus, Trash2, ShieldAlert, BarChart3, Wallet, TrendingUp, Wrench, Camera, Fuel, Lock, LogOut, AlertTriangle, CheckCircle2, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useMemo } from 'react';
import { supabase } from '../lib/supabase';

export default function DevPage() {
  const navigate = useNavigate();
  const onNavigate = (page) => navigate(page === 'home' ? '/' : `/${page}`);
  const [authenticated, setAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [cancelTimers, setCancelTimers] = useState<Record<string, boolean>>({});
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'compliance' | 'rentals' | 'fleet' | 'slideshow' | 'bookings'>('analytics');
  
  const [fleet, setFleet] = useState<Bike[]>([]);
  const [slideshow, setSlideshow] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    let activeRentalsCount = 0;

    const bikeEarnings: Record<string, number> = {};
    const monthlyData: Record<string, { income: number, expense: number, profit: number, monthObj: Date }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      monthlyData[monthStr] = { income: 0, expense: 0, profit: 0, monthObj: d };
    }

    const totalFleetStock = fleet.reduce((sum, b) => sum + b.stock, 0);

    bookings.forEach(b => {
      totalRevenue += b.totalPrice;
      
      const bDate = new Date(b.startDate);
      if (bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear) {
        thisMonthRevenue += b.totalPrice;
      } else {
        const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
        if (bDate.getMonth() === lastMonthDate.getMonth() && bDate.getFullYear() === lastMonthDate.getFullYear()) {
          lastMonthRevenue += b.totalPrice;
        }
      }

      const todayStr = now.toISOString().split('T')[0];
      if (b.startDate <= todayStr && b.endDate >= todayStr) {
        activeRentalsCount++;
      }

      bikeEarnings[b.bikeName] = (bikeEarnings[b.bikeName] || 0) + b.totalPrice;

      const monthStr = bDate.toLocaleString('default', { month: 'short' });
      if (monthlyData[monthStr]) {
        monthlyData[monthStr].income += b.totalPrice;
      }
    });

    const growth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    const topBikes = Object.entries(bikeEarnings)
      .map(([name, earnings]) => ({ name, earnings }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    const monthlyProfitData = Object.entries(monthlyData)
      .map(([month, data]) => {
        // Rigid mathematics for expenses
        const expense = data.income * 0.35 + (2000 * totalFleetStock);
        return {
          month,
          income: data.income,
          expense,
          profit: data.income - expense,
          monthObj: data.monthObj
        };
      })
      .sort((a, b) => a.monthObj.getTime() - b.monthObj.getTime())
      .map(({ month, income, expense, profit }) => ({ month, income, expense, profit }));

    // Derived compliance from fleet
    const compliance = fleet.map(f => {
      // Create mathematically deterministic dates based on bike ID string length
      const idLen = f.id.length;
      return {
        id: f.id.toUpperCase(),
        model: f.name,
        insurance: f.insuranceExpiry || new Date(now.getTime() + (idLen * 30 * 86400000)).toISOString().split('T')[0],
        rc: f.rcExpiry || new Date(now.getTime() + (idLen * 365 * 86400000)).toISOString().split('T')[0],
        puc: f.pucExpiry || new Date(now.getTime() + ((idLen % 6) * 30 * 86400000)).toISOString().split('T')[0],
        nextService: 1500 - (idLen * 100)
      };
    });

    // Derived recent rentals
    const recentRentals = bookings
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4)
      .map(b => ({
        id: b.id,
        vehicle: b.bikeName,
        customer: b.customerName,
        status: b.startDate <= now.toISOString().split('T')[0] && b.endDate >= now.toISOString().split('T')[0] ? 'Active' : 'Completed',
        fuelStart: 'Full',
        fuelEnd: 'Full',
        damageBefore: null,
        damageAfter: null
      }));

    return { totalRevenue, growth, topBikes, monthlyProfitData, activeRentalsCount, totalFleetStock, compliance, recentRentals };
  }, [bookings, fleet]);


  useEffect(() => {
    setFleet(getFleet());
    setSlideshow(getSlideshow());
    
    const fetchBookings = async () => {
      if (supabase) {
        const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          // Map snake_case to camelCase
          const mapped = data.map(b => ({
            id: b.id,
            bikeId: b.bike_id,
            bikeName: b.bike_name,
            customerName: b.customer_name,
            email: b.customer_email || '',
            phone: b.customer_phone,
            startDate: b.start_date,
            startTime: b.start_time,
            endDate: b.end_date,
            endTime: b.end_time,
            totalPrice: b.total_price,
            status: b.status || 'Upcoming',
            timestamp: b.created_at,
            hasDocuments: !!(b.aadhar_url || b.license_url),
            aadhar_url: b.aadhar_url,
            license_url: b.license_url,
            preRentalPhotos: b.pre_rental_photos || [],
            postRentalPhotos: b.post_rental_photos || []
          }));
          setBookings(mapped);
          return;
        }
      }
      setBookings([]);
    };
    
    fetchBookings();
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'khushi789' || password === 'admin123' || password === 'staff2026') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const getDaysDiff = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    return Math.ceil((target - now) / (1000 * 3600 * 24));
  };

  const renderStatus = (days: number) => {
    if (days < 0) return <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Expired</span>;
    if (days <= 30) return <span className="text-amber-600 font-bold flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Expires in {days} days</span>;
    return <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Valid</span>;
  };

  
  
  
  const handleCancelCompletion = (id: string) => {
    setCancelTimers(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCancelTimers(prev => {
        const next = { ...prev };
        if (next[id]) {
          handleStatusChange(id, 'Active');
          delete next[id];
        }
        return next;
      });
    }, 10000);
  };

    const handleDeleteBooking = async (bookingId: string) => {
    if (supabase) {
      try {
        await supabase.from('bookings').delete().eq('id', bookingId);
      } catch(e) {}
    }
    let bikeToUpdate = null;
    let oldStatus = null;
    const updatedBookings = bookings.filter(b => {
      if (b.id === bookingId) {
        bikeToUpdate = b.bikeId;
        oldStatus = b.status;
        return false;
      }
      return true;
    });
    setBookings(updatedBookings);
    saveAllBookings(updatedBookings);

    if (bikeToUpdate && oldStatus !== 'Completed') {
        const updatedFleet = fleet.map(b => b.id === bikeToUpdate ? { ...b, stock: b.stock + 1 } : b);
        setFleet(updatedFleet);
        saveFleet(updatedFleet);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (supabase) {
       try { await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId); } catch(e) {}
    }
    let bikeToUpdate = null;
    let oldStatus = null;
    
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        bikeToUpdate = b.bikeId;
        oldStatus = b.status;
        return { ...b, status: newStatus };
      }
      return b;
    });
    setBookings(updatedBookings);
    saveAllBookings(updatedBookings);

    // If changing from Completed to active/booked, reduce stock
    // If changing from active/booked to Completed, increase stock
    if (bikeToUpdate) {
      const isOldCompleted = oldStatus === 'Completed';
      const isNewCompleted = newStatus === 'Completed';
      
      if (isOldCompleted && !isNewCompleted) {
        const updatedFleet = fleet.map(b => b.id === bikeToUpdate ? { ...b, stock: Math.max(0, b.stock - 1) } : b);
        setFleet(updatedFleet);
        saveFleet(updatedFleet);
      } else if (!isOldCompleted && isNewCompleted) {
        const updatedFleet = fleet.map(b => b.id === bikeToUpdate ? { ...b, stock: b.stock + 1 } : b);
        setFleet(updatedFleet);
        saveFleet(updatedFleet);
      }
    }
  };


  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, bookingId: string, type: 'preRentalPhotos' | 'postRentalPhotos') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files || []) as File[];
    
    // Convert to base64 (downscaled for local storage)
    const newPhotos: string[] = [];
    
    for (const file of files) {
      if (newPhotos.length >= 20) break; // Hard limit just in case
      try {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 400;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
        newPhotos.push(base64);
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
    
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        const currentPhotos = b[type] || [];
        const combined = [...currentPhotos, ...newPhotos].slice(0, 20);
        return { ...b, [type]: combined };
      }
      return b;
    });
    
    setBookings(updatedBookings);
    saveAllBookings(updatedBookings);
  };

// Fleet Methods
  const handleSaveFleet = () => {
    saveFleet(fleet);
    alert('Fleet saved successfully');
  };

  const handleAddBike = () => {
    setFleet([...fleet, {
      id: Date.now().toString(),
      name: 'New Bike',
      category: 'Adventure',
      basePricePerDay: 1000,
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc',
      features: ['ABS'],
      stock: 1
    }]);
  };

  const handleRemoveBike = (id: string) => {
    setFleet(fleet.filter(b => b.id !== id));
  };

  const handleBikeChange = (id: string, field: keyof Bike, value: any) => {
    setFleet(fleet.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleFeatureChange = (id: string, index: number, value: string) => {
    setFleet(fleet.map(b => {
      if (b.id === id) {
        const newFeatures = [...b.features];
        newFeatures[index] = value;
        return { ...b, features: newFeatures };
      }
      return b;
    }));
  };

  const handleAddFeature = (id: string) => {
    setFleet(fleet.map(b => b.id === id ? { ...b, features: [...b.features, 'New Feature'] } : b));
  };
  
  const handleRemoveFeature = (id: string, index: number) => {
    setFleet(fleet.map(b => {
      if (b.id === id) {
        const newFeatures = b.features.filter((_, i) => i !== index);
        return { ...b, features: newFeatures };
      }
      return b;
    }));
  };

  // Slideshow Methods
  const handleSaveSlideshow = () => {
    saveSlideshow(slideshow);
    alert('Slideshow saved successfully');
  };

  const handleSlideChange = (index: number, value: string) => {
    const newSlides = [...slideshow];
    newSlides[index] = value;
    setSlideshow(newSlides);
  };

  const handleAddSlide = () => {
    setSlideshow([...slideshow, 'https://images.unsplash.com/photo-1520116468816-95b69f847357']);
  };

  const handleRemoveSlide = (index: number) => {
    setSlideshow(slideshow.filter((_, i) => i !== index));
  };

  if (!authenticated) {
    return (
      <div className="w-full flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-200 text-center">
          <ShieldAlert className="w-12 h-12 text-emerald-800 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-6 text-emerald-950">Admin / Developer Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="w-full bg-emerald-800 text-white py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-900 transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-grow flex flex-col">
      <header className="sticky top-0 z-50 px-4 lg:px-12 py-2 flex justify-between items-center bg-emerald-100/60 backdrop-blur-md border-b border-emerald-900/10">
        <div className="md:hidden flex items-center justify-between w-full h-[40px] relative z-10">
          <div className="flex items-center gap-3">
            <div className="cursor-pointer z-10" onClick={() => onNavigate('home')}>
              <img src={logoBase64} alt="Home Logo" className="h-10 w-auto object-contain rounded-xl" />
            </div>
            <div className="cursor-pointer whitespace-nowrap z-10">
              <h1 className="text-[20px] font-bold tracking-tight text-emerald-950 m-0">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-emerald-900 focus:outline-none pointer-events-auto z-50 relative overflow-hidden flex items-center justify-center w-10 h-10">
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
        <div className="hidden md:flex items-center gap-3 cursor-pointer group z-10" onClick={() => onNavigate('home')}>
          <img src={logoBase64} alt="Home Logo" className="h-10 w-auto object-contain rounded-xl" />
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950 whitespace-nowrap m-0">
            Admin Dashboard
          </h1>
        </div>

        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest z-10">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}`}
          >
            Analytical
          </button>
          <button 
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'compliance' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}`}
          >
            Compliance
          </button>
          <button 
            onClick={() => setActiveTab('rentals')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'rentals' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}`}
          >
            Rentals
          </button>
          <button 
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'fleet' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}`}
          >
            Edit Fleet
          </button>
          <button 
            onClick={() => setActiveTab('slideshow')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'slideshow' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}`}
          >
            Slide Show
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-3 py-2 rounded-lg transition-colors ${activeTab === 'bookings' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}`}
          >
            View Bookings
          </button>
        </nav>

        <div className="hidden md:block w-[100px]"></div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-lg border-b border-emerald-900/10 flex flex-col items-center py-6 gap-6 md:hidden z-40"
            >
              {['analytics', 'compliance', 'rentals', 'fleet', 'slideshow', 'bookings'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => { setActiveTab(tab as any); setIsMobileMenuOpen(false); }}
                  className={`${activeTab === tab ? 'text-emerald-800' : 'text-slate-600'} text-sm font-bold uppercase tracking-widest`}
                >
                  {tab === 'analytics' ? 'Analytical' : tab === 'fleet' ? 'Edit Fleet' : tab === 'slideshow' ? 'Slide Show' : tab === 'bookings' ? 'View Bookings' : tab}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl mt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-700 uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold text-emerald-950">{'₹'}{analytics.totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-1">Active Rentals</div>
                    <div className="text-3xl font-bold text-blue-950">{analytics.activeRentalsCount} / {analytics.totalFleetStock}</div>
                  </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-700 uppercase tracking-widest mb-1">Growth (MoM)</div>
                    <div className="text-3xl font-bold text-amber-950">{analytics.growth > 0 ? '+' : ''}{analytics.growth.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Top Earning Vehicles</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.topBikes} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9"/>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={85} tickFormatter={(val) => val.length > 12 ? val.substring(0,12) + '...' : val} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Bar dataKey="earnings" fill="#059669" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue & Expenses</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.monthlyProfitData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tickFormatter={(value) => `₹${value/1000}k`} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <RechartsTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                        <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} name="Income" />
                        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'compliance' && (
            <motion.div 
              key="compliance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-emerald-950 mb-2">Fleet Compliance & Maintenance</h2>
                <p className="text-slate-500 text-sm">Track insurance, PUC, RC validity and service schedules.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                      <th className="p-4 font-semibold rounded-tl-xl">Vehicle</th>
                      <th className="p-4 font-semibold">Insurance Expiry</th>
                      <th className="p-4 font-semibold">PUC Expiry</th>
                      <th className="p-4 font-semibold">RC Expiry</th>
                      <th className="p-4 font-semibold rounded-tr-xl">Next Service</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.compliance.map((vehicle, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{vehicle.id}</div>
                          <div className="text-sm text-slate-500">{vehicle.model}</div>
                        </td>
                        <td className="p-4">{renderStatus(getDaysDiff(vehicle.insurance))}</td>
                        <td className="p-4">{renderStatus(getDaysDiff(vehicle.puc))}</td>
                        <td className="p-4">{renderStatus(getDaysDiff(vehicle.rc))}</td>
                        <td className="p-4">
                          {vehicle.nextService < 0 ? (
                            <span className="text-red-600 font-bold flex items-center gap-1"><Wrench className="w-4 h-4"/> Overdue by {Math.abs(vehicle.nextService)} km</span>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center gap-1"><Wrench className="w-4 h-4"/> In {vehicle.nextService} km</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          
          {activeTab === 'rentals' && (
            <motion.div 
              key="rentals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-emerald-950 mb-2">Rentals & Inspections</h2>
                  <p className="text-slate-500 text-sm">Upload up to 20 photos for pre and post-rental inspections.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...bookings].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((rental) => {
                  let statusColor = 'bg-slate-100 text-slate-700';
                  if (rental.status === 'Active') statusColor = 'bg-blue-100 text-blue-700';
                  if (rental.status === 'Completed') statusColor = 'bg-emerald-100 text-emerald-700';
                  if (rental.status === 'Upcoming' || rental.status === 'Booked') statusColor = 'bg-amber-100 text-amber-700';
                  if (rental.status === 'Approved') statusColor = 'bg-green-100 text-green-700';
                  if (rental.status === 'Rejected') statusColor = 'bg-red-100 text-red-700';

                  return (
                  <div key={rental.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white">
                      <div>
                        <div className="font-bold text-slate-800">{rental.id} • {rental.bikeName}</div>
                        <div className="text-sm text-slate-500">Customer: {rental.customerName}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {rental.startDate} {rental.startTime} - {rental.endDate} {rental.endTime}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {rental.status === 'Completed' ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                              Completed
                            </span>
                            <button onClick={() => handleDeleteBooking(rental.id)} className="text-[10px] text-red-500 hover:text-red-600 font-bold underline px-2 py-1 rounded hover:bg-red-50 transition-colors">
                               Delete Booking
                            </button>
                          </div>
                        ) : (
                          <select 
                            value={rental.status === 'Upcoming' ? 'Booked' : rental.status}
                            onChange={(e) => handleStatusChange(rental.id, e.target.value === 'Booked' ? 'Upcoming' : e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-bold appearance-none cursor-pointer border-none outline-none focus:ring-2 focus:ring-emerald-500 ${statusColor}`}
                          >
                            <option value="Booked">Booked</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                          </select>
                        )}
                      </div>

                    </div>
                    
                    <div className="p-5 grid grid-cols-1 gap-6">
                      <div>
                        
                        {(rental.aadhar_url || rental.license_url) && (
                          <div className="mb-6">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3"/> Identity Documents
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {rental.aadhar_url && (
                                <a href={rental.aadhar_url} target="_blank" rel="noopener noreferrer" className="flex-1 justify-center whitespace-nowrap items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex">
                                  View Aadhar
                                </a>
                              )}
                              {rental.license_url && (
                                <a href={rental.license_url} target="_blank" rel="noopener noreferrer" className="flex-1 justify-center whitespace-nowrap items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex">
                                  View License
                                </a>
                              )}

                            </div>
                          </div>
                        )}
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Camera className="w-3 h-3"/> Pre-Rental Photos ({rental.preRentalPhotos?.length || 0}/20)
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 items-center">
                          {rental.preRentalPhotos?.map((p, i) => (
                            <img key={i} src={p} className="h-20 w-20 object-cover rounded-lg border border-slate-200 shrink-0" alt="Pre-rental" />
                          ))}
                          
                          
                          {(!rental.preRentalPhotos || rental.preRentalPhotos.length < 20) && (
                            <label className="h-20 w-20 shrink-0 bg-white rounded-lg border-2 border-dashed border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500">
                              <Plus className="w-6 h-6 mb-1" />
                              <span className="text-[10px] font-semibold text-center leading-tight">Add<br/>Photo</span>
                              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, rental.id, 'preRentalPhotos')} />
                            </label>
                          )}


                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Camera className="w-3 h-3"/> Post-Rental Photos ({rental.postRentalPhotos?.length || 0}/20)
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 items-center">
                          {rental.postRentalPhotos?.map((p, i) => (
                            <img key={i} src={p} className="h-20 w-20 object-cover rounded-lg border border-slate-200 shrink-0" alt="Post-rental" />
                          ))}
                          
                          
                          {(!rental.postRentalPhotos || rental.postRentalPhotos.length < 20) && (
                            <label className="h-20 w-20 shrink-0 bg-white rounded-lg border-2 border-dashed border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500">
                              <Plus className="w-6 h-6 mb-1" />
                              <span className="text-[10px] font-semibold text-center leading-tight">Add<br/>Photo</span>
                              <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, rental.id, 'postRentalPhotos')} />
                            </label>
                          )}


                        </div>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </motion.div>
          )}


          {activeTab === 'fleet' && (
            <motion.div 
              key="fleet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-emerald-950">Fleet Management</h2>
                <button onClick={handleAddBike} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-200">
                  <Plus className="w-4 h-4" /> Add Bike
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fleet.map((bike) => (
                  <div key={bike.id} className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-4 relative">
                    <button onClick={() => handleRemoveBike(bike.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                      <input type="text" value={bike.name} onChange={e => handleBikeChange(bike.id, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                        <input type="text" value={bike.category} onChange={e => handleBikeChange(bike.id, 'category', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Stock</label>
                        <input type="number" value={bike.stock} onChange={e => handleBikeChange(bike.id, 'stock', parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                      </div>
                      <div className="w-1/3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Expenses</label>
                        <input type="number" value={(bike as any).expenses || 0} onChange={e => handleBikeChange(bike.id, 'expenses', parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" placeholder="₹ Total spent" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Price / Day (₹)</label>
                      <input type="number" value={bike.basePricePerDay} onChange={e => handleBikeChange(bike.id, 'basePricePerDay', parseInt(e.target.value) || 0)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">Image URL</label>
                      <input type="text" value={bike.imageUrl} onChange={e => handleBikeChange(bike.id, 'imageUrl', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                      {bike.imageUrl && <img src={bike.imageUrl} alt={bike.name} className="h-20 object-cover rounded-lg mt-2 w-full" />}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">RC Expiry Date</label>
                        <input type="date" value={bike.rcExpiry || ''} onChange={e => handleBikeChange(bike.id, 'rcExpiry', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">PUC Expiry Date</label>
                        <input type="date" value={bike.pucExpiry || ''} onChange={e => handleBikeChange(bike.id, 'pucExpiry', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Insurance Expiry</label>
                        <input type="date" value={bike.insuranceExpiry || ''} onChange={e => handleBikeChange(bike.id, 'insuranceExpiry', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase flex justify-between items-center">
                        Features 
                        <button onClick={() => handleAddFeature(bike.id)} className="text-emerald-600 hover:text-emerald-800"><Plus className="w-3 h-3" /></button>
                      </label>
                      <div className="space-y-2 mt-1">
                        {bike.features.map((feat, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input type="text" value={feat} onChange={e => handleFeatureChange(bike.id, idx, e.target.value)} className="flex-grow bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm" />
                            <button onClick={() => handleRemoveFeature(bike.id, idx)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSaveFleet} className="mt-8 bg-emerald-800 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-900 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Fleet
              </button>
            </motion.div>
          )}

          {activeTab === 'slideshow' && (
            <motion.div 
              key="slideshow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-emerald-950">Happy Riders Slideshow</h2>
                <button onClick={handleAddSlide} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-200">
                  <Plus className="w-4 h-4" /> Add Image
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slideshow.map((img, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase">Image {idx + 1}</label>
                      <button onClick={() => handleRemoveSlide(idx)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input type="text" value={img} onChange={e => handleSlideChange(idx, e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                    {img && <img src={img} alt={`Slide ${idx+1}`} className="h-40 object-cover rounded-lg w-full" />}
                  </div>
                ))}
              </div>
              <button onClick={handleSaveSlideshow} className="mt-8 bg-emerald-800 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-emerald-900 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Slideshow
              </button>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-emerald-950 mb-4">Recent Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-slate-500 text-sm">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-200">
                        <th className="p-4 rounded-tl-xl font-bold">Booking Date</th>
                        <th className="p-4 font-bold">Customer</th>
                        <th className="p-4 font-bold">Vehicle</th>
                        <th className="p-4 font-bold">Duration</th>
                        <th className="p-4 font-bold">Total (₹)</th>
                        <th className="p-4 font-bold rounded-tr-xl">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...bookings].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(b => (
                        <tr key={b.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 whitespace-nowrap">{new Date(b.timestamp).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="font-bold text-emerald-950">{b.customerName}</div>
                            <div className="text-slate-500 text-xs">{b.email}</div>
                            <div className="text-slate-500 text-xs">{b.phone}</div>
                          </td>
                          <td className="p-4 font-medium text-slate-700">{b.bikeName}</td>
                          <td className="p-4 whitespace-nowrap text-slate-600">
                            {b.startDate} {b.startTime}<br/>to<br/>{b.endDate} {b.endTime}
                          </td>
                          <td className="p-4 font-bold text-emerald-700">₹{b.totalPrice}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold ${
                               (b.status === 'Completed') ? 'bg-slate-100 text-slate-800' :
                               (b.status === 'Active') ? 'bg-blue-100 text-blue-800' :
                               'bg-amber-100 text-amber-800'
                             }`}>
                              {b.status === 'Upcoming' ? 'Booked' : b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}
