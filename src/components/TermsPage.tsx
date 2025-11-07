// src/legal/TermsPage.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto space-y-6 pb-6 bg-white/70 backdrop-blur rounded-xl shadow-sm p-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Terms & Conditions</h1>
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

          <section className="space-y-2">
            <h2 className="text-lg font-medium">1. Introduction</h2>
            <p>These Terms govern the use of the HEALIX application and related services.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">2. Eligibility</h2>
            <p>Provide accurate information and comply with applicable laws and policies.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">3. Acceptable Use</h2>
            <p>Do not misuse the platform, attempt unauthorized access, or infringe third-party rights.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">4. Limitation of Liability</h2>
            <p>Services are provided as-is to the extent permitted by law.</p>
          </section>

          <footer className="text-sm text-gray-500 pt-4 border-t">
            For questions regarding these Terms, contact support.
          </footer>
        </div>
      </div>
    </main>
  );
}
