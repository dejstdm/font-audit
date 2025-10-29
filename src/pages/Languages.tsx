import LanguagePicker from '../components/LanguagePicker'

export default function LanguagesPage() {
  return (
    <section className="component-languages-page p-6 space-y-4 text-[color:var(--color-foreground)]">
      <div className="component-languages-page__intro space-y-2">
        <h1 className="component-languages-page__title text-2xl font-semibold tracking-tight">Languages</h1>
        <p className="component-languages-page__subtitle text-[color:var(--color-muted-foreground)]">
          Choose language sets and presets to evaluate glyph coverage. Selected languages sync across the
          application.
        </p>
      </div>
      <LanguagePicker />
    </section>
  )
}
