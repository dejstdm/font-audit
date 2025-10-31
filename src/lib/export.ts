/**
 * Export functionality for font coverage reports
 * 
 * Supports multiple formats: JSON, CSV, Markdown, PDF
 */

import { type GlyphDetectionResult } from './detect'
import { type LoadedFont } from './fonts'
import { type LanguageSelection } from '../state/store'
import jsPDF from 'jspdf'

export type ReportData = {
  metadata: {
    timestamp: string
    appVersion: string
    totalFonts: number
    totalLanguages: number
    totalMissingGlyphs: number
  }
  fonts: Array<{
    id: string
    name: string
    style: string
    weight: string
    fileName: string
  }>
  languages: Array<{
    id: string
    name: string
    nativeName: string
  }>
  results: Array<{
    fontName: string
    languageId: string
    languageName: string
    totalCharacters: number
    missingCount: number
    coveragePercent: number
    missingGlyphs: Array<{
      character: string
      codePoint: number
      hexCode: string
    }>
  }>
}

/**
 * Aggregate detection results into report data structure
 */
export function aggregateReportData(
  fonts: LoadedFont[],
  languages: LanguageSelection[],
  detectionResults: Map<string, Map<string, GlyphDetectionResult[]>>
): ReportData {
  const results: ReportData['results'] = []
  let totalMissingGlyphs = 0

  for (const font of fonts) {
    const fontResults = detectionResults.get(font.name)
    if (!fontResults) continue

    for (const language of languages) {
      const languageResults = fontResults.get(language.id)
      if (!languageResults) continue

      const missingGlyphs = languageResults.filter(r => r.isMissing)
      const missingCount = missingGlyphs.length
      const totalCharacters = languageResults.length
      const coveragePercent = totalCharacters > 0
        ? Math.round(((totalCharacters - missingCount) / totalCharacters) * 100)
        : 100

      totalMissingGlyphs += missingCount

      results.push({
        fontName: font.name,
        languageId: language.id,
        languageName: language.name,
        totalCharacters,
        missingCount,
        coveragePercent,
        missingGlyphs: missingGlyphs.map(g => ({
          character: g.character,
          codePoint: g.codePoint,
          hexCode: `U+${g.codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
        })),
      })
    }
  }

  return {
    metadata: {
      timestamp: new Date().toISOString(),
      appVersion: '1.0.0',
      totalFonts: fonts.length,
      totalLanguages: languages.length,
      totalMissingGlyphs,
    },
    fonts: fonts.map(f => ({
      id: f.id,
      name: f.name,
      style: f.style,
      weight: f.weight,
      fileName: f.fileName,
    })),
    languages: languages.map(l => ({
      id: l.id,
      name: l.name,
      nativeName: l.nativeName,
    })),
    results,
  }
}

/**
 * Export report data as JSON
 */
export function exportToJSON(data: ReportData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `font-coverage-report-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export report data as CSV
 */
export function exportToCSV(data: ReportData): void {
  const rows: string[] = []
  
  // Header
  rows.push('Font Name,Language ID,Language Name,Character,Code Point,Hex Code,Status')
  
  // Data rows
  for (const result of data.results) {
    if (result.missingGlyphs.length === 0) {
      // Include row for complete coverage
      rows.push(`"${result.fontName}","${result.languageId}","${result.languageName}",,,,Complete`)
    } else {
      for (const glyph of result.missingGlyphs) {
        rows.push(
          `"${result.fontName}","${result.languageId}","${result.languageName}","${glyph.character}","${glyph.codePoint}","${glyph.hexCode}","Missing"`
        )
      }
    }
  }
  
  const csv = rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `font-coverage-report-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export report data as Markdown
 */
export function exportToMarkdown(data: ReportData): void {
  const lines: string[] = []
  
  // Title
  lines.push('# Font Coverage Report')
  lines.push('')
  lines.push(`Generated: ${new Date(data.metadata.timestamp).toLocaleString()}`)
  lines.push(`App Version: ${data.metadata.appVersion}`)
  lines.push('')
  
  // Summary
  lines.push('## Summary')
  lines.push('')
  lines.push(`- **Total Fonts:** ${data.metadata.totalFonts}`)
  lines.push(`- **Total Languages:** ${data.metadata.totalLanguages}`)
  lines.push(`- **Total Missing Glyphs:** ${data.metadata.totalMissingGlyphs}`)
  lines.push('')
  
  // Fonts
  lines.push('## Fonts')
  lines.push('')
  lines.push('| Name | Style | Weight | File Name |')
  lines.push('|------|-------|--------|-----------|')
  for (const font of data.fonts) {
    lines.push(`| ${font.name} | ${font.style} | ${font.weight} | ${font.fileName} |`)
  }
  lines.push('')
  
  // Languages
  lines.push('## Languages')
  lines.push('')
  lines.push('| ID | Name | Native Name |')
  lines.push('|----|------|-------------|')
  for (const lang of data.languages) {
    lines.push(`| ${lang.id} | ${lang.name} | ${lang.nativeName} |`)
  }
  lines.push('')
  
  // Results
  lines.push('## Coverage Results')
  lines.push('')
  
  // Group by font
  const resultsByFont = new Map<string, ReportData['results']>()
  for (const result of data.results) {
    if (!resultsByFont.has(result.fontName)) {
      resultsByFont.set(result.fontName, [])
    }
    resultsByFont.get(result.fontName)!.push(result)
  }
  
  for (const [fontName, fontResults] of resultsByFont.entries()) {
    lines.push(`### ${fontName}`)
    lines.push('')
    lines.push('| Language | Total Characters | Missing | Coverage |')
    lines.push('|----------|------------------|---------|----------|')
    
    for (const result of fontResults) {
      lines.push(
        `| ${result.languageName} (${result.languageId}) | ${result.totalCharacters} | ${result.missingCount} | ${result.coveragePercent}% |`
      )
    }
    lines.push('')
    
    // Missing glyphs details
    const hasMissingGlyphs = fontResults.some(r => r.missingCount > 0)
    if (hasMissingGlyphs) {
      lines.push('#### Missing Glyphs')
      lines.push('')
      lines.push('| Language | Character | Code Point | Hex Code |')
      lines.push('|----------|-----------|------------|----------|')
      
      for (const result of fontResults) {
        if (result.missingGlyphs.length > 0) {
          for (const glyph of result.missingGlyphs) {
            lines.push(
              `| ${result.languageName} | ${glyph.character} | ${glyph.codePoint} | ${glyph.hexCode} |`
            )
          }
        }
      }
      lines.push('')
    }
  }
  
  const markdown = lines.join('\n')
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `font-coverage-report-${new Date().toISOString().split('T')[0]}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export report data as PDF
 */
export function exportToPDF(data: ReportData): void {
  const doc = new jsPDF()
  let yPos = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const maxWidth = pageWidth - (margin * 2)
  
  // Helper to add text with wrapping
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(text, maxWidth)
    if (yPos + (lines.length * fontSize * 0.4) > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      yPos = 20
    }
    doc.text(lines, margin, yPos)
    yPos += lines.length * fontSize * 0.4 + 5
  }
  
  // Title
  addText('Font Coverage Report', 16, true)
  yPos += 5
  
  // Metadata
  addText(`Generated: ${new Date(data.metadata.timestamp).toLocaleString()}`, 10)
  addText(`App Version: ${data.metadata.appVersion}`, 10)
  yPos += 5
  
  // Summary
  addText('Summary', 12, true)
  addText(`Total Fonts: ${data.metadata.totalFonts}`, 10)
  addText(`Total Languages: ${data.metadata.totalLanguages}`, 10)
  addText(`Total Missing Glyphs: ${data.metadata.totalMissingGlyphs}`, 10)
  yPos += 10
  
  // Fonts
  addText('Fonts', 12, true)
  for (const font of data.fonts) {
    addText(`${font.name} - ${font.style} ${font.weight} (${font.fileName})`, 10)
  }
  yPos += 10
  
  // Results summary table
  addText('Coverage Results', 12, true)
  yPos += 5
  
  // Group by font
  const resultsByFont = new Map<string, ReportData['results']>()
  for (const result of data.results) {
    if (!resultsByFont.has(result.fontName)) {
      resultsByFont.set(result.fontName, [])
    }
    resultsByFont.get(result.fontName)!.push(result)
  }
  
  for (const [fontName, fontResults] of resultsByFont.entries()) {
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      yPos = 20
    }
    
    addText(fontName, 11, true)
    yPos += 3
    
    // Table headers
    const tableHeaders = ['Language', 'Total', 'Missing', 'Coverage']
    const colWidths = [70, 25, 25, 30]
    let xPos = margin
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    for (let i = 0; i < tableHeaders.length; i++) {
      doc.text(tableHeaders[i], xPos, yPos)
      xPos += colWidths[i]
    }
    yPos += 7
    
    // Table rows
    doc.setFont('helvetica', 'normal')
    for (const result of fontResults) {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        yPos = 20
      }
      
      xPos = margin
      const rowData = [
        `${result.languageName} (${result.languageId})`,
        String(result.totalCharacters),
        String(result.missingCount),
        `${result.coveragePercent}%`,
      ]
      
      doc.setFontSize(8)
      for (let i = 0; i < rowData.length; i++) {
        const text = doc.splitTextToSize(rowData[i], colWidths[i] - 2)
        doc.text(text, xPos, yPos)
        xPos += colWidths[i]
      }
      yPos += 6
    }
    
    yPos += 5
  }
  
  // Save PDF
  doc.save(`font-coverage-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

