import React, { useState } from 'react';
import { db, storage, auth } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  FileText, 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  X,
  Type
} from 'lucide-react';

export default function PatientUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !auth.currentUser) return;
    setLoading(true);
    setError('');

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `records/${auth.currentUser.uid}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'records'), {
        patientId: auth.currentUser.uid,
        fileURL,
        type,
        fileName: file.name,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Upload Record</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8"
      >
        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Record Type</label>
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button 
              onClick={() => setType('prescription')}
              className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${type === 'prescription' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              <Type size={16} />
              Prescription
            </button>
            <button 
              onClick={() => setType('report')}
              className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${type === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
            >
              <FileText size={16} />
              Report
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Select File</label>
          {!file ? (
            <label className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center gap-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                <FileUp size={28} />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700">Tap to upload</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG or PNG (Max 5MB)</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} accept="application/pdf,image/*" />
            </label>
          ) : (
            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 truncate">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div className="truncate">
                  <p className="font-bold text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 p-4 rounded-2xl text-red-700 text-sm font-medium">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-2xl text-emerald-700 text-sm font-bold">
            <CheckCircle2 size={24} />
            <p>Uploaded Successfully!</p>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || loading || success}
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <FileUp size={20} />
              Upload Medical Record
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
