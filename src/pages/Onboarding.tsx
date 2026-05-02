import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Droplet, MapPin, GraduationCap, ChevronRight } from 'lucide-react';

export default function Onboarding() {
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || '',
    email: auth.currentUser?.email || '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    degree: ''
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
      }
    };
    checkStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !role) return;

    setLoading(true);
    const commonFields = {
      id: auth.currentUser.uid,
      role,
      name: formData.name,
      email: formData.email,
      address: formData.address,
    };

    const patientFields = role === 'patient' ? {
      age: parseInt(formData.age),
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      sharingEnabled: true
    } : {};

    const doctorFields = role === 'doctor' ? {
      degree: formData.degree
    } : {};

    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        ...commonFields,
        ...patientFields,
        ...doctorFields
      });
      navigate(role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="flex flex-col gap-8 pt-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome</h1>
          <p className="text-gray-500 font-medium">Please choose your account type</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => { setRole('patient'); setStep(2); }}
            className="group flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <User size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">Patient</h3>
              <p className="text-sm text-gray-500">I want to manage my health records</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-500" size={20} />
          </button>

          <button
            onClick={() => { setRole('doctor'); setStep(2); }}
            className="group flex items-center gap-6 p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <GraduationCap size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">Doctor</h3>
              <p className="text-sm text-gray-500">I am a medical professional</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-emerald-500" size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-4 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => setStep(1)} className="text-sm font-bold text-blue-600">Back</button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Step 2 of 2</span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Profile</h1>
        <p className="text-gray-500 font-medium">Fill in your details as a {role}</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6"
      >
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
              required
            />
          </div>
        </div>

        {role === 'patient' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Age</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Blood Group</label>
              <div className="relative">
                <Droplet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium appearance-none"
                  required
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {role === 'doctor' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Medical Degree</label>
            <div className="relative">
              <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
                placeholder="MBBS, MD"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-[1.3rem] text-gray-400" size={18} />
            <textarea 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={3}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium resize-none"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Complete Onboarding'}
        </button>
      </motion.form>
    </div>
  );
}
