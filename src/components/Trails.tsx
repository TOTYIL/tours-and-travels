import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Map as MapIcon, Mountain, Clock, TrendingUp, Navigation, Star, ArrowRight, Bookmark, X, Edit3, Navigation2, Crosshair, Layers, Check, MapPin, Fuel, Gauge, Loader2, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MAP_LAYERS = {
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  topo: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
};

type Trail = {
  id: number;
  name: string;
  points: { id: string, name: string, coords: [number, number] | null }[];
  description: string;
  distance: string;
  duration: string;
};

const TRAILS: Trail[] = [
  {
    id: 1,
    name: 'Nainital to Mukteshwar',
    points: [
      { id: 'start', name: 'Nainital, Uttarakhand', coords: [29.3919, 79.4542] },
      { id: 'end', name: 'Mukteshwar, Uttarakhand', coords: [29.4727, 79.6467] }
    ],
    description: 'A beautiful winding road through apple orchards and pine forests. Perfect for a morning ride.',
    distance: '48.5 km',
    duration: '1 h 45 min',
  },
  {
    id: 2,
    name: 'Jim Corbett to Lansdowne',
    points: [
      { id: 'start', name: 'Jim Corbett, Uttarakhand', coords: [29.5300, 78.7747] },
      { id: 'end', name: 'Lansdowne, Uttarakhand', coords: [29.8377, 78.6871] }
    ],
    description: 'Lush green tiger reserve roads winding up into the quiet, misty cantonment town.',
    distance: '120.2 km',
    duration: '3 h 30 min',
  },
  {
    id: 3,
    name: 'Rishikesh to Devprayag',
    points: [
      { id: 'start', name: 'Rishikesh, Uttarakhand', coords: [30.0869, 78.2676] },
      { id: 'end', name: 'Devprayag, Uttarakhand', coords: [30.1459, 78.5992] }
    ],
    description: 'Ride along the holy Ganges up to the stunning confluence of Alaknanda and Bhagirathi rivers.',
    distance: '74.8 km',
    duration: '2 h 15 min',
  },
  {
    id: 4,
    name: 'Almora to Jageshwar Dham',
    points: [
      { id: 'start', name: 'Almora, Uttarakhand', coords: [29.5892, 79.6467] },
      { id: 'end', name: 'Jageshwar Dham, Uttarakhand', coords: [29.6387, 79.8546] }
    ],
    description: 'A serene trail leading to the ancient temple complex nestled in a dense deodar forest.',
    distance: '36.4 km',
    duration: '1 h 10 min',
  }
];

const IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Nanda_Devi_-_Hidden_Summit%2C_Uttarakhand_India_2013.jpg/1280px-Nanda_Devi_-_Hidden_Summit%2C_Uttarakhand_India_2013.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Nainital_metro.jpg/1280px-Nainital_metro.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg/1280px-Valley_of_flowers_national_park%2C_Uttarakhand%2C_India_03_%28edit%29.jpg"
];

function Slideshow() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="absolute inset-0 z-0 bg-emerald-950">
      {IMAGES.map((src, index) => (
        <motion.img
          key={src}
          src={src}
          initial={{ opacity: index === 0 ? 1 : 0 }}
          animate={{ opacity: current === index ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="w-full h-full object-cover absolute inset-0" referrerPolicy="no-referrer"
        />
      ))}
      <div className="absolute inset-0 bg-emerald-900/40" />
    </div>
  );
}

function MapUpdater({ coordinates, isOverview = false, singlePoint }: { coordinates?: [number, number][], isOverview?: boolean, singlePoint?: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const validCoords = coordinates.filter(c => c && !isNaN(c[0]) && !isNaN(c[1]));
      if (validCoords.length === 0) return;
      const bounds = L.latLngBounds(validCoords);
      if (isOverview) {
        map.fitBounds(bounds, { padding: [20, 20], duration: 1 });
      } else {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
          map.fitBounds(bounds, { paddingBottomRight: [20, 300], paddingTopLeft: [20, 20], duration: 1.5 });
        } else {
          map.fitBounds(bounds, { paddingBottomRight: [50, 50], paddingTopLeft: [450, 50], duration: 1.5 });
        }
      }
    } else if (singlePoint && !isNaN(singlePoint[0]) && !isNaN(singlePoint[1])) {
      if (isOverview) {
        map.flyTo(singlePoint, 12, { duration: 1 });
      } else {
        map.flyTo(singlePoint, 13, { duration: 1.5, animate: true });
      }
    }
  }, [coordinates, map, isOverview, singlePoint]);
  return null;
}

