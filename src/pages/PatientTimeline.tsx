import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  FileText, 
  ExternalLink, 
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  Search,
  Filter
} from 'lucide-react';

export default function PatientTimeline() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(recordsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Timeline</h1>
        </div>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Filter size={20} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search records..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 font-medium"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Loading Records</p>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center">
            <FileText size={32} />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-gray-900">No records found</p>
            <p className="text-xs text-gray-500 max-w-[200px]">Upload your first medical report or prescription to start your timeline.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {record.type === 'prescription' ? <ClipboardCheck size={28} /> : <FileText size={28} />}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${record.type === 'prescription' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {record.type}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {formatDate(record.createdAt)}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 truncate mt-1">{record.fileName}</h4>
              </div>

              <a 
                href={record.fileURL} 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <ExternalLink size={18} />
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
