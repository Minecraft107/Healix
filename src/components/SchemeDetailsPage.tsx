import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Phone, 
  MapPin, 
  Download,
  AlertCircle,
  Users,
  IndianRupee,
  Calendar,
  FileText
} from 'lucide-react';
import { useLanguage } from './LanguageContext';

const schemeDetails: Record<number, any> = {
  1: {
    title: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    titleHi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
    titleMl: 'ആയുഷ്മാൻ ഭാരത് പ്രധാനമന്ത്രി ജൻ ആരോഗ്യ യോജന',
    description: 'Free healthcare coverage up to ₹5 lakh per family per year',
    descriptionHi: 'प्रति परिवार प्रति वर्ष ₹5 लाख तक का मुफ्त स्वास्थ्य कवरेज',
    descriptionMl: 'പ്രതി കുടുംബത്തിന് പ്രതിവർഷം ₹5 ലക്ഷം വരെ സൗജന്യ ആരോഗ്യ കവറേജ്',
    coverage: '₹5,00,000',
    processingTime: '15-30 days',
    eligibility: {
      en: ['Annual family income below ₹2.5 lakh', 'BPL card holder', 'Listed in SECC 2011 database'],
      hi: ['वार्षिक पारिवारिक आय ₹2.5 लाख से कम', 'BPL कार्ड धारक', 'SECC 2011 डेटाबेस में सूचीबद्ध'],
      ml: ['വാർഷിക കുടുംബ വരുമാനം ₹2.5 ലക്ഷത്തിൽ താഴെ', 'BPL കാർഡ് ഉടമ', 'SECC 2011 ഡാറ്റാബേസിൽ ലിസ്റ്റ് ചെയ്തിട്ടുള്ളത്']
    },
    documents: {
      en: ['Aadhaar Card', 'Ration Card', 'Income Certificate', 'Bank Account Details', 'Mobile Number'],
      hi: ['आधार कार्ड', 'राशन कार्ड', 'आय प्रमाण पत्र', 'बैंक खाते की जानकारी', 'मोबाइल नंबर'],
      ml: ['ആധാർ കാർഡ്', 'റേഷൻ കാർഡ്', 'വരുമാന സർട്ടിഫിക്കറ്റ്', 'ബാങ്ക് അക്കൗണ്ട് വിശദാംശങ്ങൾ', 'മൊബൈൽ നമ്പർ']
    },
    steps: {
      en: [
        'Visit nearest Common Service Center (CSC)',
        'Fill application form with required details',
        'Submit documents for verification',
        'Biometric authentication',
        'Pay application fee (if applicable)',
        'Receive acknowledgment receipt',
        'Wait for verification process',
        'Collect Ayushman card from CSC'
      ],
      hi: [
        'निकटतम कॉमन सर्विस सेंटर (CSC) पर जाएं',
        'आवश्यक विवरण के साथ आवेदन पत्र भरें',
        'सत्यापन के लिए दस्तावेज जमा करें',
        'बायोमेट्रिक प्रमाणीकरण',
        'आवेदन शुल्क का भुगतान करें (यदि लागू हो)',
        'पावती रसीद प्राप्त करें',
        'सत्यापन प्रक्रिया की प्रतीक्षा करें',
        'CSC से आयुष्मान कार्ड एकत्र करें'
      ],
      ml: [
        'അടുത്തുള്ള കോമൺ സർവീസ് സെന്റർ (CSC) സന്ദർശിക്കുക',
        'ആവശ്യമായ വിവരങ്ങൾ സഹിതം അപേക്ഷാ ഫോം പൂരിപ്പിക്കുക',
        'സാക്ഷ്യപത്രീകരണത്തിനായി രേഖകൾ സമർപ്പിക്കുക',
        'ബയോമെട്രിക് ആധികാരികത',
        'അപേക്ഷാ ഫീസ് അടയ്ക്കുക (ബാധകമെങ്കിൽ)',
        'സ്വീകാര്യത രസീത് സ്വീകരിക്കുക',
        'സാക്ഷ്യപത്രീകരണ പ്രക്രിയയ്ക്കായി കാത്തിരിക്കുക',
        'CSC-യിൽ നിന്ന് ആയുഷ്മാൻ കാർഡ് ശേഖരിക്കുക'
      ]
    }
  },
  4: {
    title: 'Janani Suraksha Yojana (JSY)',
    titleHi: 'जननी सुरक्षा योजना (JSY)',
    titleMl: 'ജനനി സുരക്ഷാ യോജന (JSY)',
    description: 'Cash assistance for institutional delivery and postnatal care',
    descriptionHi: 'संस्थागत प्रसव और प्रसवोत्तर देखभाल के लिए नकद सहायता',
    descriptionMl: 'സ്ഥാപനപരമായ പ്രസവത്തിനും പ്രസവാനന്തര പരിചരണത്തിനുമുള്ള പണ സഹായം',
    coverage: '₹1,000 - ₹1,400',
    processingTime: 'Immediate',
    eligibility: {
      en: ['Pregnant woman', 'BPL family', 'Age 19 years or above'],
      hi: ['गर्भवती महिला', 'BPL परिवार', '19 वर्ष या उससे अधिक आयु'],
      ml: ['ഗർഭിണി', 'BPL കുടുംബം', '19 വയസ് അല്ലെങ്കിൽ അതിനു മുകളിൽ പ്രായം']
    },
    documents: {
      en: ['Aadhaar Card', 'BPL Card', 'Pregnancy Certificate', 'Bank Account Details'],
      hi: ['आधार कार्ड', 'BPL कार्ड', 'गर्भावस्था प्रमाण पत्र', 'बैंक खाते की जानकारी'],
      ml: ['ആധാർ കാർഡ്', 'BPL കാർഡ്', 'ഗർഭാവസ്ഥാ സർട്ടിഫിക്കറ്റ്', 'ബാങ്ക് അക്കൗണ്ട് വിശദാംശങ്ങൾ']
    },
    steps: {
      en: [
        'Register during pregnancy with ASHA/ANM at Anganwadi/PHC',
        'Complete required ANC check-ups',
        'Deliver at a government facility',
        'Submit bank details for incentive',
        'Continue postnatal care follow-ups'
      ],
      hi: [
        'गर्भावस्था में आंगनवाड़ी/पीएचसी पर आशा/एएनएम के साथ पंजीकरण करें',
        'आवश्यक एएनसी जांच पूरी करें',
        'सरकारी संस्थान में प्रसव करें',
        'प्रोत्साहन के लिए बैंक विवरण जमा करें',
        'प्रसवोत्तर फॉलो-अप जारी रखें'
      ],
      ml: [
        'ഗർഭകാലത്ത് അങ്കൺവാടി/പിഎച്ച്‌സിയിൽ ആശ/എഎൻഎമ്മുമായി രജിസ്റ്റർ ചെയ്യുക',
        'ആവശ്യമായ ANC പരിശോധനകൾ പൂർത്തിയാക്കുക',
        'സർക്കാർ ആശുപത്രിയിൽ പ്രസവിക്കുക',
        'പ്രോത്സാഹനത്തിന് ബാങ്ക് വിശദാംശങ്ങൾ സമർപ്പിക്കുക',
        'പ്രസവാനന്തര ഫോളോ-അപ്പ് തുടരുക'
      ]
    }
  },
  5: {
    title: 'Central Government Health Scheme (CGHS)',
    titleHi: 'केन्द्रीय सरकार स्वास्थ्य योजना (CGHS)',
    titleMl: 'കേന്ദ്ര സർക്കാർ ഹെൽത്ത് സ്കീം (CGHS)',
    description: 'Comprehensive OPD and hospitalization at CGHS wellness centres and empanelled hospitals',
    descriptionHi: 'सीजिएचएस वेलनेस सेंटर और सूचीबद्ध अस्पतालों में व्यापक ओपीडी व अस्पताल में भर्ती सुविधा',
    descriptionMl: 'CGHS വെൽനെസ് കേന്ദ്രങ്ങളിലും എമ്പാനല്ഡ് ആശുപത്രികളിലുമായി സമഗ്ര OPD, ഐപിഡി സൗകര്യങ്ങൾ',
    coverage: 'Cashless OPD/IPD (empanelled)',
    processingTime: '7-15 days',
    eligibility: {
      en: ['Central Govt employee/pensioner', 'Residing in CGHS covered city', 'Dependent family as per CGHS rules'],
      hi: ['केंद्रीय सरकारी कर्मचारी/पेंशनर', 'CGHS कवर शहर में निवास', 'सीजिएचएस नियमों अनुसार आश्रित परिवार'],
      ml: ['കേന്ദ്ര സർക്കാർ ജീവനക്കാരൻ/പെൻഷൻധാരകൻ', 'CGHS ഉൾപ്പെടുന്ന നഗരത്തിൽ താമസം', 'CGHS നിയമപ്രകാരം ആശ്രിത കുടുംബം']
    },
    documents: {
      en: ['Employee ID/PPO', 'Aadhaar', 'Photograph', 'Residence Proof', 'Dependents proof'],
      hi: ['कर्मचारी आईडी/पीपीओ', 'आधार', 'फोटो', 'निवास प्रमाण', 'आश्रितों का प्रमाण'],
      ml: ['എംപ്ലോയി ഐഡി/PPO', 'ആധാർ', 'ഫോട്ടോ', 'റസിഡൻസ് പ്രൂഫ്', 'ആശ്രിതരുടെ തെളിവ്']
    },
    steps: {
      en: [
        'Register on CGHS portal',
        'Submit application with documents',
        'Pay applicable contribution',
        'Collect CGHS card',
        'Avail services at CGHS/empanelled centres'
      ],
      hi: [
        'CGHS पोर्टल पर पंजीकरण करें',
        'दस्तावेजों सहित आवेदन जमा करें',
        'योगदान राशि भुगतान करें',
        'CGHS कार्ड प्राप्त करें',
        'CGHS/सूचीबद्ध केंद्रों पर सेवाएं लें'
      ],
      ml: [
        'CGHS പോർട്ടലിൽ രജിസ്റ്റർ ചെയ്യുക',
        'രേഖകളോട് കൂടി അപേക്ഷ സമർപ്പിക്കുക',
        'ബാധകമായ സംഭാവന അടയ്ക്കുക',
        'CGHS കാർഡ് ലഭിക്കുക',
        'CGHS/എമ്പാനല്ഡ് കേന്ദ്രങ്ങളിൽ സേവനങ്ങൾ ഉപയോഗിക്കുക'
      ]
    }
  },
  6: {
    title: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    titleHi: 'प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY)',
    titleMl: 'പ്രധാനമന്ത്രി സുരക്ഷ ബീമ യോജന (PMSBY)',
    description: 'Low-cost accident insurance for death or disability',
    descriptionHi: 'मृत्यु या अपंगता हेतु कम लागत का दुर्घटना बीमा',
    descriptionMl: 'മരണം അല്ലെങ്കിൽ അശക്തതയ്ക്ക് കുറഞ്ഞ ചെലവിലെ അപകട ഇൻഷുറൻസ്',
    coverage: '₹2,00,000 (accident)',
    processingTime: 'Immediate',
    eligibility: {
      en: ['Age 18–70 years', 'Savings bank account', 'Consent for auto-debit'],
      hi: ['आयु 18–70 वर्ष', 'सेविंग्स बैंक खाता', 'ऑटो-डेबिट हेतु सहमति'],
      ml: ['പ്രായം 18–70 വയസ്', 'സേവിംഗ്സ് ബാങ്ക് അക്കൗണ്ട്', 'ഓട്ടോ-ഡെബിറ്റിന് സമ്മതം']
    },
    documents: {
      en: ['Bank account details', 'Aadhaar (preferred)', 'Mobile number'],
      hi: ['बैंक खाता विवरण', 'आधार (वांछनीय)', 'मोबाइल नंबर'],
      ml: ['ബാങ്ക് അക്കൗണ്ട് വിശദാംശങ്ങൾ', 'ആധാർ (ആവശ്യാനുസരണം)', 'മൊബൈൽ നമ്പർ']
    },
    steps: {
      en: [
        'Visit bank or enroll via net/mobile banking',
        'Provide consent for auto-debit',
        'Confirm enrollment and receive acknowledgment',
        'Coverage starts after premium debit'
      ],
      hi: [
        'बैंक जाएं या नेट/मोबाइल बैंकिंग से नामांकन करें',
        'ऑटो-डेबिट के लिए सहमति दें',
        'नामांकन की पुष्टि और रसीद प्राप्त करें',
        'प्रीमियम कटने के बाद कवरेज शुरू'
      ],
      ml: [
        'ബാങ്ക് സന്ദർശിക്കുക അല്ലെങ്കിൽ നെറ്റ്/മൊബൈൽ ബാങ്കിംഗ് വഴി ചേർക്കുക',
        'ഓട്ടോ-ഡെബിറ്റിന് സമ്മതം നൽകുക',
        'നാമനിർദ്ദേശം സ്ഥിരീകരണവും രസീതും ലഭിക്കും',
        'പ്രീമിയം ഡെബിറ്റ് കഴിഞ്ഞാൽ കവറേജ് ആരംഭിക്കും'
      ]
    }
  },
  7: {
    title: 'Aam Aadmi Bima Yojana (AABY)',
    titleHi: 'आम आदमी बीमा योजना (AABY)',
    titleMl: 'ആം ആഡ്മി ബീമ യോജന (AABY)',
    description: 'Social security insurance for rural landless households with education scholarships',
    descriptionHi: 'ग्रामीण भूमिहीन परिवारों के लिए सामाजिक सुरक्षा बीमा, छात्रवृत्ति सहित',
    descriptionMl: 'ഗ്രാമീണ ഭൂമിയില്ലാത്ത കുടുംബങ്ങൾക്കുള്ള സാമൂഹ്യ സുരക്ഷാ ഇൻഷുറൻസ്, സ്കോളർഷിപ്പുകൾ ഉൾപ്പെടെ',
    coverage: '₹30,000–₹75,000 (life/disability)',
    processingTime: '15-30 days',
    eligibility: {
      en: ['Rural landless household', 'Age 18–59 years', 'Identified by nodal agency'],
      hi: ['ग्रामीण भूमिहीन परिवार', 'आयु 18–59 वर्ष', 'नोडल एजेंसी द्वारा पहचान'],
      ml: ['ഗ്രാമീണ ഭൂമിയില്ലാത്ത കുടുംബം', 'പ്രായം 18–59 വയസ്', 'നോഡൽ ഏജൻസി തിരിച്ചറിയുക']
    },
    documents: {
      en: ['Aadhaar', 'Age proof', 'Residence proof', 'Nodal agency certificate'],
      hi: ['आधार', 'आयु प्रमाण', 'निवास प्रमाण', 'नोडल एजेंसी प्रमाण पत्र'],
      ml: ['ആധാർ', 'പ്രായ തെളിവ്', 'റസിഡൻസ് തെളിവ്', 'നോഡൽ ഏജൻസി സർട്ടിഫിക്കറ്റ്']
    },
    steps: {
      en: [
        'Contact designated nodal agency/local body',
        'Submit application with proofs',
        'Verification by nodal agency',
        'Receive policy document and start coverage'
      ],
      hi: [
        'नामित नोडल एजेंसी/स्थानीय निकाय से संपर्क करें',
        'प्रमाणों सहित आवेदन जमा करें',
        'नोडल एजेंसी द्वारा सत्यापन',
        'पॉलिसी दस्तावेज प्राप्त करें और कवरेज शुरू करें'
      ],
      ml: [
        'നാമപ്പെടുത്തിയ നോഡൽ ഏജൻസി/പ്രാദേശിക സ്ഥാപനത്തെ ബന്ധപ്പെടുക',
        'രേഖകളോടുകൂടി അപേക്ഷ സമർപ്പിക്കുക',
        'നോഡൽ ഏജൻസി പരിശോധിക്കും',
        'പോളിസി രേഖ ലഭിച്ച് കവറേജ് ആരംഭിക്കും'
      ]
    }
  },
  8: {
    title: 'Ayushman Bharat Digital Mission (ABHA)',
    titleHi: 'आयुष्मान भारत डिजिटल मिशन (ABHA)',
    titleMl: 'ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ മിഷൻ (ABHA)',
    description: 'Create a digital health ID to access records and linked health services',
    descriptionHi: 'रिकॉर्ड और जुड़ी स्वास्थ्य सेवाओं तक पहुँच हेतु डिजिटल हेल्थ आईडी',
    descriptionMl: 'ആരോഗ്യ രേഖകളിലേക്ക് പ്രവേശനത്തിനായി ഡിജിറ്റൽ ഹെൽത്ത് ഐഡി',
    coverage: 'Digital health ID',
    processingTime: 'Immediate',
    eligibility: {
      en: ['Resident of India', 'Aadhaar or DL for authentication'],
      hi: ['भारत का निवासी', 'प्रमाणीकरण हेतु आधार या DL'],
      ml: ['ഇന്ത്യൻ റെസിഡന്റ്', 'ഓതന്റിക്കേഷനിന് ആധാർ അല്ലെങ്കിൽ DL']
    },
    documents: {
      en: ['Aadhaar or Driving License', 'Mobile number'],
      hi: ['आधार या ड्राइविंग लाइसेंस', 'मोबाइल नंबर'],
      ml: ['ആധാർ അല്ലെങ്കിൽ ഡ്രൈവിംഗ് ലൈസൻസ്', 'മൊബൈൽ നമ്പർ']
    },
    steps: {
      en: [
        'Visit ABHA/ABDM portal or app',
        'Verify with Aadhaar or DL',
        'Generate ABHA number and ID',
        'Link health records and start using services'
      ],
      hi: [
        'ABHA/ABDM पोर्टल या ऐप पर जाएं',
        'आधार या DL से सत्यापन करें',
        'ABHA नंबर और आईडी बनाएं',
        'रिकॉर्ड लिंक करें और सेवाएं उपयोग करें'
      ],
      ml: [
        'ABHA/ABDM പോർട്ടൽ അല്ലെങ്കിൽ ആപ്പ് സന്ദർശിക്കുക',
        'ആധാർ അല്ലെങ്കിൽ DL ഉപയോഗിച്ച് പരിശോധിക്കണം',
        'ABHA നമ്പറും ഐഡിയും സൃഷ്ടിക്കുക',
        'റെക്കോർഡുകൾ ലിങ്ക് ചെയ്ത് സേവനങ്ങൾ ഉപയോഗിക്കുക'
      ]
    }
  }
};

