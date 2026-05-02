import { LogOut, Home, ClipboardList, Upload, User as UserIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  userRole: string | null;
}

export default function Navbar({ userRole }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('demo_user');
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm px-4 py-3 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between max-w-md">
        <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <ClipboardList size={18} />
          </div>
          MedVault
        </Link>
        <div className="flex items-center gap-4">
          {userRole === 'patient' && (
            <div className="flex items-center gap-3">
              <Link to="/patient/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Home size={22} />
              </Link>
            </div>
          )}
          {userRole === 'doctor' && (
            <div className="flex items-center gap-3">
              <Link to="/doctor/dashboard" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Home size={22} />
              </Link>
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
}
