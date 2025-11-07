// src/components/PatientDashboard.tsx
import React, { useMemo } from 'react'
import { ReportsList } from './ReportsList'
import { PrescriptionsList } from './PrescriptionsList'

type Member = {
  id: string
  name: string
  isPrimary?: boolean
  photoURL?: string
  customId?: string
  relation?: string
}

interface PatientDashboardProps {
  selectedProfile?: Member | null
  onChooseProfile?: () => void
}

export function PatientDashboard({
  selectedProfile,
  onChooseProfile,
}: PatientDashboardProps) {
  const displayName = useMemo(
    () => selectedProfile?.name ?? 'No profile',
    [selectedProfile]
  )
  const customId = selectedProfile?.customId ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md mx-auto space-y-4 pb-6">
      {!selectedProfile ? (
        <div className="rounded-md border p-4">
          <h3 className="font-semibold">No profile context found</h3>
          <p className="text-sm text-gray-600">
            Open from Home → Health Records and choose a profile.
          </p>
          {onChooseProfile && (
            <div className="mt-3">
              <button
                className="px-3 py-2 bg-gray-900 text-white rounded"
                onClick={onChooseProfile}
              >
                Choose Profile
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-xs text-gray-600">
                {customId ? `ID: ${customId}` : 'Profile'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-md border p-3">
          <ReportsList customId={customId} />
        </div>
        <div className="rounded-md border p-3">
          <PrescriptionsList customId={customId} />
        </div>
      </div>
      </div>
    </div>
  )
}

export default PatientDashboard
