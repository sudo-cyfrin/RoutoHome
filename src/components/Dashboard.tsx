import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, Train, Car, Clock, Search, MapPin, 
  ShieldAlert, AlertTriangle, PhoneCall, ArrowRight,
  ChevronLeft, Shield, Phone, User, Mail, Loader2,
  Plus, X, Camera, Trash2
} from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getTransportRoutes, TransportOption } from '../services/transportService';
import { getSafetyAssessment, SafetyAssessment } from '../services/safetyService';
import { cn } from '../lib/utils';
import { LocateFixed } from 'lucide-react';
import { useLogo } from '../hooks/useLogo';

interface DashboardProps {
  initialScreen?: string;
  key?: string;
}

export default function Dashboard({ initialScreen = 'home' }: DashboardProps) {
  const [screen, setScreen] = useState(initialScreen);
  const [sosActive, setSosActive] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync screen state with initialScreen prop
  useEffect(() => {
    setScreen(initialScreen);
  }, [initialScreen]);

  const fetchUserData = async () => {
    if (auth.currentUser) {
      const docRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleShareLocation = (specificPhone?: string) => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    setSharingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `EMERGENCY! I need help. My current location is: ${mapsUrl}`;
        
        // Get phone numbers
        const numbers = specificPhone || userData?.emergencyContacts?.map((c: any) => c.phone).join(',') || '';
        
        // Open SMS app
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const smsUrl = `sms:${numbers}${isIOS ? '&' : '?'}body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
        setSharingLocation(false);
      },
      (error) => {
        console.error("Error sharing location:", error);
        setLocationError("Failed to get location. Please try again.");
        setSharingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-96px)]">
      {/* Floating SOS Button */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSosActive(true)}
          className="w-20 h-20 bg-red-600 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center justify-center group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <div className="flex flex-col items-center relative z-10">
            <Shield className="w-8 h-8 mb-1" />
            <span className="text-xs font-black tracking-tighter">SOS</span>
          </div>
        </motion.button>
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center space-y-8 shadow-2xl"
            >
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Shield className="w-12 h-12 text-red-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Emergency SOS</h2>
                
                {showConfirm ? (
                  <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100 space-y-4">
                    <p className="text-slate-800 font-bold">
                      Share your live location link with all emergency contacts via SMS?
                    </p>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          setShowConfirm(false);
                          handleShareLocation();
                        }}
                        className="flex-1 bg-primary text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest"
                      >
                        YES, SHARE
                      </button>
                      <button 
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 bg-white text-slate-500 py-3 rounded-xl font-bold text-sm border border-slate-200"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Triggering an alert will notify the emergency contacts you added during signup:
                    </p>
                    <div className="grid gap-3">
                      {userData?.emergencyContacts?.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                              {c.photo ? (
                                <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-slate-900">{c.name}</p>
                              <p className="text-xs font-bold text-slate-500">{c.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleShareLocation(c.phone)}
                              className="w-8 h-8 bg-secondary text-primary rounded-lg flex items-center justify-center shadow-sm hover:bg-yellow-200 transition-all"
                              title="Send Location"
                            >
                              <MapPin className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => window.location.href = `tel:${c.phone}`}
                              className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-accent transition-all"
                            >
                              <PhoneCall className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {locationError && (
                <p className="text-red-500 text-xs font-bold">{locationError}</p>
              )}

              <div className="grid gap-4">
                {!showConfirm && (
                  <button 
                    onClick={() => setShowConfirm(true)}
                    disabled={sharingLocation}
                    className="bg-primary text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-yellow-200 hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    {sharingLocation ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <MapPin className="w-6 h-6 mr-3" /> SHARE LOCATION VIA SMS
                      </>
                    )}
                  </button>
                )}
                <button 
                  onClick={() => window.location.href = 'tel:100'}
                  className="bg-red-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <PhoneCall className="w-6 h-6 mr-3" /> CALL POLICE (100)
                </button>
                <button 
                  onClick={() => {
                    setSosActive(false);
                    setShowConfirm(false);
                  }}
                  className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="section-container py-12">
        <AnimatePresence mode="wait">
          {screen === 'home' && <HomeView onNavigate={setScreen} userData={userData} />}
          {screen === 'transport' && <TransportView onBack={() => setScreen('home')} />}
          {screen === 'risk' && <RiskView onBack={() => setScreen('home')} onGoToTransport={() => setScreen('transport')} />}
          {screen === 'helpline' && <HelplineView onBack={() => setScreen('home')} userData={userData} onRefresh={fetchUserData} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HomeView({ onNavigate, userData }: { onNavigate: (s: string) => void, userData: any }) {
  const cards = [
    { id: 'transport', title: 'Public Transport', desc: 'Find safe routes & schedules', icon: Bus, color: 'bg-orange-50 text-orange-600' },
    { id: 'risk', title: 'Risk Analysis', desc: 'Check safety levels of areas', icon: ShieldAlert, color: 'bg-red-50 text-red-600' },
    { id: 'helpline', title: 'Emergency Helplines', desc: 'Quick access to support', icon: PhoneCall, color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
            Hello, <span className="text-primary italic">{userData?.firstName || 'User'}</span>
          </h2>
          <p className="text-xl text-slate-500 font-medium">Your safety is our top priority today.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-6 py-3 bg-green-50 text-green-600 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center border border-green-100 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileHover={{ scale: 1.02, y: -8 }}
            onClick={() => onNavigate(card.id)}
            className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-10 text-left group hover:border-primary/30 transition-all rounded-[2.5rem]"
          >
            <div className={`w-20 h-20 ${card.color} rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-sm`}>
              <card.icon className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{card.title}</h3>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">{card.desc}</p>
            <div className="flex items-center text-primary font-black tracking-widest text-sm uppercase">
              Open Tool <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function TransportView({ onBack }: { onBack: () => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<TransportOption | null>(null);

  const handleSearch = async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const routes = await getTransportRoutes(from, to);
      setOptions(routes);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('bus')) return Bus;
    if (t.includes('train') || t.includes('metro')) return Train;
    return Car;
  };

  const getColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('bus')) return 'text-orange-500';
    if (t.includes('train')) return 'text-blue-500';
    if (t.includes('metro')) return 'text-purple-500';
    return 'text-green-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-10"
    >
      <div className="flex items-center space-x-6">
        <button onClick={onBack} className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Public Transport</h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-[2.5rem] p-10 space-y-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Find Routes</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Location</label>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Enter your location" 
                    className="input-field !pl-14" 
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Enter destination" 
                    className="input-field !pl-14" 
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={handleSearch}
                disabled={loading || !from || !to}
                className="btn-primary py-4 font-black tracking-widest text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>SEARCH ROUTES</span>}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {selectedOption ? 'Route Details' : 'Available Options'}
            </h3>
            {selectedOption && (
              <button 
                onClick={() => setSelectedOption(null)}
                className="text-sm font-black text-primary hover:text-accent transition-colors uppercase tracking-widest bg-secondary/50 px-4 py-2 rounded-xl flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selectedOption ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-[3rem] p-10 space-y-8"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                  <div className="flex items-center space-x-6">
                    <div className={cn("p-6 rounded-[2rem] bg-slate-50 shadow-inner", getColor(selectedOption.type))}>
                      {React.createElement(getIcon(selectedOption.type), { className: "w-12 h-12" })}
                    </div>
                    <div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{selectedOption.type}</h4>
                      <p className="text-xl text-slate-500 font-medium">{selectedOption.route}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-primary tracking-tighter">₹{selectedOption.price}</p>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center justify-end">
                      <Clock className="w-4 h-4 mr-2" /> {selectedOption.time}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h5 className="text-xl font-black text-slate-800 tracking-tight flex items-center">
                    <Shield className="w-6 h-6 mr-3 text-primary" /> Step-by-Step Guide
                  </h5>
                  <div className="space-y-0 relative">
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100" />
                    {selectedOption.detailedSteps?.map((step, i) => (
                      <div key={i} className="relative pl-16 pb-10 last:pb-0">
                        <div className={cn(
                          "absolute left-4 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10",
                          step.isTransfer ? "bg-accent scale-125" : "bg-primary"
                        )} />
                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 hover:border-primary/20 transition-all">
                          <p className="text-lg font-bold text-slate-800 leading-relaxed">{step.instruction}</p>
                          {step.location && (
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" /> {step.location}
                            </p>
                          )}
                          {step.isTransfer && (
                            <span className="inline-block mt-3 px-3 py-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full">
                              Transfer Point
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOption.description && (
                  <div className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/10">
                    <p className="text-slate-600 font-medium leading-relaxed italic">
                      " {selectedOption.description} "
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 gap-6"
              >
                {options.length > 0 ? (
                  options.map((opt, i) => {
                    const Icon = getIcon(opt.type);
                    return (
                      <motion.button 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedOption(opt)}
                        className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg rounded-[2rem] p-8 flex items-center space-x-6 hover:border-primary/30 hover:shadow-xl transition-all group text-left w-full"
                      >
                        <div className={cn("p-5 rounded-[1.5rem] bg-slate-50 group-hover:scale-110 transition-transform shadow-inner", getColor(opt.type))}>
                          <Icon className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{opt.type}</h4>
                            <span className="text-xs font-black text-primary bg-secondary px-3 py-1 rounded-full uppercase tracking-widest">₹{opt.price}</span>
                          </div>
                          <p className="text-slate-500 font-medium line-clamp-2">{opt.route}</p>
                          <div className="flex items-center mt-4 text-sm font-black text-slate-400 uppercase tracking-widest">
                            <Clock className="w-4 h-4 mr-2" /> {opt.time}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="col-span-full py-20 text-center space-y-4 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <Bus className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-slate-500 font-bold">Enter your journey details to find safe routes.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function RiskView({ onBack, onGoToTransport }: { onBack: () => void, onGoToTransport: () => void }) {
  const [location, setLocation] = useState('');
  const [assessment, setAssessment] = useState<SafetyAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleAnalyze = async (locOverride?: string) => {
    const locToUse = locOverride || location;
    if (!locToUse) return;
    setLoading(true);
    try {
      const data = await getSafetyAssessment(locToUse);
      setAssessment(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locString = `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(locString);
        handleAnalyze(locString);
        setLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocating(false);
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-10"
    >
      <div className="flex items-center space-x-6">
        <button onClick={onBack} className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Risk Assessment</h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-[2.5rem] p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Analyze Area</h3>
              <button 
                onClick={handleUseCurrentLocation}
                disabled={locating || loading}
                className="flex items-center space-x-2 text-xs font-black text-primary hover:text-accent transition-colors uppercase tracking-widest bg-secondary/50 px-4 py-2 rounded-xl"
              >
                {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <LocateFixed className="w-3 h-3" />}
                <span>{locating ? 'Locating...' : 'Use Current Location'}</span>
              </button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Enter area name or coordinates" 
                    className="input-field !pl-14" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={() => handleAnalyze()}
                disabled={loading || !location}
                className="btn-primary py-4 font-black tracking-widest text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>ANALYZE SAFETY</span>}
              </button>
            </div>
          </div>

          {assessment && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                <h3 className="text-3xl font-black tracking-tight">Safety Recommendation</h3>
                <p className="text-white/80 text-lg leading-relaxed font-medium">
                  {assessment.recommendation}
                </p>
                <button onClick={onGoToTransport} className="bg-white text-primary px-10 py-4 rounded-2xl font-black tracking-widest text-sm uppercase flex items-center hover:bg-secondary transition-colors shadow-lg">
                  View Safe Transport <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {!assessment && !loading && (
            <div className="aspect-video bg-slate-100 rounded-[3rem] relative overflow-hidden border border-slate-200 flex items-center justify-center shadow-2xl">
              <div className="absolute inset-0 opacity-30">
                 <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-orange-500 rounded-full blur-[120px] animate-pulse" />
                 <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-[120px] animate-pulse" />
              </div>
              <div className="z-10 text-center p-10">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
                <p className="text-2xl font-black text-slate-800 tracking-tight">Safety Analysis</p>
                <p className="text-slate-500 font-medium">Enter a location to see real-time safety insights</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Prone Areas Near You</h3>
          <div className="space-y-6">
            {assessment?.proneAreas.length ? (
              assessment.proneAreas.map((area, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg rounded-[2rem] p-8 flex items-center justify-between hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center space-x-6">
                    <div className={cn(
                      "w-4 h-4 rounded-full",
                      area.risk === 'High' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 
                      area.risk === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                    )} />
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{area.name}</h4>
                      <p className="text-slate-500 font-medium">{area.distance} away</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest",
                    area.risk === 'High' ? 'bg-red-50 text-red-600' : 
                    area.risk === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                  )}>
                    {area.risk} Risk
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4 bg-white/40 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold">No data available. Please run an analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HelplineView({ onBack, userData, onRefresh }: { onBack: () => void, userData: any, onRefresh: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', photo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        setError('Image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewContact({ ...newContact, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        emergencyContacts: arrayUnion(newContact)
      });
      
      setIsAdding(false);
      setNewContact({ name: '', phone: '', email: '', photo: '' });
      onRefresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contact: any) => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        emergencyContacts: arrayRemove(contact)
      });
      onRefresh();
    } catch (err: any) {
      console.error("Delete failed:", err);
    }
  };

  const helplines = [
    { category: 'Emergency Services', numbers: [
      { name: 'National Emergency Number', number: '112', desc: 'All-in-one emergency service' },
      { name: 'Police', number: '100', desc: 'Local law enforcement' },
      { name: 'Ambulance', number: '102', desc: 'Medical emergencies' },
      { name: 'Fire', number: '101', desc: 'Fire and rescue' },
      { name: 'Road Accident Helpline', number: '1073', desc: 'Assistance for road accidents' },
      { name: 'Railway Security/Medical', number: '139', desc: 'Railway assistance & enquiry' },
    ]},
    { category: 'Women & Child Safety', numbers: [
      { name: 'Women Helpline', number: '1091', desc: 'Dedicated women safety line' },
      { name: 'Women Helpline (Domestic Abuse)', number: '181', desc: 'Support for domestic violence' },
      { name: 'Child Helpline', number: '1098', desc: 'Support for children in distress' },
      { name: 'National Commission for Women', number: '7827170170', desc: 'NCW helpline for women' },
      { name: 'Shakti Shalini Helpline', number: '10920', desc: 'Support for women in distress' },
      { name: 'Sakhi Women\'s Helpline', number: '011-24619821', desc: 'One-stop center for women' },
      { name: 'Rape Crisis Helpline', number: '1800-2000-737', desc: 'Support for rape survivors' },
      { name: 'Anti-Obscene Calls Cell', number: '1091', desc: 'Reporting obscene calls' },
      { name: 'SUBHADRA Yojana', number: '14678', desc: 'Women empowerment scheme support' },
    ]},
    { category: 'Specialized Support', numbers: [
      { name: 'Senior Citizen Helpline', number: '14567', desc: 'Support for elderly citizens' },
      { name: 'Cyber Crime Helpline', number: '1930', desc: 'Reporting online fraud/crimes' },
      { name: 'Persons with Disabilities', number: '14456', desc: 'Support for PwD' },
      { name: 'National Human Rights (NHRC)', number: '14433', desc: 'Human rights violation support' },
      { name: 'National Consumer Helpline', number: '1915', desc: 'Consumer grievance redressal' },
      { name: 'National Narcotics (MANAS)', number: '1933', desc: 'Narcotics & drug abuse help' },
      { name: 'PM Daksh Helpline', number: '1800110396', desc: 'Skill development support' },
    ]},
    { category: 'Public Services', numbers: [
      { name: 'UIDAI (Aadhaar)', number: '1947', desc: 'Aadhaar related queries' },
      { name: 'Passport Seva (National)', number: '1800-258-1800', desc: 'Passport related assistance' },
      { name: 'Passport Seva (J&K / NE)', number: '040-66720567', desc: 'Support for J&K and North-East' },
      { name: 'Tourist Helpline', number: '1363', desc: 'Assistance for tourists' },
      { name: 'FSSAI Helpdesk', number: '1800112100', desc: 'Food safety and standards' },
      { name: 'National Scholarship Portal', number: '0120-6619540', desc: 'Technical helpdesk' },
      { name: 'State Bank of India', number: '3800', desc: 'SBI banking support' },
    ]},
    { category: 'Health & Disaster', numbers: [
      { name: 'Covid-19 Helpline', number: '1075', desc: 'Central health helpline' },
      { name: 'LPG Leak Helpline', number: '1906', desc: 'Emergency gas leak response' },
      { name: 'Natural Calamities Relief', number: '1070', desc: 'Relief commissioner support' },
      { name: 'Disaster Management (NDRF)', number: '011-24363260', desc: 'Emergency disaster response' },
    ]}
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <button onClick={onBack} className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Emergency Support</h2>
        </div>
        <a 
          href="https://www.india.gov.in/directory/helpline" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-black text-primary hover:text-accent transition-colors uppercase tracking-widest bg-secondary/50 px-4 py-2 rounded-xl flex items-center w-fit"
        >
          Verify Source: india.gov.in
        </a>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Emergency Contacts</h3>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center space-x-2 text-xs font-black text-primary hover:text-accent transition-colors uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
            </div>

            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border-2 border-primary/20 rounded-[2.5rem] p-8 shadow-xl space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-slate-800">New Contact</h4>
                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleAddContact} className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer group relative shrink-0">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-primary transition-all overflow-hidden">
                          {newContact.photo ? (
                            <img src={newContact.photo} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                          )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                      <div className="flex-1 space-y-4">
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          className="input-field !py-3" 
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          required 
                        />
                        <input 
                          type="tel" 
                          placeholder="Phone Number" 
                          className="input-field !py-3" 
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          required 
                        />
                      </div>
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email (Optional)" 
                      className="input-field !py-3" 
                      value={newContact.email}
                      onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    />
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="btn-primary py-3 font-black tracking-widest text-xs flex items-center justify-center"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE CONTACT'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-6">
              {userData?.emergencyContacts?.length > 0 ? (
                userData.emergencyContacts.map((c: any, i: number) => (
                  <div key={i} className="bg-white/80 backdrop-blur-xl border border-primary/20 shadow-xl rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-primary transition-all">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all overflow-hidden">
                        {c.photo ? (
                          <img src={c.photo} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{c.name}</h4>
                        <div className="flex items-center text-slate-500 font-medium mt-1">
                          <Phone className="w-4 h-4 mr-2" /> {c.phone}
                        </div>
                        {c.email && (
                          <div className="flex items-center text-slate-400 text-sm mt-1">
                            <Mail className="w-4 h-4 mr-2" /> {c.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleDeleteContact(c)}
                        className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all border border-red-100"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => window.location.href = `tel:${c.phone}`}
                        className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:bg-accent transition-all"
                      >
                        <PhoneCall className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center space-y-4">
                  <User className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-slate-500 font-bold">No emergency contacts added yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Public Helplines</h3>
            <div className="space-y-10">
              {helplines.map((cat, idx) => (
                <div key={idx} className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{cat.category}</h4>
                  <div className="grid gap-4">
                    {cat.numbers.map((h, i) => (
                      <div key={i} className="bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg rounded-[2rem] p-8 flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">{h.name}</h4>
                          <p className="text-sm text-slate-500 font-medium">{h.desc}</p>
                          <p className="text-3xl font-black text-primary tracking-tighter mt-2">{h.number}</p>
                        </div>
                        <button 
                          onClick={() => window.location.href = `tel:${h.number}`}
                          className="w-14 h-14 rounded-2xl bg-slate-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-inner"
                        >
                          <PhoneCall className="w-6 h-6" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-accent/5 border border-accent/10 rounded-[3rem] p-12 sticky top-32">
            <h3 className="text-3xl font-black text-accent mb-8 tracking-tight">Safety Protocol</h3>
            <div className="space-y-10">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md font-black text-accent text-xl">1</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-800">Stay Calm</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Take a deep breath. Assess your surroundings and identify the nearest safe exit or public area.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md font-black text-accent text-xl">2</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-800">Trigger SOS</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Use the floating SOS button to immediately notify your contacts and local authorities with your location.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-md font-black text-accent text-xl">3</div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black text-slate-800">Move to Safety</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Follow the safe transport routes provided by the app to reach a secure location or police station.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

