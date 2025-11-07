// src/components/HealthRecordsPage.tsx
import { PatientDashboard } from './PatientDashboard'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import { getCurrentUser } from '../lib/firebase'

export function HealthRecordsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const selectedProfile = useMemo(
    () => (location.state as any)?.selectedProfile,
    [location.state]
  )

  useEffect(() => {
    const user = getCurrentUser?.()
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md mx-auto space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center h-8 w-8 rounded border text-sm"
            aria-label="Go back"
          >
            <span aria-hidden="true">←</span>
          </button>
          <h1 className="text-base font-semibold leading-8 tracking-tight">
            Health Records
          </h1>
        </div>

        {/* Page content */}
        <PatientDashboard
          selectedProfile={selectedProfile}
          onChooseProfile={() => navigate('/health-records/choose')}
        />
      </div>
    </div>
  )
}
