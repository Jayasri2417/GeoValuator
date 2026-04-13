import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Phone, Lock, MapPin, ShieldCheck, ArrowRight, Loader, CheckCircle } from 'lucide-react';

const Register = ({ onRegister }) => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    preferred_location: ''
  });

  // Flow State
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      // Call parent handler or direct API
      // Using direct API for finer control over response parsing in this new flow
      // But keeping prop capability if App.jsx handles it. 
      // Actually, let's use the prop if passed, but typically we want to handle the specific 'requiresVerification' flag here.
      // Modifying logic to use local fetch if onRegister doesn't return what we need, but let's try to assume onRegister wraps fetch.

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        preferred_location: formData.preferred_location
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.requiresVerification) {
        setUserId(data.userId);
        setStep('otp');
      } else {
        // Fallback if verification not required (unlikely with new controller)
        navigate('/login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // Success!
      // Provide token to App or just redirect to login for clean slate
      // For UX, auto-login is better.
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Force reload/redirect to dashboard
      window.location.href = '/land-intelligence';

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">

        {/* Left Side: Brand & Info */}
        <div className="md:w-5/12 bg-govBlue p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-blue-400 blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">GeoValuator</h1>
                <p className="text-xs text-blue-200 tracking-widest uppercase">Citizen Safety Portal</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 leading-tight">Secure Your<br />Land Assets</h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              Create an account to access AI-powered risk analysis, encroachment monitoring, and certified land valuation services.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs bg-white/5 p-2 rounded border border-white/10">
                <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle size={12} className="text-green-300" /></div>
                <span>Government Grade Security</span>
              </div>
              <div className="flex items-center gap-3 text-xs bg-white/5 p-2 rounded border border-white/10">
                <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle size={12} className="text-green-300" /></div>
                <span>Real-time Alerts</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 md:mt-0">
            <p className="text-xs text-blue-300">© 2024 GeoValuator System</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-8 md:p-12">

          {step === 'register' ? (
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
                <p className="text-sm text-slate-500">Enter your details to register as a citizen.</p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <span className="font-bold">Error:</span> {error}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                      placeholder="e.g. Rajesh Kumar"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Preferred Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="preferred_location"
                      value={formData.preferred_location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                      placeholder="e.g. Suryalanka Beach, Bapatla"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-govBlue/50 focus:border-govBlue transition-all text-sm font-medium"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-govBlue hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Register Account <ArrowRight size={18} /></>}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-govBlue font-bold hover:underline">Sign In</Link>
                </p>
              </div>
            </div>
          ) : (
            // OTP STEP
            <div className="max-w-sm mx-auto text-center pt-8">
              <div className="bg-blue-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6 text-govBlue animate-pulse">
                <Mail size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-500 mb-8">
                We've sent a 6-digit verification code to <span className="font-bold text-slate-700">{formData.email}</span>
              </p>

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-2 border-slate-300 rounded-xl focus:border-govBlue focus:ring-4 focus:ring-blue-50 transition-all text-slate-700 placeholder-slate-300"
                  placeholder="000000"
                  autoFocus
                  required
                />

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Verify & Login'}
                </button>
              </form>

              <button onClick={() => setStep('register')} className="mt-8 text-xs text-slate-400 hover:text-slate-600 underline">
                Entered wrong email? Go back
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
