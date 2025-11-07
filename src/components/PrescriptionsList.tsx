import { useEffect, useMemo, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase' // fixed path (was '../firebase/config')
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Activity, Calendar, User } from 'lucide-react'

interface PrescriptionsListProps {
  customId: string
}

type FireTimestamp = { toDate: () => Date } | null | undefined

export function PrescriptionsList({ customId }: PrescriptionsListProps) {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const safeCustomId = useMemo(() => customId?.trim(), [customId])

  useEffect(() => {
    if (!safeCustomId) {
      setPrescriptions([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'prescriptions'),
      where('patientCustomId', '==', safeCustomId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prescList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setPrescriptions(prescList)
        setLoading(false)
      },
      () => setLoading(false)
    )

    return () => unsubscribe()
  }, [safeCustomId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Loading prescriptions...</p>
      </div>
    )
  }

  if (!prescriptions.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Prescriptions Yet</h3>
          <p className="text-gray-600">Prescriptions will appear here after a consultation.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Prescriptions ({prescriptions.length})</h2>
      </div>

      {prescriptions.map((prescription) => {
        const ts = prescription.createdAt as FireTimestamp
        const dateStr =
          ts?.toDate?.()?.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) ??
          '—'

        return (
          <Card key={prescription.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    {prescription.doctorName || 'Doctor'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {dateStr}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {prescription.status || 'Active'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescription.diagnosis && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Diagnosis</p>
                  <p className="text-gray-900">{prescription.diagnosis}</p>
                </div>
              )}

              {Array.isArray(prescription.medicines) && prescription.medicines.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Medications</p>
                  <div className="space-y-2">
                    {prescription.medicines.map(
                      (
                        med: {
                          medicineName?: string
                          dosage?: string
                          frequency?: string
                          duration?: string
                        },
                        idx: number
                      ) => (
                        <div key={idx} className="bg-white border rounded-lg p-3">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {med.medicineName ?? 'Medicine'}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                              {med.dosage && (
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Dosage:</span> {med.dosage}
                                </span>
                              )}
                              {med.frequency && (
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Frequency:</span> {med.frequency}
                                </span>
                              )}
                              {med.duration && (
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Duration:</span> {med.duration}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {prescription.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Additional Notes</p>
                  <p className="text-sm text-gray-600">{prescription.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// keep this a named export; import with { PrescriptionsList } from './PrescriptionsList'
