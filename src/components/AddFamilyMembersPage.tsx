import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import { getCurrentUser, addFamilyMember, getFamilyMembers } from '../lib/firebase';
import { toast } from 'sonner';

type FamilyForm = {
  name: string;
  gender: string;
  dateOfBirth: string;
  age: string;
  bloodGroup: string;
  height: string;
  weight: string;
  email: string;
  mobileNumber: string;
  aadhaarNumber: string;
  address: string;
  city: string;
  state: string;
  medicalConditions: string;
  allergies: string;
  currentMedications: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
};

const emptyForm: FamilyForm = {
  name: '',
  gender: '',
  dateOfBirth: '',
  age: '',
  bloodGroup: '',
  height: '',
  weight: '',
  email: '',
  mobileNumber: '',
  aadhaarNumber: '',
  address: '',
  city: '',
  state: '',
  medicalConditions: '',
  allergies: '',
  currentMedications: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
};

export function AddFamilyMembersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editMemberId = useMemo(() => (location.state as any)?.editMemberId as string | undefined, [location.state]);

  const [form, setForm] = useState<FamilyForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [existingCustomId, setExistingCustomId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const init = async () => {
      const user = getCurrentUser();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      if (editMemberId) {
        setIsEditing(true);
        // Load member to edit (simple client-side search)
        try {
          const fam = await getFamilyMembers(user.uid);
          const target = (fam || []).find((m: any) => m.id === editMemberId);
          if (target) {
            setForm({
              name: target.name ?? target.fullName ?? '',
              gender: target.gender ?? '',
              dateOfBirth: target.dateOfBirth ?? '',
              age: target.age ?? '',
              bloodGroup: target.bloodGroup ?? '',
              height: target.height ?? '',
              weight: target.weight ?? '',
              email: target.email ?? '',
              mobileNumber: target.mobileNumber ?? target.phoneNumber ?? '',
              aadhaarNumber: target.aadhaarNumber ?? '',
              address: target.address ?? '',
              city: target.city ?? '',
              state: target.state ?? '',
              medicalConditions: target.medicalConditions ?? '',
              allergies: target.allergies ?? '',
              currentMedications: target.currentMedications ?? '',
              emergencyContactName: target.emergencyContactName ?? '',
              emergencyContactNumber: target.emergencyContactNumber ?? '',
            });
            setExistingCustomId(target.customId || undefined);
          } else {
            toast.error('Member not found');
          }
        } catch {
          toast.error('Failed to load member');
        }
      }
    };
    init();
  }, [editMemberId, navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        // Optional: implement updateFamilyMember in lib/firebase and call it here.
        // For now, just add a new entry to demonstrate flow, or skip with toast.
        toast.info('Edit flow not implemented yet. Adding as new entry.');
      }

      // Add new member; lib/firebase will assign unique customId automatically
      await addFamilyMember(user.uid, {
        name: form.name,
        fullName: form.name,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        age: form.age,
        bloodGroup: form.bloodGroup,
        height: form.height,
        weight: form.weight,
        email: form.email,
        mobileNumber: form.mobileNumber,
        aadhaarNumber: form.aadhaarNumber,
        address: form.address,
        city: form.city,
        state: form.state,
        medicalConditions: form.medicalConditions,
        allergies: form.allergies,
        currentMedications: form.currentMedications,
        emergencyContactName: form.emergencyContactName,
        emergencyContactNumber: form.emergencyContactNumber,
      });

      toast.success('Family member saved');
      navigate('/home', { state: { refreshProfiles: true }, replace: true });
    } catch (error) {
      console.error(error);
      toast.error('Failed to save family member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-blue-600 font-medium">
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>

        <Card className="shadow-lg border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditing ? 'Edit Family Member' : 'Add Family Member'}
                </h2>
                {isEditing && existingCustomId && (
                  <p className="text-xs text-gray-500 mt-0.5">ID: {existingCustomId}</p>
                )}
              </div>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              {/* Basic */}
              <div>
                <label className="text-xs font-medium text-gray-600">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Age</label>
                  <input
                    name="age"
                    value={form.age}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="e.g., 34"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Height (cm)</label>
                  <input
                    name="height"
                    value={form.height}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="e.g., 170"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Weight (kg)</label>
                  <input
                    name="weight"
                    value={form.weight}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="e.g., 65"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Mobile</label>
                  <input
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Aadhaar</label>
                  <input
                    name="aadhaarNumber"
                    value={form.aadhaarNumber}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">State</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
              </div>

              {/* Medical */}
              <div>
                <label className="text-xs font-medium text-gray-600">Medical Conditions</label>
                <input
                  name="medicalConditions"
                  value={form.medicalConditions}
                  onChange={onChange}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  placeholder="e.g., Diabetes"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Allergies</label>
                  <input
                    name="allergies"
                    value={form.allergies}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="e.g., Penicillin"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Current Medications</label>
                  <input
                    name="currentMedications"
                    value={form.currentMedications}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="e.g., Metformin"
                  />
                </div>
              </div>

              {/* Emergency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Emergency Contact Name</label>
                  <input
                    name="emergencyContactName"
                    value={form.emergencyContactName}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Emergency Contact Number</label>
                  <input
                    name="emergencyContactNumber"
                    value={form.emergencyContactNumber}
                    onChange={onChange}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Member'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
