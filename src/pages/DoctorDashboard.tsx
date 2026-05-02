import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  UserSearch, 
  ClipboardList, 
  ScanLine, 
  ArrowRight, 
  Stethoscope,
  X,
  Camera,
  History,
  Activity
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function DoctorDashboard() {
  const [patientId, setPatientId] = useState('');
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        if (decodedText.includes('/doctor/patient/')) {
          const id = decodedText.split('/').pop();
          if (id) {
            scanner?.clear();
            setScanning(false);
            navigate(`/doctor/patient/${id}`);
          }
        } else {
          scanner?.clear();
          setScanning(false);
          navigate(`/doctor/patient/${decodedText}`);
        }
      }, (error) => {
        // console.warn(error);
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [scanning, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 pt-4 pb-20">
      {/* Doctor Info Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-1">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Provider Portal</p>
          <h2 className="text-3xl font-black tracking-tight leading-none text-white">MedVault Pro</h2>
          <p className="text-emerald-50 text-sm font-medium opacity-90 pt-1">Secure clinical data access.</p>
        </div>
        <Stethoscope className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12" />
        <Activity className="absolute top-4 right-4 text-white/5 w-20 h-20" />
      </motion.div>

      {/* Main Search/Scan Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8"
      >
        {!scanning ? (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Access Patient File</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none">Choose Access Method</p>
            </div>

            <div className="grid gap-4">
              <button 
                onClick={() => setScanning(true)}
                className="w-full bg-emerald-600 text-white py-6 rounded-[2rem] font-bold shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Camera size={24} />
                </div>
                <span>Scan Patient QR</span>
              </button>

              <div className="relative flex items-center gap-4 text-gray-200">
                <div className="flex-1 h-[1px] bg-gray-100"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">or use id</span>
                <div className="flex-1 h-[1px] bg-gray-100"></div>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter Patient ID..."
                    className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-[2rem] outline-none text-gray-700 font-bold transition-all"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-white border-2 border-emerald-600 text-emerald-600 py-5 rounded-[2rem] font-black hover:bg-emerald-50 transition-all active:scale-[0.98]"
                >
                  Manual Lookup
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">QR Scanner</h3>
              <button 
                onClick={() => setScanning(false)}
                className="p-2 bg-gray-100 rounded-xl text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-gray-100 rounded-[2rem] border-4 border-emerald-50 shadow-inner min-h-[300px]">
              <div id="reader"></div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats/History Mini Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center gap-4 group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110">
            <History size={24} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">0</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Recents</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col items-center gap-4 group opacity-50">
          <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">--</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
}
