import { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en: {
    // Login Page
    login: 'Login',
    aadhaarNumber: 'Aadhaar Number',
    aadhaarVerification: 'Aadhaar Verification',
    mobileNumber: 'Mobile Number',
    sendOtp: 'Send OTP',
    otpSent: 'OTP sent successfully!',
    otpSentSuccess: 'OTP Sent Successfully!',
    otpSentTo: 'OTP sent to registered mobile ending with',
    enterOtp: 'Enter OTP',
    verifyOtp: 'Verify OTP',
    resendOtp: 'Resend OTP',
    enter12Digit: 'Enter your 12-digit Aadhaar number',
    enter6Digit: 'Enter the 6-digit OTP',
    yourDigitalHealth: 'Your Digital Path to Better Health',
    secureLogin: 'Secure login with Aadhaar-based Authentication',
    protectedByOtp: 'Protected by OTP Verification',
    noAccount: "Don't have an account?",
    registerNew: 'Register as New User',
    register: 'Register',
    
    // Home Page
    welcome: 'Welcome',
    healthcareApp: 'Healthcare App',
    healthcarePolicies: 'Healthcare Policies & Schemes',
    healthcarePoliciesDesc: 'View available health schemes and policies',
    profile: 'Profile',
    profileDesc: 'View your health records and personal information',
    familyMembers: 'Family Members',
    familyMembersDesc: 'Manage family member profiles',
    
    // Other pages
    availableSchemes: 'Available Health Schemes',
    howToApply: 'How to Apply',
    back: 'Back',
    personalInfo: 'Personal Information',
    healthRecords: 'Health Records',
    logout: 'Logout',
  },
  
  hi: {
    // Login Page
    login: 'लॉगिन',
    aadhaarNumber: 'आधार नंबर',
    aadhaarVerification: 'आधार सत्यापन',
    mobileNumber: 'मोबाइल नंबर',
    sendOtp: 'ओटीपी भेजें',
    otpSent: 'ओटीपी सफलतापूर्वक भेजा गया!',
    otpSentSuccess: 'ओटीपी सफलतापूर्वक भेजा गया!',
    otpSentTo: 'पंजीकृत मोबाइल नंबर पर ओटीपी भेजा गया, अंतिम अंक',
    enterOtp: 'ओटीपी दर्ज करें',
    verifyOtp: 'ओटीपी सत्यापित करें',
    resendOtp: 'ओटीपी पुनः भेजें',
    enter12Digit: 'अपना 12 अंकों का आधार नंबर दर्ज करें',
    enter6Digit: '6 अंकों का ओटीपी दर्ज करें',
    yourDigitalHealth: 'बेहतर स्वास्थ्य के लिए आपका डिजिटल मार्ग',
    secureLogin: 'आधार-आधारित प्रमाणीकरण के साथ सुरक्षित लॉगिन',
    protectedByOtp: 'ओटीपी सत्यापन द्वारा सुरक्षित',
    noAccount: 'खाता नहीं है?',
    registerNew: 'नए उपयोगकर्ता के रूप में पंजीकरण करें',
    register: 'पंजीकरण करें',
    
    // Home Page
    welcome: 'स्वागत है',
    healthcareApp: 'स्वास्थ्य सेवा ऐप',
    healthcarePolicies: 'स्वास्थ्य नीतियां और योजनाएं',
    healthcarePoliciesDesc: 'उपलब्ध स्वास्थ्य योजनाओं को देखें',
    profile: 'प्रोफ़ाइल',
    profileDesc: 'अपने स्वास्थ्य रिकॉर्ड देखें',
    familyMembers: 'परिवार के सदस्य',
    familyMembersDesc: 'परिवार के सदस्यों को प्रबंधित करें',
    
    // Other pages
    availableSchemes: 'उपलब्ध स्वास्थ्य योजनाएं',
    howToApply: 'आवेदन कैसे करें',
    back: 'वापस',
    personalInfo: 'व्यक्तिगत जानकारी',
    healthRecords: 'स्वास्थ्य रिकॉर्ड',
    logout: 'लॉगआउट',
  },
  
  ta: {
    // Login Page
    login: 'உள்நுழைவு',
    aadhaarNumber: 'ஆதார் எண்',
    aadhaarVerification: 'ஆதார் சரிபார்ப்பு',
    mobileNumber: 'மொபைல் எண்',
    sendOtp: 'OTP அனுப்பு',
    otpSent: 'OTP வெற்றிகரமாக அனுப்பப்பட்டது!',
    otpSentSuccess: 'OTP வெற்றிகரமாக அனுப்பப்பட்டது!',
    otpSentTo: 'பதிவு செய்யப்பட்ட மொபைல் எண்ணுக்கு OTP அனுப்பப்பட்டது, இறுதி இலக்கங்கள்',
    enterOtp: 'OTP உள்ளிடவும்',
    verifyOtp: 'OTP சரிபார்க்கவும்',
    resendOtp: 'OTP மீண்டும் அனுப்பு',
    enter12Digit: 'உங்கள் 12 இலக்க ஆதார் எண்ணை உள்ளிடவும்',
    enter6Digit: '6 இலக்க OTP உள்ளிடவும்',
    yourDigitalHealth: 'சிறந்த உடல்நலத்திற்கான உங்கள் டிஜிட்டல் பாதை',
    secureLogin: 'ஆதார் அடிப்படையிலான அங்கீகாரத்துடன் பாதுகாப்பான உள்நுழைவு',
    protectedByOtp: 'OTP சரிபார்ப்பால் பாதுகாக்கப்பட்டது',
    noAccount: 'கணக்கு இல்லையா?',
    registerNew: 'புதிய பயனராக பதிவு செய்யவும்',
    register: 'பதிவு செய்யவும்',
    
    // Home Page
    welcome: 'வரவேற்பு',
    healthcareApp: 'சுகாதார பயன்பாடு',
    healthcarePolicies: 'சுகாதார கொள்கைகள் & திட்டங்கள்',
    healthcarePoliciesDesc: 'கிடைக்கக்கூடிய சுகாதார திட்டங்களைக் காண்க',
    profile: 'சுயவிவரம்',
    profileDesc: 'உங்கள் உடல்நல பதிவுகளைக் காண்க',
    familyMembers: 'குடும்ப உறுப்பினர்கள்',
    familyMembersDesc: 'குடும்ப உறுப்பினர்களை நிர்வகிக்கவும்',
    
    // Other pages
    availableSchemes: 'கிடைக்கக்கூடிய சுகாதார திட்டங்கள்',
    howToApply: 'எவ்வாறு விண்ணப்பிப்பது',
    back: 'பின்செல்',
    personalInfo: 'தனிப்பட்ட தகவல்',
    healthRecords: 'உடல்நல பதிவுகள்',
    logout: 'வெளியேறு',
  },
  
  te: {
    // Login Page
    login: 'లాగిన్',
    aadhaarNumber: 'ఆధార్ నంబర్',
    aadhaarVerification: 'ఆధార్ ధృవీకరణ',
    mobileNumber: 'మొబైల్ నంబర్',
    sendOtp: 'OTP పంపండి',
    otpSent: 'OTP విజయవంతంగా పంపబడింది!',
    otpSentSuccess: 'OTP విజయవంతంగా పంపబడింది!',
    otpSentTo: 'నమోదు చేసిన మొబైల్ నంబర్‌కు OTP పంపబడింది, చివరి అంకెలు',
    enterOtp: 'OTP నమోదు చేయండి',
    verifyOtp: 'OTP ధృవీకరించండి',
    resendOtp: 'OTP మళ్లీ పంపండి',
    enter12Digit: 'మీ 12 అంకెల ఆధార్ నంబర్‌ను నమోదు చేయండి',
    enter6Digit: '6 అంకెల OTP నమోదు చేయండి',
    yourDigitalHealth: 'మెరుగైన ఆరోగ్యం కోసం మీ డిజిటల్ మార్గం',
    secureLogin: 'ఆధార్ ఆధారిత ప్రమాణీకరణతో సురక్షిత లాగిన్',
    protectedByOtp: 'OTP ధృవీకరణ ద్వారా రక్షించబడింది',
    noAccount: 'ఖాతా లేదా?',
    registerNew: 'కొత్త వినియోగదారుగా నమోదు చేసుకోండి',
    register: 'నమోదు చేసుకోండి',
    
    // Home Page
    welcome: 'స్వాగతం',
    healthcareApp: 'ఆరోగ్య సంరక్ష యాప్',
    healthcarePolicies: 'ఆరోగ్య విధానాలు & పథకాలు',
    healthcarePoliciesDesc: 'అందుబాటులో ఉన్న ఆరోగ్య పథకాలను చూడండి',
    profile: 'ప్రొఫైల్',
    profileDesc: 'మీ ఆరోగ్య రికార్డులను చూడండి',
    familyMembers: 'కుటుంబ సభ్యులు',
    familyMembersDesc: 'కుటుంబ సభ్యులను నిర్వహించండి',
    
    // Other pages
    availableSchemes: 'అందుబాటులో ఉన్న ఆరోగ్య పథకాలు',
    howToApply: 'ఎలా దరఖాస్తు చేసుకోవాలి',
    back: 'వెనుకకు',
    personalInfo: 'వ్యక్తిగత సమాచారం',
    healthRecords: 'ఆరోగ్య రికార్డులు',
    logout: 'లాగ్అవుట్',
  },
  
  bn: {
    // Login Page
    login: 'লগইন',
    aadhaarNumber: 'আধার নম্বর',
    aadhaarVerification: 'আধার যাচাইকরণ',
    mobileNumber: 'মোবাইল নম্বর',
    sendOtp: 'OTP পাঠান',
    otpSent: 'OTP সফলভাবে পাঠানো হয়েছে!',
    otpSentSuccess: 'OTP সফলভাবে পাঠানো হয়েছে!',
    otpSentTo: 'নিবন্ধিত মোবাইল নম্বরে OTP পাঠানো হয়েছে, শেষ সংখ্যা',
    enterOtp: 'OTP লিখুন',
    verifyOtp: 'OTP যাচাই করুন',
    resendOtp: 'OTP পুনরায় পাঠান',
    enter12Digit: 'আপনার 12 সংখ্যার আধার নম্বর লিখুন',
    enter6Digit: '6 সংখ্যার OTP লিখুন',
    yourDigitalHealth: 'উন্নত স্বাস্থ্যের জন্য আপনার ডিজিটাল পথ',
    secureLogin: 'আধার-ভিত্তিক প্রমাণীকরণের সাথে সুরক্ষিত লগইন',
    protectedByOtp: 'OTP যাচাইকরণ দ্বারা সুরক্ষিত',
    noAccount: 'অ্যাকাউন্ট নেই?',
    registerNew: 'নতুন ব্যবহারকারী হিসাবে নিবন্ধন করুন',
    register: 'নিবন্ধন করুন',
    
    // Home Page
    welcome: 'স্বাগতম',
    healthcareApp: 'স্বাস্থ্যসেবা অ্যাপ',
    healthcarePolicies: 'স্বাস্থ্যসেবা নীতি ও প্রকল্প',
    healthcarePoliciesDesc: 'উপলব্ধ স্বাস্থ্য প্রকল্পগুলি দেখুন',
    profile: 'প্রোফাইল',
    profileDesc: 'আপনার স্বাস্থ্য রেকর্ড দেখুন',
    familyMembers: 'পরিবারের সদস্যরা',
    familyMembersDesc: 'পরিবারের সদস্যদের পরিচালনা করুন',
    
    // Other pages
    availableSchemes: 'উপলব্ধ স্বাস্থ্য প্রকল্পগুলি',
    howToApply: 'কীভাবে আবেদন করবেন',
    back: 'পিছনে',
    personalInfo: 'ব্যক্তিগত তথ্য',
    healthRecords: 'স্বাস্থ্য রেকর্ড',
    logout: 'লগআউট',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
