import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import {
  User, Mail, Phone, MapPin, Heart, Shield,
  Upload, Calendar, Droplet, Ruler, Weight,
  AlertCircle, CheckCircle, ArrowLeft, ArrowRight,
  CreditCard, Lock
} from 'lucide-react';
import { useLanguage, Language } from './LanguageContext';
import { VoiceGuidance } from './VoiceGuidance';
import { toast } from 'sonner';
import { registerUser } from '../lib/firebase';
import logo from '../assets/logo.png';

export function RegistrationPage() {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 6-digit PIN state
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const [formData, setFormData] = useState({
    fullName: '',
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
    termsAccepted: false,
    privacyAccepted: false,
    dataConsentAccepted: false,
  });

  // Programmatic navigation helper to legal pages
  const openLegal = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>,
    path: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  }; // [web:66][web:69]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'dateOfBirth' && value) {
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.gender || !formData.dateOfBirth || !formData.bloodGroup) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.email || !formData.mobileNumber || !formData.aadhaarNumber) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (!pin || pin.length !== 6) {
          toast.error('Please enter a 6-digit PIN');
          return false;
        }
        if (pin !== confirmPin) {
          toast.error('PINs do not match');
          return false;
        }
        if (formData.aadhaarNumber.length !== 12) {
          toast.error('Aadhaar number must be 12 digits');
          return false;
        }
        if (formData.mobileNumber.length !== 10) {
          toast.error('Mobile number must be 10 digits');
          return false;
        }
        break;
      case 3:
        if (!formData.emergencyContactName || !formData.emergencyContactNumber) {
          toast.error('Please fill in emergency contact details');
          return false;
        }
        break;
      case 4:
        if (!formData.termsAccepted || !formData.privacyAccepted || !formData.dataConsentAccepted) {
          toast.error('Please accept all consents to continue');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    try {
      const result = await registerUser(formData, photoFile, pin);
      if (result.success) {
        toast.success('Registration successful! Welcome to HEALIX');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVoiceMessage = () => {
    switch (step) {
      case 1:
        return 'Step 1: Please enter your basic personal information';
      case 2:
        return 'Step 2: Please enter your contact information and set your PIN';
      case 3:
        return 'Step 3: Please provide your health and medical details';
      case 4:
        return 'Step 4: Please review and accept the terms';
      default:
        return 'Complete your registration';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <VoiceGuidance message={getVoiceMessage()} autoPlay={true} />
          <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="HEALIX Logo"
              className="h-16 w-16 rounded-full object-cover shadow-lg border-2 border-blue-100"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join HEALIX</h1>
          <p className="text-gray-600 text-lg">Complete your health profile</p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-600">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : ''}>Personal</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : ''}>Contact & PIN</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : ''}>Health</span>
            <span className={step >= 4 ? 'text-blue-600 font-medium' : ''}>Consent</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              {step === 1 && <><User className="h-5 w-5" /> Personal Information</>}
              {step === 2 && <><Lock className="h-5 w-5" /> Contact & Security PIN</>}
              {step === 3 && <><Heart className="h-5 w-5" /> Health Details</>}
              {step === 4 && <><Shield className="h-5 w-5" /> Consent</>}
            </CardTitle>
            <p className="text-center text-sm text-gray-500">Step {step} of {totalSteps}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Photo</span>
                    </div>
                    <Input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </Label>
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="py-3" />
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value: string) => handleSelectChange('gender', value)}>
                    <SelectTrigger className="py-3">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dateOfBirth" className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />Date of Birth *
                    </Label>
                    <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} className="py-3" />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-sm">Age</Label>
                    <Input id="age" name="age" value={formData.age} readOnly placeholder="Auto" className="bg-gray-50 py-3" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bloodGroup" className="flex items-center gap-1">
                    <Droplet className="h-4 w-4" />Blood Group *
                  </Label>
                  <Select value={formData.bloodGroup} onValueChange={(value: string) => handleSelectChange('bloodGroup', value)}>
                    <SelectTrigger className="py-3">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="height" className="flex items-center gap-1 text-sm">
                      <Ruler className="h-3 w-3" />Height (cm)
                    </Label>
                    <Input id="height" name="height" type="number" value={formData.height} onChange={handleInputChange} placeholder="170" className="py-3" />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="flex items-center gap-1 text-sm">
                      <Weight className="h-3 w-3" />Weight (kg)
                    </Label>
                    <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleInputChange} placeholder="70" className="py-3" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />Email ID *
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" className="py-3" />
                </div>

                <div>
                  <Label htmlFor="mobileNumber" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />Mobile Number *
                  </Label>
                  <Input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit number" maxLength={10} className="py-3" />
                </div>

                <div>
                  <Label htmlFor="aadhaarNumber" className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />Aadhaar Number *
                  </Label>
                  <Input id="aadhaarNumber" name="aadhaarNumber" type="text" value={formData.aadhaarNumber} onChange={handleInputChange} placeholder="12-digit Aadhaar" maxLength={12} className="py-3" />
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />Address
                  </Label>
                  <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Your address" rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city" className="text-sm">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="py-3" />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="py-3" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-900 font-medium text-center mb-3">
                    Set your 6-digit security PIN
                  </p>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="pin" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />Create PIN *
                      </Label>
                      <Input
                        id="pin"
                        type="password"
                        placeholder="••••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-lg py-3 text-center tracking-[0.5em] font-semibold"
                      />
                      {pin.length > 0 && (
                        <p className={`text-xs mt-1 font-medium ${pin.length === 6 ? 'text-green-600' : 'text-blue-600'}`}>
                          {pin.length}/6
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPin">Confirm PIN *</Label>
                      <Input
                        id="confirmPin"
                        type="password"
                        placeholder="••••••"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-lg py-3 text-center tracking-[0.5em] font-semibold"
                      />
                      {confirmPin.length > 0 && (
                        <p className={`text-xs mt-1 font-medium ${confirmPin.length === 6 ? 'text-green-600' : 'text-blue-600'}`}>
                          {confirmPin.length}/6
                        </p>
                      )}
                    </div>

                    {pin && confirmPin && (
                      <div className={`${pin === confirmPin ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} border rounded-lg p-2`}>
                        <p className={`text-sm text-center flex items-center justify-center gap-2 ${pin === confirmPin ? 'text-green-800' : 'text-red-800'}`}>
                          {pin === confirmPin ? (
                            <><CheckCircle className="h-4 w-4" />PINs match!</>
                          ) : (
                            <><AlertCircle className="h-4 w-4" />PINs do not match</>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <Lock className="h-3 w-3 inline mr-1" />
                    You'll use this 6-digit PIN to login to your account
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="medicalConditions" className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />Medical Conditions
                  </Label>
                  <Textarea id="medicalConditions" name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} placeholder="Diabetes, BP, etc." rows={2} />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if none</p>
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea id="allergies" name="allergies" value={formData.allergies} onChange={handleInputChange} placeholder="Penicillin, Peanuts, etc." rows={2} />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if none</p>
                </div>

                <div>
                  <Label htmlFor="currentMedications">Current Medications</Label>
                  <Textarea id="currentMedications" name="currentMedications" value={formData.currentMedications} onChange={handleInputChange} placeholder="List medications" rows={2} />
                  <p className="text-xs text-gray-500 mt-1">Leave blank if none</p>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-red-900 flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4" />Emergency Contact
                  </h3>
                  <div>
                    <Label htmlFor="emergencyContactName" className="text-sm">Contact Name *</Label>
                    <Input id="emergencyContactName" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} placeholder="Name" className="py-3" />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactNumber" className="text-sm">Contact Number *</Label>
                    <Input id="emergencyContactNumber" name="emergencyContactNumber" type="tel" value={formData.emergencyContactNumber} onChange={handleInputChange} placeholder="10-digit number" maxLength={10} className="py-3" />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-sm text-blue-900">Please accept all terms to complete registration</p>
                </div>

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange('termsAccepted', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms" className="cursor-pointer font-medium text-sm">Terms & Conditions *</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I agree to the terms of service.{' '}
                      <button
                        type="button"
                        className="underline text-blue-600 hover:text-blue-700"
                        onClick={(e) => openLegal(e, '/legal/terms')}
                        aria-label="View Terms and Conditions"
                      >
                        View
                      </button>
                    </p>
                  </div>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacyAccepted}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange('privacyAccepted', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="privacy" className="cursor-pointer font-medium text-sm">Privacy Policy *</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I accept the privacy policy.{' '}
                      <button
                        type="button"
                        className="underline text-blue-600 hover:text-blue-700"
                        onClick={(e) => openLegal(e, '/legal/privacy')}
                        aria-label="View Privacy Policy"
                      >
                        View
                      </button>
                    </p>
                  </div>
                </div>

                {/* Health Data Consent */}
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id="dataConsent"
                    checked={formData.dataConsentAccepted}
                    onCheckedChange={(checked: boolean) => handleCheckboxChange('dataConsentAccepted', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="dataConsent" className="cursor-pointer font-medium text-sm">Health Data Consent *</Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Data will be securely stored.{' '}
                      <button
                        type="button"
                        className="underline text-blue-600 hover:text-blue-700"
                        onClick={(e) => openLegal(e, '/legal/consent')}
                        aria-label="View Health Data Consent"
                      >
                        View
                      </button>
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-green-900 text-sm mb-1">Ready to Register!</h4>
                      <ul className="text-xs text-green-800 space-y-0.5">
                        <li>✓ Personal info completed</li>
                        <li>✓ Contact & PIN set</li>
                        <li>✓ Health profile created</li>
                        <li>✓ All consents provided</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={step === 1 ? () => navigate('/login') : handlePrevious}
                disabled={isSubmitting}
                className="py-4 px-6 text-base font-semibold border-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step === 1 ? 'Back to Login' : 'Previous'}
              </Button>

              {step < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="py-4 px-6 text-base bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold shadow-lg"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="py-6 px-8 text-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          <p>Your data is encrypted and securely stored</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />Protected by Firebase Security
          </p>
        </div>
      </div>
    </div>
  );
}
