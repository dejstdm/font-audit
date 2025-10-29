import PreviewPane from '../components/PreviewPane'
import CoverageGrid from '../components/CoverageGrid'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export default function PreviewPage() {
  return (
    <section className="component-preview-page p-6 space-y-4">
      <div className="component-preview-page__intro space-y-2">
        <h1 className="component-preview-page__title text-2xl font-semibold tracking-tight">Preview</h1>
        <p className="component-preview-page__subtitle text-muted-foreground">
          Visualize sample sentences and glyph coverage.
        </p>
      </div>

          <Tabs defaultValue="coverage" className="component-preview-page__tabs">
            <TabsList>
              <TabsTrigger value="preview">Sample Text</TabsTrigger>
              <TabsTrigger value="coverage">Coverage Grid</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <PreviewPane />
            </TabsContent>
            <TabsContent value="coverage" className="mt-4">
              <CoverageGrid />
            </TabsContent>
          </Tabs>
    </section>
  )
}
