import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Phone, ShieldCheck, ChevronLeft, Camera } from 'lucide-react';
import { useLogo } from '../hooks/useLogo';

interface AuthProps {
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
}

export default function Auth({ initialMode = 'login', onSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Emergency Contacts
  const { logo } = useLogo();
  
  // Basic Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Emergency Contacts
  const [contact1, setContact1] = useState({ name: '', phone: '', email: '', photo: '' });
  const [contact2, setContact2] = useState({ name: '', phone: '', email: '', photo: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, contactNum: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        setError('Image size should be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (contactNum === 1) {
          setContact1({ ...contact1, photo: base64String });
        } else {
          setContact2({ ...contact2, photo: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBasicSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setStep(2);
  };

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const fullName = `${firstName} ${lastName}`;
      await updateProfile(user, { displayName: fullName });

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        displayName: fullName,
        createdAt: serverTimestamp(),
        emergencyContacts: [contact1, contact2].filter(c => c.name || c.phone)
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent to your email!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <div className="bg-yellow-100/95 backdrop-blur-xl border border-yellow-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] p-8 sm:p-12 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -ml-16 -mb-16" />

        <AnimatePresence mode="wait">
          {mode === 'signup' && step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="relative z-10"
            >
              <button 
                onClick={() => setStep(1)}
                className="flex items-center text-sm font-bold text-slate-400 hover:text-primary mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Emergency Contacts</h2>
                <p className="text-slate-500 font-medium">Add two people we can reach in case of emergency</p>
                <p className="text-xs font-bold text-primary mt-2 uppercase tracking-widest bg-primary/5 py-2 rounded-lg">You can add more contacts later in the Helpline section</p>
              </div>

              <form onSubmit={handleFinalSignup} className="space-y-8">
                {/* Contact 1 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">First Emergency Contact</h3>
                    <label className="cursor-pointer group relative">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-primary transition-all overflow-hidden">
                        {contact1.photo ? (
                          <img src={contact1.photo} alt="Contact 1" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 1)}
                      />
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="input-field"
                      value={contact1.name}
                      onChange={(e) => setContact1({...contact1, name: e.target.value})}
                      required
                    />
                    <input 
                      type="tel" 
                      placeholder="Contact Number" 
                      className="input-field"
                      value={contact1.phone}
                      onChange={(e) => setContact1({...contact1, phone: e.target.value})}
                      required
                    />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email ID" 
                    className="input-field"
                    value={contact1.email}
                    onChange={(e) => setContact1({...contact1, email: e.target.value})}
                  />
                </div>

                {/* Contact 2 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Second Emergency Contact</h3>
                    <label className="cursor-pointer group relative">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 group-hover:border-primary transition-all overflow-hidden">
                        {contact2.photo ? (
                          <img src={contact2.photo} alt="Contact 2" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, 2)}
                      />
                    </label>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="input-field"
                      value={contact2.name}
                      onChange={(e) => setContact2({...contact2, name: e.target.value})}
                      required
                    />
                    <input 
                      type="tel" 
                      placeholder="Contact Number" 
                      className="input-field"
                      value={contact2.phone}
                      onChange={(e) => setContact2({...contact2, phone: e.target.value})}
                      required
                    />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email ID" 
                    className="input-field"
                    value={contact2.email}
                    onChange={(e) => setContact2({...contact2, email: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary py-4 text-lg font-black tracking-tight flex items-center justify-center space-x-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>CONFIRM & SIGN UP</span>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="relative z-10"
            >
              <div className="text-center mb-10">
                <img 
                  src="/public/logo.png" 
                  alt="RoutoHome Logo" 
                  className="h-30 w-auto object-contain mx-auto mb-6"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                  {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h2>
                <p className="text-slate-500 font-medium">
                  {mode === 'login' ? 'Sign in to continue your journey' : mode === 'signup' ? 'Join the RoutoHome community' : 'We\'ll help you get back in'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 text-sm font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start space-x-3 text-green-600 text-sm font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={mode === 'signup' ? handleBasicSignup : mode === 'login' ? handleLogin : handleForgot} className="space-y-6">
                {mode === 'signup' && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Jane" 
                          className="input-field !pl-14" 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe" 
                          className="input-field !pl-14" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                )}

        <div className="space-y-1">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-slate-400" />
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com" 
              className="input-field !pl-14" 
              required 
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="input-field !pl-14" 
                  required 
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Re-enter Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="input-field !pl-14" 
                    required 
                  />
                </div>
              </div>
            )}
          </div>
        )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary py-4 text-lg font-black tracking-tight flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'NEXT' : 'SEND LINK'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 pt-8 border-t border-yellow-200/50 flex flex-col items-center space-y-4">
                {mode === 'login' ? (
                  <>
                    <button onClick={() => setMode('forgot')} className="text-sm font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                      Forgot password?
                    </button>
                    <p className="text-sm text-slate-500 font-bold">
                      Don't have an account? {' '}
                      <button onClick={() => setMode('signup')} className="text-primary hover:text-accent transition-colors underline underline-offset-4">
                        Sign up
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 font-bold">
                    Already have an account? {' '}
                    <button onClick={() => { setMode('login'); setStep(1); }} className="text-primary hover:text-accent transition-colors underline underline-offset-4">
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
