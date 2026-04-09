import React from 'react';
import { MapPin, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useLogo } from '../hooks/useLogo';

export default function Footer() {
  const { logo } = useLogo();
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-10">
      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center">
              <img 
                src="/public/logo.png"  
                alt="RoutoHome Logo" 
                className="h-20 w-auto object-contain brightness-0 invert"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Empowering citizens with real-time safety data and intelligent navigation tools. Your journey, secured by technology.
            </p>
            <div className="flex items-center space-x-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <button key={i} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center hover:bg-primary transition-colors">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <ul className="space-y-4 text-slate-400">
              <li><button className="hover:text-primary transition-colors">Safety Map</button></li>
              <li><button className="hover:text-primary transition-colors">Transport Finder</button></li>
              <li><button className="hover:text-primary transition-colors">Emergency Helplines</button></li>
              <li><button className="hover:text-primary transition-colors">Risk Analysis</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Company</h4>
            <ul className="space-y-4 text-slate-400">
              <li><button className="hover:text-primary transition-colors">About Us</button></li>
              <li><button className="hover:text-primary transition-colors">Privacy Policy</button></li>
              <li><button className="hover:text-primary transition-colors">Terms of Service</button></li>
              <li><button className="hover:text-primary transition-colors">Contact Support</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm font-medium">
            © 2026 Route Home. All rights reserved.
          </p>
          <div className="flex items-center space-x-8 text-sm font-bold text-slate-500">
            <button className="hover:text-white transition-colors">Privacy</button>
            <button className="hover:text-white transition-colors">Terms</button>
            <button className="hover:text-white transition-colors">Cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
