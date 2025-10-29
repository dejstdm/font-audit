import { useState } from 'react'
import { useFontStore, useHydratedFonts } from '../state/store'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

export default function FontUploader() {
  const { fonts, addFonts, removeFont } = useFontStore()
  const [error, setError] = useState<string | null>(null)
  useHydratedFonts()

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError(null)
    try {
      await addFonts(files)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section className="component-font-uploader space-y-4">
      <Card className="component-font-uploader__dropzone flex flex-col gap-3 border-dashed p-6 text-center">
        <div className="text-sm text-muted-foreground">Drop fonts here to start testing.</div>
        <Label htmlFor="font-upload" className="mx-auto cursor-pointer">
          <Button variant="default" size="default" asChild>
            <span>Select font files</span>
          </Button>
          <Input
            id="font-upload"
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            className="hidden"
            multiple
            onChange={(event) => handleFiles(event.target.files)}
          />
        </Label>
        {error ? (
          <p className="component-font-uploader__error text-sm text-destructive">{error}</p>
        ) : null}
      </Card>
      {fonts.length > 0 ? (
        <ul className="component-font-uploader__list space-y-2">
          {fonts.map((font) => (
            <Card
              key={font.id}
              className="component-font-uploader__item flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="component-font-uploader__item-meta">
                <div className="font-medium">{font.name}</div>
                <div className="text-sm text-muted-foreground">{font.style} · weight {font.weight}</div>
              </div>
              <div className="component-font-uploader__item-actions flex items-center gap-3 text-sm text-muted-foreground">
                <span>{font.fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFont(font.id)}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      ) : (
        <p className="component-font-uploader__empty text-sm text-muted-foreground">
          No fonts loaded yet.
        </p>
      )}
    </section>
  )
}
