// src/components/ChooseProfileForRecords.tsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from './ui/card'
import { ChevronRight } from 'lucide-react'
import { getCurrentUser, getUserData, getFamilyMembers } from '../lib/firebase'

type Member = {
  id: string
  name: string
  isPrimary?: boolean
  photoURL?: string
  customId?: string
}

export function ChooseProfileForRecords() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [list, setList] = useState<Member[]>([])

  const getInitial = (name?: string) =>
    name?.trim?.().charAt(0)?.toUpperCase?.() ?? 'U'

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate('/home')
  }

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const user = getCurrentUser?.()
      if (!user) {
        navigate('/login', { replace: true })
        return
      }

      const u = await getUserData(user.uid)
      const primary: Member =
        u?.success && u.data
          ? {
              id: user.uid,
              name: (u.data.fullName ?? u.data.name ?? 'You') as string,
              isPrimary: true,
              photoURL: u.data.photoURL as string | undefined,
              customId: u.data.customId as string | undefined,
            }
          : {
              id: user.uid,
              name: 'You',
              isPrimary: true,
            }

      let fam: Member[] = []
      try {
        const items = await getFamilyMembers(user.uid)
        fam =
          items?.map((m: any) => ({
            id: m?.id as string,
            name: (m?.name ?? m?.fullName ?? 'Member') as string,
            isPrimary: false,
            photoURL: m?.photoURL as string | undefined,
            customId: m?.customId as string | undefined,
          })) ?? []
      } catch {
        fam = []
      }

      setList([primary, ...fam])
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    load()
  }, [load])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="w-full max-w-md mx-auto space-y-4 pb-6">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center h-8 w-8 rounded border text-sm"
              aria-label="Go back"
            >
              <span aria-hidden="true">←</span>
            </button>
            <h2 className="text-base font-semibold leading-8 tracking-tight">
              Open Health Records
            </h2>
          </div>

          <p className="text-sm text-gray-600">Loading profiles…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md mx-auto space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center h-8 w-8 rounded border text-sm"
            aria-label="Go back"
          >
            <span aria-hidden="true">←</span>
          </button>
          <h2 className="text-base font-semibold leading-8 tracking-tight">
            Open Health Records
          </h2>
        </div>

        <p className="text-sm text-gray-600">Choose a profile to continue</p>

        {/* List */}
        <div className="space-y-3">
          {list.map((p) => {
            const gradient = p.isPrimary
              ? 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)'
              : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
            return (
              <Card key={p.id}>
                <button
                  onClick={() =>
                    navigate('/health-records', { state: { selectedProfile: p } })
                  }
                  className="w-full flex items-center gap-3 py-3 hover:bg-gray-50 px-3 text-left"
                  type="button"
                >
                  <div
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold"
                    style={{ background: gradient }}
                    aria-hidden
                  >
                    {getInitial(p.name)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-600">
                      {p.customId
                        ? `ID: ${p.customId}`
                        : p.isPrimary
                        ? 'Primary profile'
                        : 'Family member'}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ChooseProfileForRecords
