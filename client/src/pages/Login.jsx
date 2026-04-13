import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Shield, ArrowRight, Loader } from 'lucide-react';

const Login = ({ onLogin, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resp = await onLogin({
        email: email.trim(),
        password: password.trim()
      });

      if (resp?.success) {
        if (onLoginSuccess) onLoginSuccess(resp.user);
        navigate('/land-intelligence');
      } else {
        setError(resp?.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side: Brand */}
        <div className="md:w-5/12 bg-govBlue p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-blue-400 blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">GeoValuator</h1>
                <p className="text-xs text-blue-200 tracking-widest uppercase">Citizen Safety Portal</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 leading-tight">Welcome<br />Back</h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Sign in to access your dashboard, view live valuations, manage property alerts, and download certified reports.
            </p>
          </div>

          <div className="relative z-10 mt-8 md:mt-0">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
              <p className="text-xs font-medium text-blue-50 mb-1">Latest Update</p>
              <p className="text-[10px] text-blue-200">System upgraded with real-time email verification and enhanced risk analysis.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">

          <div className="max-w-sm mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign In</h2>
              <p className="text-sm text-slate-500">Access your secure account.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                    placeholder="name@example.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Password</label>
                  <a href="#" className="text-xs text-govBlue hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-govBlue hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Sign In <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-govBlue font-bold hover:underline">Register Now</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
