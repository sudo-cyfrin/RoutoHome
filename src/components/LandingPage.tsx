import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, MapPin, Bus, PhoneCall, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLogo } from '../hooks/useLogo';

interface LandingPageProps {
  onGetStarted: () => void;
  key?: string;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [sosActive, setSosActive] = React.useState(false);
  const { logo } = useLogo();

  return (
    <div className="flex flex-col min-h-screen">
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
                <p className="text-slate-500 font-medium leading-relaxed">
                  You are about to trigger an emergency alert. This will notify local authorities and your emergency contacts.
                </p>
              </div>
              <div className="grid gap-4">
                <button 
                  onClick={() => window.location.href = 'tel:100'}
                  className="bg-red-600 text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors flex items-center justify-center group"
                >
                  <PhoneCall className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" /> CALL POLICE (100)
                </button>
                <button 
                  onClick={() => setSosActive(false)}
                  className="bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-40" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] opacity-30" />
        </div>

        <div className="section-container">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              <div className="inline-flex items-center space-x-3 px-6 py-2 bg-white/50 backdrop-blur-sm border border-yellow-200/50 rounded-full text-accent font-black text-xs uppercase tracking-widest shadow-sm">
                <Shield className="w-4 h-4" />
                <span>Next-Gen Personal Safety</span>
              </div>

              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 leading-[0.85] flex flex-col items-center">
                <img 
                  src="/public/logo.png" 
                  alt="RoutoHome Logo"
                  className="h-32 sm:h-48 md:h-72 lg:h-96 w-auto object-contain mb-8"
                />
                <span>Safety First.</span>
              </h1>
              
              <p className="text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
                The intelligent companion for your daily commute. Real-time risk mapping, safe transport routing, and instant emergency response.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button onClick={onGetStarted} className="btn-primary !w-auto px-12 py-5 text-xl font-black tracking-tight flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(255,179,71,0.4)]">
                  GET STARTED NOW <ArrowRight className="ml-3 w-6 h-6" />
                </button>
                <button className="text-slate-400 font-black tracking-widest text-sm hover:text-primary transition-colors flex items-center group">
                  EXPLORE FEATURES <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-12 pt-12">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                    <p className="text-lg font-black text-slate-800 tracking-tight">Real-time Data</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Support</p>
                    <p className="text-lg font-black text-slate-800 tracking-tight">24/7 Response</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-yellow-100/50">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Safety Features Built for You</h2>
            <p className="text-lg text-slate-500">Everything you need to stay safe while traveling, all in one intuitive platform.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Risk Analysis', 
                desc: 'Advanced algorithms to identify high-risk zones in real-time based on local data.', 
                icon: Shield, 
                color: 'bg-red-50 text-red-600' 
              },
              { 
                title: 'Safe Transport', 
                desc: 'Find the safest public transport routes with verified schedules and pricing.', 
                icon: Bus, 
                color: 'bg-orange-50 text-orange-600' 
              },
              { 
                title: 'Emergency Help', 
                desc: 'One-tap access to local helplines and your pre-configured emergency contacts.', 
                icon: PhoneCall, 
                color: 'bg-blue-50 text-blue-600' 
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
