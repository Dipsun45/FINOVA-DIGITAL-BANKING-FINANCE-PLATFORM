import React, { useState, useContext } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, CheckCircle2, Save, FileText, HeartHandshake } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, updateUser } = useContext(AuthContext);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || 'Unspecified');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [nationalId, setNationalId] = useState(user?.nationalId || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [country, setCountry] = useState(user?.country || 'United States');
  const [zipCode, setZipCode] = useState(user?.zipCode || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [nomineeName, setNomineeName] = useState(user?.nomineeName || '');
  const [nomineeRelation, setNomineeRelation] = useState(user?.nomineeRelation || 'Spouse');
  const [nomineeAge, setNomineeAge] = useState(user?.nomineeAge || '');
  const [maritalStatus, setMaritalStatus] = useState(user?.maritalStatus || 'Single');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        fullName,
        phone,
        dateOfBirth,
        gender,
        occupation,
        nationalId,
        address,
        city,
        state,
        country,
        zipCode,
        emergencyContact,
        nomineeName,
        nomineeRelation,
        nomineeAge: nomineeAge ? parseInt(nomineeAge) : undefined,
        maritalStatus,
        profileImage
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Full personal details updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to update profile details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
        <div className="flex items-center space-x-4">
          <img
            src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
            alt="User Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/50 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user?.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30">
                USER ID: {user?.userId || 'USR1001'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email} • Role: {user?.role?.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4" />
          <span>FULL KYC VERIFIED</span>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 bg-slate-900/90">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Full Personal Details & Banking Profile</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Fixed User ID</label>
            <input
              type="text"
              value={user?.userId || 'USR1001'}
              readOnly
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-bold text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Unspecified">Unspecified</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Occupation</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">National ID / Aadhar / PAN / SSN</label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
              placeholder="Identification Number"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Marital Status</label>
            <select
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Emergency Contact Phone</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
              placeholder="+1 (555) 999-0000"
            />
          </div>
        </div>

        {/* Address Details */}
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 pt-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Residential Address</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">State / Province</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Zip / Pincode</label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono"
            />
          </div>
        </div>

        {/* Nominee Details */}
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 pt-4 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-cyan-400" />
          <span>Account Nominee Details</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nominee Full Name</label>
            <input
              type="text"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Relationship</label>
            <select
              value={nomineeRelation}
              onChange={(e) => setNomineeRelation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            >
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nominee Age</label>
            <input
              type="number"
              value={nomineeAge}
              onChange={(e) => setNomineeAge(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Updating Details...' : 'Save Full Profile Details'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
