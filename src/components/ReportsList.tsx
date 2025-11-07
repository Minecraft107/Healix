import { useEffect, useMemo, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase' // fixed path (was ".lib./firebase")
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { FileText, Download, Eye, Calendar, User, X } from 'lucide-react'

interface ReportsListProps {
  customId: string
}

type FireTimestamp = { toDate: () => Date } | null | undefined

export function ReportsList({ customId }: ReportsListProps) {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const safeCustomId = useMemo(() => customId?.trim(), [customId])

  useEffect(() => {
    if (!safeCustomId) {
      setReports([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'medicalReports'),
      where('patientCustomId', '==', safeCustomId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reportsList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        setReports(reportsList)
        setLoading(false)
      },
      () => setLoading(false)
    )

    return () => unsubscribe()
  }, [safeCustomId])

  const handleDownload = (report: any) => {
    if (!report?.fileData) return
    const link = document.createElement('a')
    link.href = report.fileData // Base64 data URL or public storage URL
    link.download = report.fileName || 'report'
    link.rel = 'noopener'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleView = (report: any) => setSelectedReport(report)

  // Report Viewer Modal
  if (selectedReport) {
    const ts = selectedReport.createdAt as FireTimestamp
    const dateStr =
      ts?.toDate?.()?.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }) ?? '—'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{selectedReport.reportType || 'Report'}</h2>
              <p className="text-sm text-gray-600">
                {selectedReport.fileName || 'file'} • {dateStr}
              </p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedReport(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-4">
            {selectedReport.fileType?.startsWith('image/') ? (
              <img
                src={selectedReport.fileData}
                alt={selectedReport.reportType || 'Report'}
                className="w-full rounded-lg"
              />
            ) : selectedReport.fileType === 'application/pdf' ? (
              <iframe
                src={selectedReport.fileData}
                className="w-full h-[70vh] rounded-lg"
                title={selectedReport.reportType || 'Report'}
              />
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Preview not available for this file type.</p>
              </div>
            )}
            <Button onClick={() => handleDownload(selectedReport)} className="w-full mt-4">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Loading reports...</p>
      </div>
    )
  }

  if (!reports.length) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
          <p className="text-gray-600">Reports uploaded by providers will appear here.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Medical Reports ({reports.length})</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const ts = report.createdAt as FireTimestamp
          const dateStr =
            ts?.toDate?.()?.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }) ?? '—'

          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {report.reportType || 'Report'}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.fileName || 'file'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 space-y-1">
                  {report.uploadedBy && (
                    <p className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Uploaded by {report.uploadedBy}
                    </p>
                  )}
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {dateStr}
                  </p>
                </div>

                {report.notes && (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    <strong>Notes:</strong> {report.notes}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={() => handleView(report)} className="flex-1" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button onClick={() => handleDownload(report)} className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// keep this a named export; import with { ReportsList } from './ReportsList'
