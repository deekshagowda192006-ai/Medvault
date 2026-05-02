import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Clock, 
  Shield, 
  ShieldOff, 
  User as UserIcon, 
  QrCode, 
  ChevronRight,
  Info,
  Activity,
  Heart,
  Droplet
} from 'lucide-react';
import Reminders from '../components/Reminders';
import HelthuChat from '../components/HelthuChat';

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        setPatientData(JSON.parse(demoUser));
        setLoading(false);
        return;
      }
      
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setPatientData(userDoc.data());
      }
      setLoading(false);
    };
    fetchPatientData();
  }, []);

  const toggleSharing = async () => {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      const updated = { ...patientData, sharingEnabled: !patientData.sharingEnabled };
      setPatientData(updated);
      localStorage.setItem('demo_user', JSON.stringify(updated));
      return;
    }

    if (!auth.currentUser || !patientData) return;
    const newStatus = !patientData.sharingEnabled;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        sharingEnabled: newStatus
      });
      setPatientData({ ...patientData, sharingEnabled: newStatus });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return null;

  const userId = auth.currentUser?.uid || patientData?.id;
  const doctorViewURL = `${window.location.origin}/doctor/patient/${userId}`;

  return (
    <div className="flex flex-col gap-6 pt-2 pb-24">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
      >
        <div className="relative z-10 space-y-1">
          <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] opacity-80">Dashboard</p>
          <h2 className="text-3xl font-black tracking-tight leading-none">Hello, {patientData?.name.split(' ')[0]}!</h2>
          <p className="text-blue-50 text-sm font-medium opacity-90 pt-1">Stay on top of your health journey.</p>
        </div>
        <Heart className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12" />
        <Activity className="absolute top-4 right-4 text-white/5 w-20 h-20" />
      </motion.div>

      {/* Profile & Vital Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-3"
        >
          <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center">
            <Droplet size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Blood Group</p>
            <p className="text-xl font-black text-gray-900 mt-1">{patientData?.bloodGroup}</p>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-3"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Age</p>
            <p className="text-xl font-black text-gray-900 mt-1">{patientData?.age} <span className="text-[10px] font-bold text-gray-400">Yrs</span></p>
          </div>
        </motion.div>
      </div>

      {/* Reminders Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Reminders />
      </motion.div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/patient/upload"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group hover:border-blue-500 transition-all"
        >
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
            <Upload size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">Upload</h4>
            <p className="text-[10px] text-gray-400 font-medium lowercase">Records/Reports</p>
          </div>
        </Link>
        <Link 
          to="/patient/timeline"
          className="flex flex-col gap-4 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm group hover:border-blue-500 transition-all"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Clock size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">Timeline</h4>
            <p className="text-[10px] text-gray-400 font-medium lowercase">History</p>
          </div>
        </Link>
      </div>

      {/* Sharing Toggle Card */}
      <div className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between shadow-sm ${patientData?.sharingEnabled ? 'bg-emerald-50 border-emerald-100/50' : 'bg-orange-50 border-orange-100/50'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${patientData?.sharingEnabled ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-orange-500 text-white shadow-orange-200'}`}>
            {patientData?.sharingEnabled ? <Shield size={24} /> : <ShieldOff size={24} />}
          </div>
          <div>
            <h3 className={`font-black text-sm uppercase tracking-tight ${patientData?.sharingEnabled ? 'text-emerald-900' : 'text-orange-900'}`}>
              Medical Access
            </h3>
            <p className={`text-[10px] font-bold ${patientData?.sharingEnabled ? 'text-emerald-700' : 'text-orange-700'}`}>
              Sharing is {patientData?.sharingEnabled ? 'Enabled' : 'Paused'}
            </p>
          </div>
        </div>
        <button 
          onClick={toggleSharing}
          className={`w-14 h-8 rounded-full relative transition-all shadow-inner ${patientData?.sharingEnabled ? 'bg-emerald-600' : 'bg-gray-300'}`}
        >
          <motion.div 
            animate={{ x: patientData?.sharingEnabled ? 26 : 4 }}
            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md" 
          />
        </button>
      </div>

      {/* QR Code Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center gap-6">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <QrCode size={18} />
            </div>
            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-[0.2em]">Patient Tag</h3>
          </div>
          <button 
            onClick={() => setShowQR(!showQR)}
            className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${showQR ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}
          >
            {showQR ? 'Hide' : 'Reveal QR'}
          </button>
        </div>
        
        <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden w-full flex flex-col items-center gap-6"
            >
              <div className="p-4 bg-white border-8 border-gray-50 rounded-[2.5rem] shadow-xl">
                <QRCodeSVG value={doctorViewURL} size={180} includeMargin={true} />
              </div>
              <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-3xl">
                <Info className="shrink-0 text-blue-600 mt-0.5" size={16} />
                <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                  Doctors scan this to access your history. You must have sharing enabled for them to view files.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Bot Integration */}
      <HelthuChat />
    </div>
  );
}
