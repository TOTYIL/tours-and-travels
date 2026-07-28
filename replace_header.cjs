const fs = require('fs');
let code = fs.readFileSync('src/components/DevPage.tsx', 'utf-8');

const target = `  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
      <h1 className="text-3xl font-bold text-emerald-950 mb-8">Admin Dashboard</h1>
      
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors \${activeTab === 'analytics' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}\`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics
        </button>
        <button 
          onClick={() => setActiveTab('compliance')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors \${activeTab === 'compliance' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}\`}
        >
          <ShieldAlert className="w-4 h-4" /> Compliance
        </button>
        <button 
          onClick={() => setActiveTab('rentals')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors \${activeTab === 'rentals' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}\`}
        >
          <Car className="w-4 h-4" /> Rentals
        </button>
        <button 
          onClick={() => setActiveTab('fleet')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors \${activeTab === 'fleet' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}\`}
        >
          <Settings className="w-4 h-4" /> Edit Fleet
        </button>
        <button 
          onClick={() => setActiveTab('slideshow')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors \${activeTab === 'slideshow' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}\`}
        >
          <ImageIcon className="w-4 h-4" /> Slideshow
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={\`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-colors \${activeTab === 'bookings' ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}\`}
        >
          <Users className="w-4 h-4" /> View Bookings
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">`;

const replacement = `  return (
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
            className={\`px-3 py-2 rounded-lg transition-colors \${activeTab === 'analytics' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}\`}
          >
            Analytical
          </button>
          <button 
            onClick={() => setActiveTab('compliance')}
            className={\`px-3 py-2 rounded-lg transition-colors \${activeTab === 'compliance' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}\`}
          >
            Compliance
          </button>
          <button 
            onClick={() => setActiveTab('rentals')}
            className={\`px-3 py-2 rounded-lg transition-colors \${activeTab === 'rentals' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}\`}
          >
            Rentals
          </button>
          <button 
            onClick={() => setActiveTab('fleet')}
            className={\`px-3 py-2 rounded-lg transition-colors \${activeTab === 'fleet' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}\`}
          >
            Edit Fleet
          </button>
          <button 
            onClick={() => setActiveTab('slideshow')}
            className={\`px-3 py-2 rounded-lg transition-colors \${activeTab === 'slideshow' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}\`}
          >
            Slide Show
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={\`px-3 py-2 rounded-lg transition-colors \${activeTab === 'bookings' ? 'bg-emerald-800 text-white' : 'hover:bg-slate-200'}\`}
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
                  className={\`\${activeTab === tab ? 'text-emerald-800' : 'text-slate-600'} text-sm font-bold uppercase tracking-widest\`}
                >
                  {tab === 'analytics' ? 'Analytical' : tab === 'fleet' ? 'Edit Fleet' : tab === 'slideshow' ? 'Slide Show' : tab === 'bookings' ? 'View Bookings' : tab}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 py-8 flex-grow">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl mt-4">`;

if (code.includes('Admin Dashboard')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/DevPage.tsx', code, 'utf-8');
  console.log('Replaced header');
} else {
  console.log('Could not find target');
}
