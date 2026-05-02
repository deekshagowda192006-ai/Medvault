/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

// Pages - I'll create these files later
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientTimeline from './pages/PatientTimeline';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientView from './pages/PatientView';
import Navbar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first
    const demoUserStr = localStorage.getItem('demo_user');
    if (demoUserStr) {
      const demoData = JSON.parse(demoUserStr);
      setUser({ uid: demoData.id, email: demoData.email, displayName: demoData.name } as any);
      setUserRole(demoData.role);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {user && <Navbar userRole={userRole} />}
        <main className="flex-1 container mx-auto px-4 py-6 max-w-md">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/onboarding" /> : <Login />} />
            
            <Route path="/onboarding" element={
              user ? (
                userRole ? (
                  userRole === 'patient' ? <Navigate to="/patient/dashboard" /> : <Navigate to="/doctor/dashboard" />
                ) : <Onboarding />
              ) : <Navigate to="/login" />
            } />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              user && userRole === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />
            } />
            <Route path="/patient/upload" element={
              user && userRole === 'patient' ? <PatientUpload /> : <Navigate to="/login" />
            } />
            <Route path="/patient/timeline" element={
              user && userRole === 'patient' ? <PatientTimeline /> : <Navigate to="/login" />
            } />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              user && userRole === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />
            } />
            <Route path="/doctor/patient/:id" element={
              user && userRole === 'doctor' ? <PatientView /> : <Navigate to="/login" />
            } />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
