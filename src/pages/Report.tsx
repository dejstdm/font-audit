import { useState, useEffect, useMemo } from 'react'
import { useFontStore, useHydratedFonts } from '../state/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { batchDetectMissingGlyphs, type GlyphDetectionResult } from '../lib/detect'
import { aggregateReportData, type ReportData } from '../lib/export'
import ReportTable from '../components/ReportTable'
import ExportMenu from '../components/ExportMenu'
import { RefreshCw } from 'lucide-react'

export default function ReportPage() {
  const { fonts, languages } = useFontStore()
  const fontsReady = useHydratedFonts()

  // Detection state
  const [detectionResults, setDetectionResults] = useState<Map<string, Map<string, GlyphDetectionResult[]>>>(new Map())
  const [isDetecting, setIsDetecting] = useState(false)

  // Aggregate report data
  const reportData = useMemo<ReportData | null>(() => {
    if (fonts.length === 0 || languages.length === 0 || detectionResults.size === 0) {
      return null
    }
    return aggregateReportData(fonts, languages, detectionResults)
  }, [fonts, languages, detectionResults])

  // Run detection when fonts and languages change
  useEffect(() => {
    if (fontsReady && fonts.length > 0 && languages.length > 0) {
      runDetection()
    }
  }, [fontsReady, fonts, languages])

  const runDetection = async () => {
    setIsDetecting(true)
    try {
      const results = await batchDetectMissingGlyphs(
        fonts.map(font => ({ name: font.name, blob: font.blob })),
        languages,
        false // Use cached results for reports
      )
      setDetectionResults(results)
    } catch (error) {
      console.error('Detection failed:', error)
    } finally {
      setIsDetecting(false)
    }
  }

  if (fonts.length === 0) {
    return (
      <section className="component-report-page p-6 space-y-4">
        <div>
          <h1 className="component-report-page__title text-2xl font-semibold tracking-tight">Report</h1>
          <p className="component-report-page__subtitle text-muted-foreground">
            Generate exports for coverage results.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No fonts uploaded yet. Visit the Fonts page to upload fonts.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (languages.length === 0) {
    return (
      <section className="component-report-page p-6 space-y-4">
        <div>
          <h1 className="component-report-page__title text-2xl font-semibold tracking-tight">Report</h1>
          <p className="component-report-page__subtitle text-muted-foreground">
            Generate exports for coverage results.
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No languages selected yet. Visit the Languages page to select languages.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="component-report-page p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="component-report-page__title text-2xl font-semibold tracking-tight">Report</h1>
          <p className="component-report-page__subtitle text-muted-foreground">
            Generate exports for coverage results.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={runDetection}
            disabled={isDetecting}
            className="component-report-page__refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isDetecting ? 'animate-spin' : ''}`} />
            {isDetecting ? 'Detecting...' : 'Refresh'}
          </Button>
          {reportData && <ExportMenu data={reportData} disabled={isDetecting} />}
        </div>
      </div>

      {!fontsReady || isDetecting ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              {!fontsReady ? 'Loading fonts...' : 'Detecting missing glyphs...'}
            </p>
          </CardContent>
        </Card>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Fonts</CardDescription>
                <CardTitle className="text-2xl">{reportData.metadata.totalFonts}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Languages</CardDescription>
                <CardTitle className="text-2xl">{reportData.metadata.totalLanguages}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Missing Glyphs</CardDescription>
                <CardTitle className="text-2xl">{reportData.metadata.totalMissingGlyphs}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Generated</CardDescription>
                <CardTitle className="text-sm font-normal">
                  {new Date(reportData.metadata.timestamp).toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Report Table */}
          <ReportTable data={reportData} />
        </>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No detection results available. Run detection on the Preview page first, or click Refresh above.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
