import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Trash2, CheckCircle2, Clock, X, Pill } from 'lucide-react';

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMedicine, setNewMedicine] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReminders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newMedicine || !newTime) return;

    try {
      await addDoc(collection(db, 'reminders'), {
        userId: auth.currentUser.uid,
        medicine: newMedicine,
        time: newTime,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setNewMedicine('');
      setNewTime('');
      setShowAdd(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComplete = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'reminders', id), { completed: !current });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Health Reminders</h3>
        <button 
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-white p-5 rounded-3xl border border-blue-100 shadow-sm space-y-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">New Medicine</span>
                <button type="button" onClick={() => setShowAdd(false)} className="text-gray-400"><X size={16} /></button>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Medicine Name (e.g. Paracetamol)"
                  value={newMedicine}
                  onChange={(e) => setNewMedicine(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  required
                />
                <input 
                  type="time" 
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  required
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                  Save Reminder
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {reminders.length === 0 && !loading && (
          <div className="bg-white p-6 rounded-3xl border border-gray-50 text-center flex flex-col items-center gap-3">
            <Bell className="text-gray-200" size={24} />
            <p className="text-xs text-gray-400 font-medium">No reminders set. Add your medicine schedule here.</p>
          </div>
        )}

        {reminders.map((reminder) => (
          <motion.div 
            key={reminder.id}
            layout
            className={`p-4 rounded-3xl border flex items-center gap-4 transition-all ${reminder.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-blue-50 shadow-sm'}`}
          >
            <button 
              onClick={() => toggleComplete(reminder.id, reminder.completed)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${reminder.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}
            >
              <CheckCircle2 size={24} className={reminder.completed ? 'opacity-100' : 'opacity-20'} />
            </button>

            <div className="flex-1">
              <h4 className={`font-bold text-sm ${reminder.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{reminder.medicine}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock size={12} className={reminder.completed ? 'text-gray-300' : 'text-blue-500'} />
                <span className={`text-[10px] font-bold ${reminder.completed ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-widest`}>
                  Today, {reminder.time}
                </span>
              </div>
            </div>

            <button 
              onClick={() => handleDelete(reminder.id)}
              className="p-2 text-gray-300 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
