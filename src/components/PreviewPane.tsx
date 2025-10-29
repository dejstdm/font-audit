import { useMemo, useState } from 'react'
import { useFontStore, useHydratedFonts } from '../state/store'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'

const PREVIEW_SIZES = [12, 16, 24, 32, 48] as const

export default function PreviewPane() {
  const { fonts, languages } = useFontStore()
  const fontsReady = useHydratedFonts() // Load fonts into document.fonts
  const [customText, setCustomText] = useState('')
  const [selectedSize, setSelectedSize] = useState<number | 'all'>('all')

  const sizesToShow = useMemo(() => {
    return selectedSize === 'all' ? PREVIEW_SIZES : [selectedSize]
  }, [selectedSize])

  if (fonts.length === 0) {
    return (
      <Card className="component-preview-pane">
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
      <Card className="component-preview-pane">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No languages selected yet. Visit the Languages page to select languages.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!fontsReady) {
    return (
      <Card className="component-preview-pane">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Loading fonts...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className="component-preview-pane space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <Label htmlFor="custom-text" className="sr-only">
              Custom preview text
            </Label>
            <Input
              id="custom-text"
              type="text"
              placeholder="Type custom text (or leave empty for sample)"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Size:</span>
            <Button
              variant={selectedSize === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSize('all')}
            >
              All
            </Button>
            {PREVIEW_SIZES.map((size) => (
              <Button
                key={size}
                variant={selectedSize === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSize(size)}
              >
                {size}px
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Previews */}
      {languages.map((language) => (
        <Card key={language.id} className="component-preview-pane__language">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{language.name}</h3>
              <Badge variant="outline">{language.id}</Badge>
              {language.rtl && (
                <Badge variant="secondary">RTL</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fonts.map((font) => (
              <div key={font.id} className="space-y-3 border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {font.name}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {font.style} · {font.weight}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {sizesToShow.map((size) => {
                    const text = customText || language.sample
                    return (
                      <div
                        key={size}
                        className="component-preview-pane__sample"
                        dir={language.rtl ? 'rtl' : 'ltr'}
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="text-xs text-muted-foreground w-8 shrink-0">
                            {size}px
                          </span>
                          <p
                            style={{
                              fontFamily: `"${font.name}", sans-serif`,
                              fontSize: `${size}px`,
                              lineHeight: 1.4,
                            }}
                            className="flex-1 break-words"
                          >
                            {text}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

