import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  User, 
  ShieldOff, 
  ArrowLeft, 
  FileText, 
  ClipboardCheck, 
  Calendar, 
  ExternalLink,
  MapPin,
  Droplet
} from 'lucide-react';

export default function PatientView() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError('');

      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        
        if (!patientDoc.exists()) {
          setError('Patient not found');
          return;
        }

        const patientData = patientDoc.data();
        
        if (!patientData.sharingEnabled) {
          setError('Access Denied: Patient has disabled data sharing');
          return;
        }

        setPatient(patientData);

        // Fetch records
        const q = query(
          collection(db, 'records'),
          where('patientId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const recordsSnapshot = await getDocs(q);
        setRecords(recordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error(err);
        setError('You do not have permission to view this patient');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '---';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Verifying Access</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 pt-4">
        <button onClick={() => navigate('/doctor/dashboard')} className="flex items-center gap-2 text-sm font-bold text-gray-500">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="bg-white p-10 rounded-3xl border border-orange-100 shadow-sm text-center flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center">
            <ShieldOff size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-gray-900">Access Restricted</h2>
            <p className="text-sm text-gray-500 max-w-[240px] mx-auto leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            className="w-full bg-gray-50 text-gray-900 py-4 rounded-2xl font-bold border border-gray-100 hover:bg-gray-100 transition-all"
          >
            Try another ID
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/doctor/dashboard')} className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-gray-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Patient Record</h1>
      </div>

      {/* Patient Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{patient.name}</h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">ID: {id?.slice(0, 8)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
            <Calendar className="text-gray-400" size={18} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Age</p>
              <p className="text-sm font-bold text-gray-900">{patient.age} Years</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
            <Droplet className="text-red-400" size={18} />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Blood</p>
              <p className="text-sm font-bold text-gray-900">{patient.bloodGroup}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-2xl">
          <MapPin className="text-gray-400 mt-1 shrink-0" size={18} />
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Address</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">{patient.address}</p>
          </div>
        </div>
      </motion.div>

      {/* Medical Timeline */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medical History</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{records.length} Documents</span>
        </div>

        {records.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center text-gray-400 text-sm font-medium italic">
            No records found for this patient
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {record.type === 'prescription' ? <ClipboardCheck size={24} /> : <FileText size={24} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mb-1">
                    <Calendar size={10} />
                    {formatDate(record.createdAt)}
                  </span>
                  <p className="font-bold text-gray-900 text-sm truncate">{record.fileName}</p>
                </div>

                <a 
                  href={record.fileURL} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <ExternalLink size={18} />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
