import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import { Button } from './components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet'
import FontsPage from './pages/Fonts'
import LanguagesPage from './pages/Languages'
import PreviewPage from './pages/Preview'
import ReportPage from './pages/Report'

const navItems = [
  { path: '/languages', label: 'Languages' },
  { path: '/fonts', label: 'Fonts' },
  { path: '/preview', label: 'Preview' },
  { path: '/report', label: 'Report' },
]

function HomePage() {
  return (
    <section className="component-home-page p-6 space-y-3">
      <h1 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
        Font Testing Tool
      </h1>
      <p className="text-[color:var(--color-muted-foreground)]">
        Upload fonts, choose language sets, and inspect glyph coverage accuracy. Use the navigation above to
        get started.
      </p>
    </section>
  )
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="component-app min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
        <header className="component-app-header border-b border-[color:var(--color-border)] bg-[color:var(--color-card)]/80 backdrop-blur">
          <div className="component-app-header__inner mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <SheetHeader>
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <nav className="component-app-nav-mobile mt-6 flex flex-col gap-2">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          [
                            'rounded-md px-4 py-3 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          ].join(' ')
                        }
                      >
                        {item.label}
                      </NavLink>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <NavLink to="/" className="component-app-logo text-xl font-semibold">
                FontAudit
              </NavLink>
            </div>

            <div className="flex items-center gap-3">
              {/* Desktop navigation - hidden on mobile */}
              <nav className="component-app-nav hidden gap-1 md:flex">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                      ].join(' ')
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <ModeToggle />
            </div>
          </div>
        </header>
        <main className="component-app-main mx-auto flex max-w-5xl flex-1 flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/languages" element={<LanguagesPage />} />
            <Route path="/fonts" element={<FontsPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}