export function SchemeDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, language } = useLanguage();
  const schemeId = parseInt(id || '1');
  const [applicationStep, setApplicationStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const scheme = schemeDetails[schemeId];

  if (!scheme) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Scheme not found</h2>
          <Button onClick={() => navigate('/HealthcarePoliciesPage')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const getLocalizedTitle = () => {
    switch (language) {
      case 'hi': return scheme.titleHi;
      case 'ml': return scheme.titleMl;
      default: return scheme.title;
    }
  };

  const getLocalizedDescription = () => {
    switch (language) {
      case 'hi': return scheme.descriptionHi;
      case 'ml': return scheme.descriptionMl;
      default: return scheme.description;
    }
  };

  const getLocalizedArray = (arrayObj: { en: string[], hi: string[], ml: string[] }) => {
    switch (language) {
      case 'hi': return arrayObj.hi;
      case 'ml': return arrayObj.ml;
      default: return arrayObj.en;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-4">
          <div className="text-center py-12">
            <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-4">Application Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your application has been submitted. You will receive updates via SMS.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Schemes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (applicationStep > 0) {
    const steps = getLocalizedArray(scheme.steps);
    const progress = (applicationStep / steps.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setApplicationStep(0)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold">Application Process</h1>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600 mt-2">
              Step {applicationStep} of {steps.length}
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base">
                  {steps[applicationStep - 1]}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Complete this step to continue with your application.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Make sure you have all required documents ready before proceeding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={() => {
                if (applicationStep === steps.length) {
                  setShowSuccess(true);
                } else {
                  setApplicationStep(applicationStep + 1);
                }
              }}
              className="w-full"
            >
              {applicationStep === steps.length ? 'Complete Application' : 'Mark as Complete & Continue'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setApplicationStep(0)}
              className="w-full"
            >
              Back to Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/HealthcarePoliciesPage')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Scheme Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base leading-tight">
              {getLocalizedTitle()}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              {getLocalizedDescription()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <IndianRupee className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Coverage</p>
                <p className="font-medium text-green-600">{scheme.coverage}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Processing</p>
                <p className="font-medium text-blue-600">{scheme.processingTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Eligibility Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getLocalizedArray(scheme.eligibility).map((criteria: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {criteria}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Required Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getLocalizedArray(scheme.documents).map((document: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  {document}
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                Keep both original and photocopies of all documents ready.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Application Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getLocalizedArray(scheme.steps).map((step: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Helpline</p>
                  <p className="text-sm text-gray-600">1800-111-565</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Visit Center</p>
                  <p className="text-sm text-gray-600">Nearest CSC or Health Center</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 pb-6">
          <Button 
            onClick={() => setApplicationStep(1)}
            className="w-full"
            size="lg"
          >
            Start Application Process
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Application Form
          </Button>
        </div>
      </div>
    </div>
  );
}
