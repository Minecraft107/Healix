// src/components/ProfilePage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Droplet,
  Ruler,
  Weight,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { getCurrentUser, getUserData, getFamilyMembers } from '../lib/firebase';
import { toast } from 'sonner';
import logo from '../assets/logo.png';

type ProfileDoc = {
  id?: string;
  fullName?: string;
  name?: string;
  customId?: string;
  email?: string;
  mobileNumber?: string;
  aadhaarNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  dateOfBirth?: string;
  age?: number | string;
  gender?: string;
  bloodGroup?: string;
  height?: string | number;
  weight?: string | number;
  medicalConditions?: string;
  allergies?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
};

const F = (v: any, fallback = 'Not provided') => (v === undefined || v === null || v === '' ? fallback : v);

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestedProfileId = useMemo(() => (location.state as any)?.profileId as string | undefined, [location.state]);

  const [userProfile, setUserProfile] = useState<ProfileDoc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedProfileId]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Primary user
      if (!requestedProfileId || requestedProfileId === currentUser.uid) {
        const userDataResult = await getUserData(currentUser.uid);
        if (userDataResult.success && userDataResult.data) {
          const base: ProfileDoc = {
            id: currentUser.uid,
            ...userDataResult.data,
            fullName: userDataResult.data.fullName ?? userDataResult.data.name ?? 'User',
            email: userDataResult.data.email ?? userDataResult.data.userEmail,
            customId: userDataResult.data.customId,
          };
          setUserProfile(base);
        } else {
          toast.error('Failed to load profile data');
        }
        return;
      }

      // Family member
      const family = await getFamilyMembers(currentUser.uid);
      const match = (family || []).find((m: any) => m?.id === requestedProfileId);
      if (!match) {
        toast.error('Member not found, showing main profile');
        const userDataFallback = await getUserData(currentUser.uid);
        setUserProfile({
          id: currentUser.uid,
          ...(userDataFallback.success ? userDataFallback.data : {}),
        });
        return;
      }

      const normalized: ProfileDoc = {
        id: match.id,
        customId: match.customId,
        fullName: match.fullName ?? match.name ?? 'Member',
        email: match.email,
        mobileNumber: match.mobileNumber ?? match.phoneNumber,
        aadhaarNumber: match.aadhaarNumber,
        address: match.address,
        city: match.city,
        state: match.state,
        dateOfBirth: match.dateOfBirth,
        age: match.age,
        gender: match.gender,
        bloodGroup: match.bloodGroup,
        height: match.height,
        weight: match.weight,
        medicalConditions: match.medicalConditions,
        allergies: match.allergies,
        currentMedications: match.currentMedications,
        emergencyContactName: match.emergencyContactName,
        emergencyContactNumber: match.emergencyContactNumber,
      };

      setUserProfile(normalized);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">Unable to load profile data</p>
            <button onClick={() => navigate('/home')} className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold">
              Go Back
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-blue-600 font-medium">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <button className="flex items-center gap-2 text-blue-600 font-medium">
            <Volume2 className="h-5 w-5" />
            <span>Replay</span>
          </button>
        </div>

        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <img src={logo} alt="HEALIX Logo" className="h-16 w-16 mx-auto object-contain" />
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        </div>

        {/* Profile Picture Card */}
        <Card className="shadow-lg border-2">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
              {(userProfile.fullName ?? userProfile.name ?? 'U').charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{F(userProfile.fullName ?? userProfile.name ?? 'User')}</h2>
            {F(userProfile.email, '') && <p className="text-sm text-gray-600 mt-1">{F(userProfile.email)}</p>}
            {userProfile.customId && <p className="text-xs text-gray-500 mt-2">ID: {userProfile.customId}</p>}
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-lg border-2">
          <div className="p-5">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </h3>
            <div className="space-y-3">
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={F(userProfile.dateOfBirth)} />
              <InfoRow icon={<User className="h-4 w-4" />} label="Age" value={F(userProfile.age ? `${userProfile.age} years` : '')} />
              <InfoRow icon={<User className="h-4 w-4" />} label="Gender" value={F(userProfile.gender)} />
              <InfoRow icon={<Droplet className="h-4 w-4" />} label="Blood Group" value={F(userProfile.bloodGroup)} />
              <InfoRow icon={<Ruler className="h-4 w-4" />} label="Height" value={F(userProfile.height ? `${userProfile.height} cm` : '')} />
              <InfoRow icon={<Weight className="h-4 w-4" />} label="Weight" value={F(userProfile.weight ? `${userProfile.weight} kg` : '')} />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-lg border-2">
          <div className="p-5">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={F(userProfile.email)} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Mobile" value={F(userProfile.mobileNumber)} />
              <InfoRow icon={<CreditCard className="h-4 w-4" />} label="Aadhaar" value={F(userProfile.aadhaarNumber)} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={F(userProfile.address)} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="City" value={F(userProfile.city)} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="State" value={F(userProfile.state)} />
            </div>
          </div>
        </Card>

        {/* Medical Information */}
        <Card className="shadow-lg border-2">
          <div className="p-5">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Medical Information
            </h3>
            <div className="space-y-3">
              <InfoRow icon={<AlertCircle className="h-4 w-4" />} label="Medical Conditions" value={F(userProfile.medicalConditions, 'None')} />
              <InfoRow icon={<AlertCircle className="h-4 w-4" />} label="Allergies" value={F(userProfile.allergies, 'None')} />
              <InfoRow icon={<AlertCircle className="h-4 w-4" />} label="Current Medications" value={F(userProfile.currentMedications, 'None')} />
            </div>
          </div>
        </Card>

        {/* Emergency Contact */}
        <Card className="shadow-lg border-2">
          <div className="p-5">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-600" />
              Emergency Contact
            </h3>
            <div className="space-y-3">
              <InfoRow icon={<User className="h-4 w-4" />} label="Contact Name" value={F(userProfile.emergencyContactName)} />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Contact Number" value={F(userProfile.emergencyContactNumber)} />
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-500 py-2">Secure profile protected by Firebase</p>
      </div>
    </div>
  );
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
    <div className="text-gray-400 mt-1">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
    </div>
  </div>
);