function OSRMRoute({ points, isOverview = false, onRouteStats, onLoading }: { points: { name?: string, coords: [number, number] | null }[], isOverview?: boolean, onRouteStats?: (stats: any) => void, onLoading?: (loading: boolean) => void }) {
  const [path, setPath] = useState<[number, number][]>([]);

  useEffect(() => {
    const validPoints = points.filter(p => p.coords !== null && !isNaN(p.coords[0]) && !isNaN(p.coords[1])) as { coords: [number, number] }[];
    if (validPoints.length < 2) {
      setPath([]);
      if (onRouteStats) onRouteStats(null);
      if (onLoading) onLoading(false);
      return;
    }

    let isSubscribed = true;
    const fetchRoute = async () => {
      if (onLoading) onLoading(true);
      try {
        const coordsString = validPoints.map(p => `${p.coords[1]},${p.coords[0]}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`);
        const data = await res.json();
        if (!isSubscribed) return;
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setPath(coords);
          
          if (onRouteStats) {
             const distKm = (route.distance / 1000).toFixed(1);
             const durationMins = Math.round(route.duration / 60);
             const hours = Math.floor(durationMins / 60);
             const mins = durationMins % 60;
             const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins} min`;
             
             const fuelCost = Math.round(Number(distKm) / 45 * 100);
             
             onRouteStats({
               distance: `${distKm} km`,
               duration: timeStr,
               fuelCost: `₹${fuelCost}`,
               mileage: '45 km/l'
             });
          }
        } else {
          setPath(validPoints.map(p => p.coords));
        }
      } catch (err) {
        console.warn("OSRM fetch error:", err);
        setPath(validPoints.map(p => p.coords));
      } finally {
        if (isSubscribed && onLoading) onLoading(false);
      }
    };
    fetchRoute();
    return () => { isSubscribed = false; };
  }, [points]);

  if (path.length === 0) {
    const validCoords = points.filter(p => p.coords !== null).map(p => p.coords as [number, number]);
    return (
      <>
        {points.filter(p => p.coords !== null).map((p, i) => (
          <Marker key={i} position={p.coords as [number, number]}>
            {p.name && !isOverview && (
              <Tooltip permanent direction="top" className="!bg-white/90 backdrop-blur-sm !border-none !shadow-md text-emerald-950 font-semibold text-xs px-2.5 py-1 rounded-lg whitespace-nowrap">
                {p.name.split(",")[0]}
              </Tooltip>
            )}
          </Marker>
        ))}
        {validCoords.length > 1 
          ? <MapUpdater coordinates={validCoords} isOverview={isOverview} /> 
          : validCoords.length === 1 
            ? <MapUpdater singlePoint={validCoords[0]} isOverview={isOverview} /> 
            : null}
      </>
    );
  }

  return (
    <>
      <Polyline positions={path} color="#059669" weight={6} opacity={0.9} />
      {points.filter(p => p.coords !== null).map((p, i) => (
        <Marker key={i} position={p.coords as [number, number]}>
            {p.name && !isOverview && (
              <Tooltip permanent direction="top" className="!bg-white/90 backdrop-blur-sm !border-none !shadow-md text-emerald-950 font-semibold text-xs px-2.5 py-1 rounded-lg whitespace-nowrap">
                {p.name.split(",")[0]}
              </Tooltip>
            )}
        </Marker>
      ))}
      <MapUpdater coordinates={path} isOverview={isOverview} />
    </>
  );
}

function TrailCard({ trail, onOpen }: { trail: Trail, onOpen: () => void, key?: string | number }) {
  return (
    <div className="bg-white border border-emerald-100 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-xl shadow-emerald-900/5">
      <div className="w-full md:w-[350px] h-[220px] md:h-auto relative z-0 pointer-events-none bg-slate-100">
        <MapContainer
          center={trail.points[0].coords!}
          zoom={10}
          zoomControl={false}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer url={MAP_LAYERS.standard} attribution="" />
          <OSRMRoute points={trail.points} isOverview={true} />
        </MapContainer>
      </div>
      
      <div className="p-6 md:p-8 flex flex-col flex-grow relative z-10 bg-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-emerald-950 hover:text-emerald-700 transition-colors cursor-pointer" onClick={onOpen}>{trail.name}</h3>
          <button className="text-slate-400 hover:text-emerald-600"><Bookmark className="w-6 h-6" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-6">Route in Uttarakhand, India</p>
        
        <div className="flex gap-6 mb-8 text-slate-600 text-sm">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-bold text-emerald-950">{trail.distance}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Distance</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="font-bold text-emerald-950">{trail.duration}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Duration</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-auto">
          <button onClick={onOpen} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 text-sm">
             <MapIcon className="w-4 h-4" /> Open route
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Trails() {
  const [viewMode, setViewMode] = useState<'intro' | 'planner'>('intro');
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [isMobilePanelExpanded, setIsMobilePanelExpanded] = useState(false);
  
  // Custom Planner State
  const [layerType, setLayerType] = useState<keyof typeof MAP_LAYERS>('standard');
  const [points, setPoints] = useState<{ id: string, name: string, coords: [number, number] | null }[]>([
    { id: 'start', name: '', coords: null },
    { id: 'end', name: '', coords: null }
  ]);
  const [routeStats, setRouteStats] = useState<{distance: string, duration: string, fuelCost?: string, mileage?: string} | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [popularPlaces, setPopularPlaces] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState<{[key: number]: any[]}>({});
  const [focusedInput, setFocusedInput] = useState<number | null>(null);

  // Debounce timers
  const geocodeTimers = useRef<{[key: string]: any}>({});
  
  // Handle clicking outside of suggestions
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocusedInput(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (viewMode === 'planner') {
      document.body.style.overflow = 'hidden';
      if (selectedTrail) {
        setPoints(selectedTrail.points.map(p => ({ ...p })));
      }
    } else {
      document.body.style.overflow = 'unset';
      setPoints([
        { id: 'start', name: '', coords: null },
        { id: 'end', name: '', coords: null }
      ]);
      setRouteStats(null);
      setIsSaved(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewMode, selectedTrail]);

  const fetchSuggestions = async (query: string, index: number) => {
    if (!query || query.length < 3) {
      setSuggestions(prev => ({ ...prev, [index]: [] }));
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [index]: data || [] }));
    } catch (e) {
      console.warn(e);
    }
  };

  const updatePointName = (index: number, val: string) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], name: val, coords: null };
    setPoints(newPoints);
    
    if (geocodeTimers.current[index]) clearTimeout(geocodeTimers.current[index]);
    
    geocodeTimers.current[index] = setTimeout(() => {
      fetchSuggestions(val, index);
    }, 400);
  };
  
  const selectSuggestion = (index: number, suggestion: any) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], name: suggestion.display_name, coords: [parseFloat(suggestion.lat), parseFloat(suggestion.lon)] };
    setPoints(newPoints);
    
    setSuggestions(prev => ({ ...prev, [index]: [] }));
    setFocusedInput(null);
  };

  const addWaypoint = () => {
    const newPoints = [...points];
    newPoints.splice(newPoints.length - 1, 0, { id: Date.now().toString(), name: '', coords: null });
    setPoints(newPoints);
  };

  const removeWaypoint = (index: number) => {
    if (points.length <= 2) return;
    setPoints(points.filter((_, i) => i !== index));
    
    // Clear suggestions for removed index and shift others if needed
    const newSuggestions = { ...suggestions };
    delete newSuggestions[index];
    setSuggestions(newSuggestions);
  };

  const reverseOrder = () => {
    setPoints([...points].reverse());
    // Also clear suggestions as order changed
    setSuggestions({});
  };

  useEffect(() => {
    const start = points[0]?.coords;
    const end = points[points.length - 1]?.coords;
    if (start && end && points.length >= 2) {
      const getPopularPlaces = async () => {
        const minLat = Math.min(start[0], end[0]) - 0.5;
        const maxLat = Math.max(start[0], end[0]) + 0.5;
        const minLon = Math.min(start[1], end[1]) - 0.5;
        const maxLon = Math.max(start[1], end[1]) + 0.5;
        
        const midLat = (minLat + maxLat) / 2;
        const midLon = (minLon + maxLon) / 2;
        
        try {
          const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${midLat}|${midLon}&gsradius=10000&gslimit=5&format=json&origin=*`);
          const data = await res.json();
          if (data && data.query && data.query.geosearch) {
            const places = data.query.geosearch.map((p) => ({
              name: p.title,
              coords: [p.lat, p.lon],
              description: 'Wikipedia Article'
            }));
            setPopularPlaces(places);
          } else {
            setPopularPlaces([]);
          }
        } catch (err) {
          console.warn("Wikipedia fetch error:", err);
          setPopularPlaces([]);
        }
      };
      getPopularPlaces();
    } else {
      setPopularPlaces([]);
    }
  }, [points[0]?.coords, points[points.length - 1]?.coords]);

  const addPopularPlace = (place: any) => {
    setPoints(pts => {
      const newPoints = [...pts];
      newPoints.splice(newPoints.length - 1, 0, { 
        id: Date.now().toString(), 
        name: place.name || (place.display_name ? place.display_name.split(',')[0] : 'Unknown'), 
        coords: place.coords || [parseFloat(place.lat), parseFloat(place.lon)] 
      });
      return newPoints;
    });
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPoints(pts => {
            const newPts = [...pts];
            newPts[0] = { ...newPts[0], name: "Current Location", coords };
            return newPts;
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          setIsLocating(false);
          alert("Could not get your location. Please check your browser permissions.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  if (viewMode === 'intro') {
    return (
      <div className="w-full bg-slate-50 min-h-screen font-sans overflow-x-hidden pb-12">
        <div className="relative h-[65vh] flex items-center justify-center overflow-hidden rounded-[3rem] m-4 md:m-6 shadow-xl">
          <Slideshow />
          <div className="relative z-10 text-center px-4 max-w-3xl pt-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">Explore Uttarakhand</h1>
            <p className="text-lg md:text-2xl text-white/95 mb-10 drop-shadow-md font-medium">Discover the most scenic trails and routes for your next ride.</p>
            <button 
              onClick={() => setViewMode('planner')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl shadow-emerald-900/50 hover:scale-105 transition-all flex items-center gap-3 mx-auto"
            >
              <Navigation2 className="w-6 h-6" /> Plan Your Route
            </button>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-12">
            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">From our community</h3>
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-950 tracking-tight">The best routes in Uttarakhand</h2>
          </div>
          
          <div className="space-y-10">
            {TRAILS.map(trail => (
              <TrailCard 
                key={trail.id} 
                trail={trail} 
                onOpen={() => { 
                  setSelectedTrail(trail); 
                  setViewMode('planner'); 
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PLANNER MODE
  const validCoords = points.find(p => p.coords !== null)?.coords || [29.39, 79.45];

  return (
    <div className="fixed top-[56px] left-0 right-0 bottom-0 z-40 bg-slate-100 flex overflow-hidden">
      
      {/* Map Area - Fills entire background */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={validCoords}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url={MAP_LAYERS[layerType]}
          />
          <OSRMRoute 
            points={points} 
            isOverview={false} 
            onRouteStats={setRouteStats}
            onLoading={setIsLoadingRoute}
          />
        </MapContainer>
      </div>

      {/* Map Controls - placed outside MapContainer for absolute highest z-index */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
         <button 
           onClick={() => setLayerType('standard')}
           className={`p-3 rounded-xl shadow-lg border ${layerType === 'standard' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
           title="Standard Map (Shows POIs like fuel/food)"
         >
            <MapIcon className="w-5 h-5" />
         </button>
         <button 
           onClick={() => setLayerType('satellite')}
           className={`p-3 rounded-xl shadow-lg border ${layerType === 'satellite' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
           title="Satellite Map"
         >
            <Layers className="w-5 h-5" />
         </button>
         <button 
           onClick={getUserLocation}
           disabled={isLocating}
           className={`p-3 rounded-xl shadow-lg border mt-4 ${isLocating ? 'bg-slate-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
           title="My Location"
         >
            {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crosshair className="w-5 h-5" />}
         </button>
      </div>

      {/* Floating Sidebar Panel */}
      <div className={`absolute md:top-4 md:bottom-4 md:left-4 bottom-0 left-0 w-full md:max-w-[400px] ${isMobilePanelExpanded ? 'h-[75vh]' : 'h-[85px]'} md:h-auto md:max-h-none bg-white text-slate-800 rounded-t-[2rem] md:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl z-[1000] flex flex-col overflow-hidden border border-slate-200/60 pointer-events-auto transition-all duration-300 ease-in-out`}>
        <div 
          className="md:hidden pt-3 pb-1 flex justify-center items-center shrink-0 cursor-pointer w-full bg-white relative z-10"
          onClick={() => setIsMobilePanelExpanded(!isMobilePanelExpanded)}
        >
          <div className="w-12 h-1.5 bg-slate-200 rounded-full shrink-0"></div>
        </div>
        
        <div 
          className="px-5 pb-5 md:pt-5 border-b border-slate-100 shrink-0 flex items-center justify-between bg-white cursor-pointer md:cursor-default"
          onClick={() => setIsMobilePanelExpanded(!isMobilePanelExpanded)}
        >
          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-3">
             <div className="bg-emerald-100 p-1.5 rounded-lg">
               <Navigation2 className="w-4 h-4 text-emerald-600" />
             </div>
             Route planner
          </h2>
          <button onClick={(e) => { e.stopPropagation(); setViewMode('intro'); setSelectedTrail(null); }} className="text-slate-400 hover:text-emerald-950 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto flex flex-col z-0">
          <div className="p-5 border-b border-slate-100 shrink-0 bg-slate-50/50" ref={containerRef}>
            <div className="space-y-3">
            {points.map((point, index) => (
              <div key={point.id} className="relative flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 bg-slate-50/50">
                   {index === 0 ? (
                     <div className="w-3 h-3 rounded-full border-2 border-emerald-600"></div>
                   ) : index === points.length - 1 ? (
                     <div className="w-4 h-4 rounded-full border-4 border-emerald-600 bg-white"></div>
                   ) : (
                     <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                   )}
                </div>
                
                <div className="flex-grow flex gap-2 relative">
                  <input 
                    type="text" 
                    placeholder={index === 0 ? "Start location" : index === points.length - 1 ? "End location" : "Stopover"} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all shadow-sm" 
                    value={point.name}
                    onChange={(e) => updatePointName(index, e.target.value)}
                    onFocus={() => setFocusedInput(index)}
                    onBlur={async () => {
                      // Geocode on blur if no coords but has text
                      setTimeout(async () => {
                        if (point.name.length >= 3 && point.coords === null) {
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(point.name)}&limit=1`);
                            const data = await res.json();
                            if (data && data.length > 0) {
                              setPoints(pts => {
                                const newPts = [...pts];
                                newPts[index] = { ...newPts[index], name: data[0].display_name, coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)] };
                                return newPts;
                              });
                            }
                          } catch(e) {}
                        }
                      }, 200);
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (suggestions[index] && suggestions[index].length > 0) {
                          selectSuggestion(index, suggestions[index][0]);
                        } else if (point.name.length >= 3) {
                          try {
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(point.name)}&limit=1`);
                            const data = await res.json();
                            if (data && data.length > 0) {
                              setPoints(pts => {
                                const newPts = [...pts];
                                newPts[index] = { ...newPts[index], name: data[0].display_name, coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)] };
                                return newPts;
                              });
                              setSuggestions(prev => ({ ...prev, [index]: [] }));
                              setFocusedInput(null);
                            }
                          } catch (err) {
                            console.warn(err);
                          }
                        }
                      }
                    }}
                  />
                  {index !== 0 && index !== points.length - 1 && (
                    <button onClick={() => removeWaypoint(index)} className="text-slate-400 hover:text-red-500 p-2">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {focusedInput === index && suggestions[index] && suggestions[index].length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {suggestions[index].map((suggestion, i) => (
                          <div 
                            key={i} 
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0 flex items-start gap-3"
                            onClick={() => selectSuggestion(index, suggestion)}
                          >
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <div className="text-sm text-slate-700 leading-tight">
                               {suggestion.display_name}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {index < points.length - 1 && (
                  <div className="w-[2px] bg-slate-200 absolute left-2.5 top-[20px] bottom-[-30px] z-0"></div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
               <button onClick={addWaypoint} className="text-xs text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-emerald-100">
                 <MapIcon className="w-3 h-3" /> Add waypoint
               </button>
               <button onClick={reverseOrder} className="text-xs text-slate-600 font-bold bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors">
                 <ArrowRight className="w-3 h-3" /> Reverse order
               </button>
            </div>
          </div>

          <div className="p-5 space-y-6 bg-white flex-grow z-0">
             {isLoadingRoute ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                   <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
                   <p className="text-sm font-medium">Finding the best route...</p>
                </div>
             ) : routeStats ? (
             <div>
                <h4 className="text-sm font-bold text-emerald-950 mb-4">Route statistics</h4>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-2 mb-6">
                   <div>
                      <div className="text-slate-400 mb-1 text-[10px] uppercase font-bold tracking-wide flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</div>
                      <div className="text-slate-800 font-bold text-lg">{routeStats.duration}</div>
                   </div>
                   <div>
                      <div className="text-slate-400 mb-1 text-[10px] uppercase font-bold tracking-wide flex items-center gap-1"><Navigation className="w-3 h-3" /> Distance</div>
                      <div className="text-slate-800 font-bold text-lg">{routeStats.distance}</div>
                   </div>
                   {routeStats.fuelCost && (
                   <div>
                      <div className="text-slate-400 mb-1 text-[10px] uppercase font-bold tracking-wide flex items-center gap-1"><Fuel className="w-3 h-3" /> Est. Fuel Cost</div>
                      <div className="text-slate-800 font-bold text-lg">{routeStats.fuelCost}</div>
                   </div>
                   )}
                   {routeStats.mileage && (
                   <div>
                      <div className="text-slate-400 mb-1 text-[10px] uppercase font-bold tracking-wide flex items-center gap-1"><Gauge className="w-3 h-3" /> Avg. Mileage</div>
                      <div className="text-slate-800 font-bold text-lg">{routeStats.mileage}</div>
                   </div>
                   )}
                </div>
             </div>
             ) : (
               <div className="text-slate-400 text-sm text-center py-8">
                  Type locations or select a route to start planning.
               </div>
             )}
             
             {!isLoadingRoute && popularPlaces.length > 0 && (
               <div className="mt-6 pt-6 border-t border-slate-100">
                 <h4 className="text-sm font-bold text-emerald-950 mb-4">Popular places on the way</h4>
                 <div className="space-y-3">
                   {popularPlaces.map((place, idx) => (
                     <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors">
                       <div className="flex items-start gap-3 overflow-hidden">
                         <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 border border-slate-100">
                           <MapPin className="w-4 h-4 text-emerald-600" />
                         </div>
                         <div className="overflow-hidden">
                           <div className="text-sm font-bold text-slate-800 truncate">{place.name}</div>
                           <div className="text-xs text-slate-500 truncate">{place.description || 'Famous place'}</div>
                         </div>
                       </div>
                       <button 
                         onClick={() => addPopularPlace(place)}
                         className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg shrink-0"
                         title="Add to route"
                       >
                         <Plus className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0 bg-white relative z-0">
           <button 
             onClick={handleSave}
             className={`flex-1 font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 ${isSaved ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-900/10' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/10'}`}
           >
             {isSaved ? (
               <><Check className="w-4 h-4" /> Route Saved!</>
             ) : (
               "Save route"
             )}
           </button>
        </div>
      </div>
      
    </div>
  );
}
