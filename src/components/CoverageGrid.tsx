import { useMemo, useState, useEffect } from 'react'
import { useFontStore, useHydratedFonts } from '../state/store'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { batchDetectMissingGlyphs, clearDetectionCache, type GlyphDetectionResult } from '../lib/detect'

export default function CoverageGrid() {
  const { fonts, languages } = useFontStore()
  const fontsReady = useHydratedFonts() // Load fonts into document.fonts
  
  // Detection state
  const [detectionResults, setDetectionResults] = useState<Map<string, Map<string, GlyphDetectionResult[]>>>(new Map())
  const [isDetecting, setIsDetecting] = useState(false)
  const [showMissingOnly, setShowMissingOnly] = useState(false)

  const coverageData = useMemo(() => {
    return languages.map((language) => ({
      language,
      characters: language.coverage.split(''),
    }))
  }, [languages])

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
        true // bypassCache = true to force fresh detection
      )
      setDetectionResults(results)
    } catch (error) {
      console.error('Detection failed:', error)
    } finally {
      setIsDetecting(false)
    }
  }

  const clearCacheAndDetect = async () => {
    try {
      await clearDetectionCache()
      // Clear the detection results to show untested state
      setDetectionResults(new Map())
    } catch (error) {
      console.error('Cache clearing failed:', error)
    }
  }

  const getCharacterStatus = (fontName: string, languageId: string, character: string) => {
    const fontResults = detectionResults.get(fontName)
    if (!fontResults) return null
    
    const languageResults = fontResults.get(languageId)
    if (!languageResults) return null
    
    return languageResults.find(result => result.character === character)
  }

  if (fonts.length === 0) {
    return (
      <Card className="component-coverage-grid">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No fonts uploaded yet. Visit the Fonts page to upload fonts.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (languages.length === 0) {
    return (
      <Card className="component-coverage-grid">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No languages selected yet. Visit the Languages page to select languages.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!fontsReady || isDetecting) {
    return (
      <Card className="component-coverage-grid">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            {!fontsReady ? 'Loading fonts...' : 'Detecting missing glyphs...'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="component-coverage-grid space-y-4">
      {/* Detection Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={runDetection}
                disabled={isDetecting}
              >
                {isDetecting ? 'Detecting...' : 'Re-run Detection'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearCacheAndDetect}
                disabled={isDetecting}
              >
                {isDetecting ? 'Clearing...' : 'Clear Cache'}
              </Button>
              <Button
                variant={showMissingOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowMissingOnly(!showMissingOnly)}
              >
                {showMissingOnly ? 'Show All' : 'Show Missing Only'}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {detectionResults.size > 0 && (
                <span>
                  Detection complete for {fonts.length} font{fonts.length !== 1 ? 's' : ''} and {languages.length} language{languages.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {coverageData.map(({ language, characters }) => (
        <Card key={language.id} className="component-coverage-grid__language">
          <CardHeader>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{language.name}</h3>
              <Badge variant="outline">{language.id}</Badge>
              {language.rtl && (
                <Badge variant="secondary">RTL</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {characters.length} character{characters.length !== 1 ? 's' : ''} in coverage set
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {fonts.map((font) => (
              <div key={font.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{font.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {font.style} · {font.weight}
                  </Badge>
                </div>
                <div
                  className="component-coverage-grid__characters rounded bg-secondary/50 p-4"
                  dir={language.rtl ? 'rtl' : 'ltr'}
                >
                  <div
                    className="flex flex-wrap gap-1 text-2xl leading-relaxed"
                    style={{
                      fontFamily: `"${font.name}", sans-serif`,
                    }}
                  >
                    {characters
                      .filter((char) => {
                        if (!showMissingOnly) return true
                        const status = getCharacterStatus(font.name, language.id, char)
                        return status?.isMissing
                      })
                      .map((char, index) => {
                        const codePoint = char.codePointAt(0)
                        const hexCode = codePoint ? codePoint.toString(16).toUpperCase().padStart(4, '0') : '0000'
                        const status = getCharacterStatus(font.name, language.id, char)
                        
                        let className = "component-coverage-grid__char inline-flex items-center justify-center hover:bg-accent hover:text-accent-foreground rounded px-1 transition-colors cursor-default"
                        let title = `${char} (U+${hexCode})`
                        
                        if (status?.isMissing) {
                          className += " missing border-2 border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300"
                          title += ` - Missing in ${font.name} (confidence: ${Math.round(status.confidence * 100)}%)`
                        } else if (status) {
                          title += ` - Present in ${font.name} (confidence: ${Math.round(status.confidence * 100)}%)`
                        }
                        
                        return (
                          <span
                            key={`${char}-${index}`}
                            className={className}
                            style={{
                              fontFamily: `"${font.name}", sans-serif`,
                            }}
                            title={title}
                          >
                            {char}
                          </span>
                        )
                      })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

