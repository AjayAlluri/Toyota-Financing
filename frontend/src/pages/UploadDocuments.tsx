import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'

export default function UploadDocuments() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as any) || {}
  const answers = state.answers || {}
  const selectedPlan = state.selectedPlan as string | undefined

  const creditScore = useMemo(() => answers?.credit_score ?? 'Not provided', [answers])
  const [file, setFile] = useState<File | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    // Simulate validation with a 2s loading overlay before navigating
    setIsLoading(true)
    setTimeout(() => {
      const extractedScore = 720
      const inRange = true
      navigate('/dealers', { state: { selectedPlan, extractedScore, inRange } })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#111111]">
      <div className="h-8 w-full bg-black" />
      <div className="h-1 w-full bg-[#EB0A1E]" />
      <header className="bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6 py-4 md:py-6 flex items-center justify-between">
          <Link to="/" className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111111]">
            Toyota <span className="text-[#EB0A1E]">Quote</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/carRec" className="px-3 py-1.5 text-sm font-medium rounded bg-[#111111] text-white">Back</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8 md:py-12">
        <div className="rounded-2xl bg-white shadow-lg border border-gray-200 p-6 md:p-8">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Next step: verify details to proceed</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            You selected: <span className="font-medium text-[#111111]">{selectedPlan || '—'}</span>. To continue with this selection, we need to validate your credit score answer (<span className="font-medium text-[#111111]">{String(creditScore)}</span>) and supporting documents.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={onFileChange}
                className="block w-full text-sm text-[#111111] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#EB0A1E]/10 file:text-[#EB0A1E] hover:file:bg-[#EB0A1E]/20"
              />
            </div>
            <button
              type="submit"
              disabled={!file || isLoading}
              className={`px-5 py-2 rounded-lg font-medium transition ${file && !isLoading ? 'bg-[#EB0A1E] text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              Submit
            </button>
          </form>
        </div>
      </main>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-700">
          <div className="rounded-xl bg-white px-6 py-5 shadow-lg border border-gray-200 animate-pulse">
            <p className="text-[#111111] font-medium">Verifying your document and credit score…</p>
          </div>
        </div>
      )}
    </div>
  )
}


