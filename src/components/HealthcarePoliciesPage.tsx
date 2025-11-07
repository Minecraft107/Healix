import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Heart, Shield, Users, Building2, CheckCircle, AlertCircle, IndianRupee, Clock, Activity, Ambulance } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const healthSchemes = [
  {
    id: 1,
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana',
    nameHi: 'आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना',
    nameMl: 'ആയുഷ്മാൻ ഭാരത് പ്രധാനമന്ത്രി ജൻ ആരോഗ്യ യോജന',
    coverage: '₹5,00,000',
    type: 'Central Government',
    icon: Heart,
    color: 'green',
    beneficiaries: '10+ Crore families',
    description: {
      en: 'Free healthcare coverage for secondary and tertiary hospitalization',
      hi: 'माध्यमिक और तृतीयक अस्पताल में भर्ती के लिए मुफ्त स्वास्थ्य कवरेज',
      ml: 'ദ്വിതീയ, തൃതീയ ആശുപത്രി വാസത്തിനുള്ള സൗജന്യ ആരോഗ്യ കവറേജ്'
    },
    howToApply: {
      en: 'Visit nearest Common Service Center (CSC) with Aadhaar and family details, or use the myScheme/PM-JAY portal to check eligibility and generate Ayushman card.',
      hi: 'आधार और परिवार विवरण के साथ निकटतम कॉमन सर्विस सेंटर (CSC) जाएं, या myScheme/PM-JAY पोर्टल पर पात्रता जांचकर आयुष्मान कार्ड बनाएं।',
      ml: 'ആധാർയും കുടുംബ വിവരങ്ങളും സഹിതം അടുത്തുള്ള CSC സന്ദർശിക്കുക, അല്ലെങ്കിൽ myScheme/PM-JAY പോർട്ടലിൽ യോഗ്യത പരിശോധിച്ച് ആയുഷ്മാൻ കാർഡ് സൃഷ്ടിക്കുക.'
    }
  },
  {
    id: 4,
    name: 'Janani Suraksha Yojana (JSY)',
    nameHi: 'जननी सुरक्षा योजना (JSY)',
    nameMl: 'ജനനി സുരക്ഷാ യോജന (JSY)',
    coverage: '₹1,000 - ₹1,400',
    type: 'Central Government',
    icon: Building2,
    color: 'pink',
    beneficiaries: 'Pregnant women',
    description: {
      en: 'Cash assistance to promote institutional delivery and postnatal care',
      hi: 'संस्थागत प्रसव और प्रसवोत्तर देखभाल को प्रोत्साहित करने हेतु नकद सहायता',
      ml: 'സ്ഥാപനപരമായ പ്രസവവും പ്രസവാനന്തര പരിചരണവും പ്രോത്സാഹിപ്പിക്കാൻ പണ സഹായം'
    },
    howToApply: {
      en: 'Register during pregnancy with ASHA/ANM at nearest Anganwadi/PHC and deliver at a government facility to receive benefits.',
      hi: 'गर्भावस्था में निकटतम आंगनवाड़ी/पीएचसी पर आशा/एएनएम के साथ पंजीकरण करें और लाभ के लिए सरकारी संस्थान में प्रसव करें।',
      ml: 'ഗർഭകാലത്ത് അടുത്തുള്ള അങ്കൺവാടി/പിഎച്ച്‌സിയിൽ എഎൻഎം/ആശയുമായി രജിസ്റ്റർ ചെയ്ത് സർക്കാർ ആശുപത്രിയിൽ പ്രസവിക്കുക.'
    }
  },
  {
    id: 5,
    name: 'Central Government Health Scheme (CGHS)',
    nameHi: 'केन्द्रीय सरकार स्वास्थ्य योजना (CGHS)',
    nameMl: 'കേന്ദ്ര സർക്കാർ ഹെൽത്ത് സ്കീം (CGHS)',
    coverage: 'Cashless OPD/IPD (empanelled)',
    type: 'Central Government',
    icon: Shield,
    color: 'blue',
    beneficiaries: 'Central govt employees/pensioners',
    description: {
      en: 'Comprehensive OPD and hospitalization at CGHS wellness centres and empanelled hospitals',
      hi: 'सीजिएचएस वेलनेस सेंटर और सूचीबद्ध अस्पतालों में व्यापक ओपीडी व अस्पताल में भर्ती सुविधा',
      ml: 'CGHS വെൽനെസ് കേന്ദ്രങ്ങളിലും എമ്പാനല്ഡ് ആശുപത്രികളിലുമായി സമഗ്ര OPD, ഐപിഡി സൗകര്യങ്ങൾ'
    },
    howToApply: {
      en: 'Eligible central government employees/pensioners enroll via CGHS portal with requisite documents and contribution.',
      hi: 'पात्र केंद्रीय सरकारी कर्मचारी/पेंशनर आवश्यक दस्तावेज और योगदान के साथ CGHS पोर्टल पर नामांकन करें।',
      ml: 'അർഹരായ കേന്ദ്ര സർക്കാർ ജീവനക്കാർ/പെൻഷൻധാരികൾ ആവശ്യമായ രേഖകൾ സഹിതം CGHS പോർട്ടലിൽ ചേർക്കുക.'
    }
  },
  {
    id: 6,
    name: 'Pradhan Mantri Suraksha Bima Yojana (PMSBY)',
    nameHi: 'प्रधानमंत्री सुरक्षा बीमा योजना (PMSBY)',
    nameMl: 'പ്രധാനമന്ത്രി സുരക്ഷ ബീമ യോജന (PMSBY)',
    coverage: '₹2,00,000 (accident)',
    type: 'Central Government',
    icon: Activity,
    color: 'purple',
    beneficiaries: 'Age 18–70 with bank account',
    description: {
      en: 'Low-cost accident insurance for death or disability',
      hi: 'मृत्यु या अपंगता हेतु कम लागत का दुर्घटना बीमा',
      ml: 'മരണം അല്ലെങ്കിൽ അശക്തതയ്‌ക്ക് കുറഞ്ഞ ചെലവിലെ അപകട ഇൻഷുറൻസ്'
    },
    howToApply: {
      en: 'Enroll via bank or online through net banking/mobile banking; premium auto-debited annually.',
      hi: 'बैंक के माध्यम से या नेट/मोबाइल बैंकिंग से नामांकन करें; प्रीमियम प्रतिवर्ष स्वतः कटेगा।',
      ml: 'ബാങ്ക് വഴിയോ നെറ്റ്/മൊബൈൽ ബാങ്കിംഗ് വഴിയോ ചേർക്കുക; പ്രീമിയം വാർഷികമായി ഓട്ടോ-ഡെബിറ്റ് ചെയ്യും.'
    }
  },
  {
    id: 7,
    name: 'Aam Aadmi Bima Yojana (AABY)',
    nameHi: 'आम आदमी बीमा योजना (AABY)',
    nameMl: 'ആം ആഡ്മി ബീമ യോജന (AABY)',
    coverage: '₹30,000–₹75,000 (life/disability)',
    type: 'Central Government',
    icon: Users,
    color: 'green',
    beneficiaries: 'Rural landless households',
    description: {
      en: 'Social security insurance for rural landless households with education scholarships',
      hi: 'ग्रामीण भूमिहीन परिवारों के लिए सामाजिक सुरक्षा बीमा, छात्रवृत्ति सहित',
      ml: 'ഗ്രാമീണ ഭൂമിയില്ലാത്ത കുടുംബങ്ങൾക്കുള്ള സാമൂഹ്യ സുരക്ഷാ ഇൻഷുറൻസ്, സ്കോളർഷിപ്പുകൾ ഉൾപ്പെടെ'
    },
    howToApply: {
      en: 'Apply through designated nodal agencies or local bodies with age and identity proof.',
      hi: 'नामित नोडल एजेंसी/स्थानीय निकाय के माध्यम से आयु और पहचान दस्तावेज के साथ आवेदन करें।',
      ml: 'നോഡൽ ഏജൻസികളിലൂടെയോ പ്രാദേശിക സ്ഥാപനങ്ങളിലൂടെയോ പ്രായവും തിരിച്ചറിയൽ രേഖകളും സഹിതം അപേക്ഷിക്കുക.'
    }
  },
  {
    id: 8,
    name: 'Ayushman Bharat Digital Mission (ABHA)',
    nameHi: 'आयुष्मान भारत डिजिटल मिशन (ABHA)',
    nameMl: 'ആയുഷ്മാൻ ഭാരത് ഡിജിറ്റൽ മിഷൻ (ABHA)',
    coverage: 'Digital health ID',
    type: 'Central Government',
    icon: Ambulance,
    color: 'blue',
    beneficiaries: 'All residents',
    description: {
      en: 'Create a digital health ID to access records and linked health services',
      hi: 'रिकॉर्ड और जुड़ी स्वास्थ्य सेवाओं तक पहुँच हेतु डिजिटल हेल्थ आईडी',
      ml: 'ആരോഗ്യ രേഖകളിലേക്ക് പ്രവേശനത്തിനായി ഡിജിറ്റൽ ഹെൽത്ത് ഐഡി'
    },
    howToApply: {
      en: 'Generate ABHA number online using Aadhaar/Driving License on the ABDM/ABHA portal or apps.',
      hi: 'ABDM/ABHA पोर्टल या ऐप पर आधार/ड्राइविंग लाइसेंस से एबीएचए नंबर बनाएं।',
      ml: 'ABDM/ABHA പോർട്ടലിൽ ആധാർ/ഡ്രൈവിംഗ് ലൈസൻസ് ഉപയോഗിച്ച് ABHA നമ്പർ സൃഷ്ടിക്കുക.'
    }
  }
];

