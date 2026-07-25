import logoImage from '../assets/logo.png';
export default function Footer() {
  return (
    <footer id="contact" className="relative z-10 px-6 lg:px-12 py-16 flex flex-col justify-between items-center bg-emerald-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={logoImage} alt="Yazdani Travels Logo" className="h-12 w-auto object-contain rounded-xl" />
            <h3 className="text-2xl font-bold tracking-tight text-white">Yazdani <span className="italic font-serif text-emerald-400">Travels</span></h3>
          </div>
          <p className="text-emerald-100/70 text-sm leading-relaxed max-w-sm font-light">
            Based in the heart of Corbett National Park, providing top-tier motorcycle and scooter rentals for your Himalayan adventures.
          </p>
        </div>
        
        <div>
          <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-4">Location</h4>
          <address className="not-italic text-sm text-emerald-100/70 space-y-2 font-light">
            <p>Main Road, Ramnagar</p>
            <p>Corbett National Park</p>
            <p>Nainital, Uttarakhand 244715</p>
          </address>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-4">Contact</h4>
          <div className="text-sm text-emerald-100/70 space-y-2 font-light">
            <p>Phone: +91 98765 43210</p>
            <p>Email: hello@yazdanitravels.com</p>
            <p>Open Daily: 08:00 AM - 08:00 PM</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col justify-center items-center pt-8 border-t border-white/10 mt-4">
        <div className="text-[10px] text-emerald-100/50 uppercase tracking-widest font-bold text-center">
          Yazdani Travels &copy; {new Date().getFullYear()} &bull; Ramnagar, Uttarakhand
        </div>
      </div>
    </footer>
  );
}
