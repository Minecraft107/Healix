import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Mail, Lock, Phone, Shield, UserPlus, CheckCircle } from 'lucide-react';
import { useLanguage, Language } from './LanguageContext';
import { VoiceGuidance } from './VoiceGuidance';
import { toast } from 'sonner';
import logo from '../assets/logo.png';
import { 
  loginWithEmailAndPin, 
  getUserData, 
  sendPINResetEmail 
} from '../lib/firebase';

export function LoginPage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [userMobile, setUserMobile] = useState('');

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const handleEmailPinLogin = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (pin.length !== 6) {
      toast.error('Please enter your 6-digit PIN');
      return;
    }

    setIsVerifying(true);
    try {
      const loginResult = await loginWithEmailAndPin(email, pin);
      
      if (loginResult.success && loginResult.user) {
        const user = loginResult.user;
        const userDataResult = await getUserData(user.uid);
        
        if (userDataResult.success && userDataResult.data) {
          const mobile = userDataResult.data.mobileNumber;
          setUserMobile(mobile);
          setStep(2);
          toast.success(`Verification code sent to ****${mobile.slice(-4)}`);
        } else {
          toast.error('Could not retrieve user data');
        }
      } else {
        toast.error(loginResult.error || 'Invalid email or PIN');
      }
    } catch (error: any) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyMockOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    
    setTimeout(() => {
      toast.success('Verification successful! Welcome to HEALIX');
      setTimeout(() => navigate('/home'), 1000);
      setIsVerifying(false);
    }, 800);
  };

  const handleForgotPin = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await sendPINResetEmail(resetEmail);
      if (result.success) {
        toast.success('PIN reset link sent to your email!');
        setShowForgotPin(false);
        setResetEmail('');
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendMockOtp = () => {
    toast.success(`Verification code resent to ****${userMobile.slice(-4)}`);
  };

  const getVoiceMessage = () => {
    if (showForgotPin) {
      return 'Enter your email address to reset your PIN';
    } else if (step === 1) {
      return 'Please enter your email and PIN to login';
    } else {
      return 'Enter the verification code sent to your mobile number';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HEALIX</h1>
          <p className="text-gray-600 text-lg">Your Digital Path to Better Health</p>
        </div>

       <Card className="shadow-xl border-2">
  <CardHeader className="py-6 border-b-2 bg-gray-50">
    <CardTitle className="text-center">
      <div className="flex items-center justify-center gap-3">
        {showForgotPin && (
          <>
            <Mail className="h-7 w-7 text-blue-600" />
            <span className="text-gray-900 text-2xl font-bold">Reset PIN</span>
          </>
        )}
        {!showForgotPin && step === 1 && (
          <>
            <Lock className="h-7 w-7 text-blue-600" />
            <span className="text-gray-900 text-2xl font-bold">Login to Your Account</span>
          </>
        )}
        {!showForgotPin && step === 2 && (
          <>
            <Phone className="h-7 w-7 text-green-600" />
            <span className="text-gray-900 text-2xl font-bold">Verify Your Identity</span>
          </>
        )}
      </div>
    </CardTitle>
  </CardHeader>


          
          <CardContent className="space-y-4 pt-6">
            {showForgotPin ? (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    Enter your registered email address to receive PIN reset instructions
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="flex items-center gap-2 text-base font-semibold">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="text-lg py-6 border-2"
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleForgotPin}
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold shadow-xl"
                  disabled={isVerifying || !resetEmail}
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowForgotPin(false)}
                  className="w-full py-4 text-base font-semibold border-2"
                >
                  Back to Login
                </Button>
              </>
            ) : (
              <>
                {step === 1 && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-base font-semibold">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-lg py-6 border-2"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pin" className="flex items-center gap-2 text-base font-semibold">
                        <Lock className="h-4 w-4" />
                        6-Digit PIN
                      </Label>
                      <Input
                        id="pin"
                        type="password"
                        placeholder="••••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-2xl py-6 text-center tracking-[0.5em] font-bold border-2"
                      />
                      {pin.length > 0 && (
                        <p className={`text-sm font-bold ${pin.length === 6 ? 'text-green-600' : 'text-blue-600'}`}>
                          {pin.length}/6 digits entered
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleEmailPinLogin}
                      className="w-full py-6 text-xl bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all"
                      disabled={!email || pin.length !== 6 || isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-2" />
                          Continue to Verification
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setShowForgotPin(true)}
                      className="w-full text-base text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Forgot PIN?
                    </Button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-green-900 mb-1 text-lg">
                            Email & PIN Verified!
                          </p>
                          <p className="text-sm text-green-700">
                            Verification code sent to ****{userMobile.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="otp" className="flex items-center gap-2 text-base font-semibold">
                        <Phone className="h-4 w-4" />
                        Enter Verification Code
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="XXXXXX"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-2xl py-6 text-center tracking-[0.5em] font-bold border-2"
                        autoFocus
                        disabled={isVerifying}
                      />
                      {otp.length > 0 && (
                        <p className={`text-sm font-bold ${otp.length === 6 ? 'text-green-600' : 'text-blue-600'}`}>
                          {otp.length}/6 digits entered
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleVerifyMockOtp}
                      className="w-full py-6 text-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all"
                      disabled={otp.length !== 6 || isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Verify & Login
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleResendMockOtp}
                      className="w-full py-4 text-base font-semibold border-2"
                      disabled={isVerifying}
                    >
                      Resend Verification Code
                    </Button>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {!showForgotPin && (
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-base text-gray-700 font-medium">Don't have an account?</p>
                <Button 
                  onClick={() => navigate('/register')}
                  className="w-full py-6 text-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-sm text-gray-600">
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Secure login protected by Firebase
          </p>
        </div>
      </div>
    </div>
  );
}
