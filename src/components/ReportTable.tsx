import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { type ReportData } from '../lib/export'
import { cn } from '../lib/utils'

interface ReportTableProps {
  data: ReportData
}

export default function ReportTable({ data }: ReportTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedRows(newExpanded)
  }

  // Group results by font for better organization
  const resultsByFont = new Map<string, ReportData['results']>()
  for (const result of data.results) {
    if (!resultsByFont.has(result.fontName)) {
      resultsByFont.set(result.fontName, [])
    }
    resultsByFont.get(result.fontName)!.push(result)
  }

  if (data.results.length === 0) {
    return (
      <Card className="component-report-table">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No detection results available. Run detection on the Preview page first.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="component-report-table">
      <CardHeader>
        <CardTitle>Coverage Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Array.from(resultsByFont.entries()).map(([fontName, fontResults]) => (
            <div key={fontName} className="space-y-2">
              <h3 className="text-lg font-semibold">{fontName}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead className="text-right">Total Characters</TableHead>
                    <TableHead className="text-right">Missing</TableHead>
                    <TableHead className="text-right">Coverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fontResults.map((result) => {
                    const rowKey = `${result.fontName}-${result.languageId}`
                    const isExpanded = expandedRows.has(rowKey)
                    const hasMissing = result.missingCount > 0

                    return (
                      <>
                        <TableRow
                          key={rowKey}
                          className={cn(
                            hasMissing && 'bg-red-50/50 dark:bg-red-950/20'
                          )}
                        >
                          <TableCell>
                            {hasMissing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleRow(rowKey)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{result.languageName}</div>
                              <div className="text-xs text-muted-foreground">
                                {result.languageId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {result.totalCharacters}
                          </TableCell>
                          <TableCell className="text-right">
                            {result.missingCount > 0 ? (
                              <Badge variant="destructive">{result.missingCount}</Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                result.coveragePercent === 100
                                  ? 'default'
                                  : result.coveragePercent >= 95
                                  ? 'secondary'
                                  : 'destructive'
                              }
                            >
                              {result.coveragePercent}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                        {isExpanded && hasMissing && (
                          <TableRow>
                            <TableCell colSpan={5} className="bg-muted/30">
                              <div className="p-4 space-y-2">
                                <div className="text-sm font-medium mb-2">
                                  Missing Glyphs ({result.missingCount}):
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {result.missingGlyphs.map((glyph, idx) => (
                                    <div
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-background border text-sm"
                                      title={`${glyph.hexCode} - ${glyph.codePoint}`}
                                    >
                                      <span className="font-mono text-xs text-muted-foreground">
                                        {glyph.hexCode}
                                      </span>
                                      <span className="text-lg">{glyph.character}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

