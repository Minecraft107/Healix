// src/legal/ConsentPage.tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ConsentPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="w-full max-w-3xl mx-auto space-y-6 pb-6 bg-white/70 backdrop-blur rounded-xl shadow-sm p-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Health Data Consent</h1>
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
            <h2 className="text-lg font-medium">1. Scope of Consent</h2>
            <p>Consent covers collection, storage, and processing of health data for HEALIX services.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">2. Purpose</h2>
            <p>Data enables features like records, emergency contacts, eligibility, and insights.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">3. Withdrawal</h2>
            <p>Consent may be withdrawn anytime; certain features may stop functioning thereafter.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium">4. Contact</h2>
            <p>For questions or to withdraw, contact support or the data protection team.</p>
          </section>

          <footer className="text-sm text-gray-500 pt-4 border-t">
            Manage consent preferences in profile settings.
          </footer>
        </div>
      </div>
    </main>
  );
}
