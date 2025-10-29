import FontUploader from '../components/FontUploader'

export default function FontsPage() {
  return (
    <section className="component-fonts-page p-6 space-y-4 text-[color:var(--color-foreground)]">
      <h1 className="component-fonts-page__title text-2xl font-semibold tracking-tight">Fonts</h1>
      <p className="component-fonts-page__subtitle text-[color:var(--color-muted-foreground)]">Upload and manage test fonts.</p>
      <FontUploader />
    </section>
  )
}
