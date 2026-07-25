import React, { useState, useEffect } from 'react';
import { getFleet, saveFleet, getSlideshow, saveSlideshow, getBookings, Bike, Booking } from '../lib/data';
import { Settings, Image as ImageIcon, Users, Save, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export default function DevPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'fleet' | 'slideshow' | 'bookings'>('fleet');
  
  const [fleet, setFleet] = useState<Bike[]>([]);
  const [slideshow, setSlideshow] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setFleet(getFleet());
    setSlideshow(getSlideshow());
    setBookings(getBookings());
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'khushi789') {
      setAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

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
          <h2 className="text-2xl font-bold mb-6 text-emerald-950">Developer Access</h2>
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
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
      <h1 className="text-3xl font-bold text-emerald-950 mb-8">Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'fleet' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          <Settings className="w-4 h-4" /> Manage Fleet
        </button>
        <button 
          onClick={() => setActiveTab('slideshow')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'slideshow' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          <ImageIcon className="w-4 h-4" /> Happy Riders
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors ${activeTab === 'bookings' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          <Users className="w-4 h-4" /> View Bookings
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-emerald-950">Fleet Management</h2>
              <button onClick={handleAddBike} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-200">
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fleet.map((bike) => (
                <div key={bike.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-4 relative">
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
          </div>
        )}

        {activeTab === 'slideshow' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-emerald-950 mb-4">Recent Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-slate-500 text-sm">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
                      <th className="p-4 rounded-tl-xl font-bold">Booking Date</th>
                      <th className="p-4 font-bold">Customer</th>
                      <th className="p-4 font-bold">Vehicle</th>
                      <th className="p-4 font-bold">Duration</th>
                      <th className="p-4 font-bold">Total (₹)</th>
                      <th className="p-4 font-bold rounded-tr-xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(b => (
                      <tr key={b.id} className="text-sm">
                        <td className="p-4 whitespace-nowrap">{new Date(b.timestamp).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="font-bold text-emerald-950">{b.customerName}</div>
                          <div className="text-slate-500 text-xs">{b.email}</div>
                          <div className="text-slate-500 text-xs">{b.phone}</div>
                        </td>
                        <td className="p-4 font-medium text-slate-700">{b.bikeName}</td>
                        <td className="p-4 whitespace-nowrap">
                          {b.startDate} {b.startTime}<br/>to<br/>{b.endDate} {b.endTime}
                        </td>
                        <td className="p-4 font-bold text-emerald-700">₹{b.totalPrice}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold ${b.hasDocuments ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {b.hasDocuments ? 'Docs Uploaded' : 'Pending Docs'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
