// src/legal/PrivacyPage.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto space-y-6 pb-6 bg-white/70 backdrop-blur rounded-xl shadow-sm p-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Privacy Policy</h1>
            <Button
              variant="outline"
              onClick={() => navigate('/register')}
              className="py-2 px-4 text-sm font-medium border"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registration
            </Button>
          </header>

          <p className="text-sm text-gray-600">Effective date: 2025-01-01</p>

          <section className="space-y-3 text-justify">
            <p>
              HEALIX is committed to protecting personal data in line with applicable laws and standards,
              including IT Act 2000, DPDP Act 2023, GDPR principles, and HIPAA security safeguards.
            </p>
            <p>
              The app collects minimum necessary data (identity, contact, demographics, and health records)
              to deliver features and benefits. Data is encrypted in transit and at rest.
            </p>
            <p>
              No data is sold. Disclosure occurs only with explicit consent or to comply with legal or
              public health obligations, with accountability and auditability.
            </p>
            <p>
              Data rights include access, correction, export, and deletion. Continued use indicates consent
              to processing as described herein.
            </p>
          </section>

          <footer className="text-sm text-gray-500 pt-4 border-t">
            For privacy-related requests, contact the data protection team.
          </footer>
        </div>
      </div>
    </main>
  );
}