export function HealthcarePoliciesPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const getLocalizedName = (scheme: typeof healthSchemes[0]) => {
    switch (language) {
      case 'hi': return scheme.nameHi;
      case 'ml': return scheme.nameMl;
      default: return scheme.name;
    }
  };

  const getLocalizedDescription = (scheme: typeof healthSchemes[0]) => {
    switch (language) {
      case 'hi': return scheme.description.hi;
      case 'ml': return scheme.description.ml;
      default: return scheme.description.en;
    }
  };

  const getLocalizedHowToApply = (scheme: typeof healthSchemes[0]) => {
    switch (language) {
      case 'hi': return scheme.howToApply.hi;
      case 'ml': return scheme.howToApply.ml;
      default: return scheme.howToApply.en;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">{t('availableSchemes')}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {healthSchemes.map((scheme) => {
          const Icon = scheme.icon;
          const colorClasses = {
            green: 'bg-green-100 text-green-600',
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600',
            pink: 'bg-pink-100 text-pink-600'
          };

          return (
            <Card key={scheme.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-full ${colorClasses[scheme.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight mb-2">
                      {getLocalizedName(scheme)}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {scheme.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <IndianRupee className="h-3 w-3 mr-1" />
                        {scheme.coverage}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {getLocalizedDescription(scheme)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-sm mb-2 text-gray-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t('howToApply')}:
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {getLocalizedHowToApply(scheme)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/scheme/${scheme.id}`)}
                >
                  {t('applyNow')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
