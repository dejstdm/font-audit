import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Download, FileJson, FileText, FileSpreadsheet, FileType } from 'lucide-react'
import { type ReportData, exportToJSON, exportToCSV, exportToMarkdown, exportToPDF } from '../lib/export'

interface ExportMenuProps {
  data: ReportData
  disabled?: boolean
}

export default function ExportMenu({ data, disabled }: ExportMenuProps) {
  const handleExport = (format: 'json' | 'csv' | 'markdown' | 'pdf') => {
    switch (format) {
      case 'json':
        exportToJSON(data)
        break
      case 'csv':
        exportToCSV(data)
        break
      case 'markdown':
        exportToMarkdown(data)
        break
      case 'pdf':
        exportToPDF(data)
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled} className="component-export-menu__trigger">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="component-export-menu__content">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('markdown')}>
          <FileText className="h-4 w-4 mr-2" />
          Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileType className="h-4 w-4 mr-2" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

