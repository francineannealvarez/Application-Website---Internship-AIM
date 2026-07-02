/**
 * DataTable.tsx
 * Generic bordered header+rows table, reused for every repeatable table
 * in the document (Government Exams, Employment Record, Activities,
 * Trainings, Character References, Emergency Contacts...). Pass in the
 * column definitions and the row data — same component every time.
 */
 
import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
 
export function DataTable({
  columns,
  rows,
  emptyText,
}: {
  columns: { label: string; width: string }[]
  rows: string[][]
  emptyText: string
}) {
  return (
    <View style={pdfStyles.table}>
      <View style={pdfStyles.theadRow}>
        {columns.map((c, i) => (
          <Text key={i} style={[i === columns.length - 1 ? pdfStyles.thLast : pdfStyles.th, { width: c.width }]}>
            {c.label}
          </Text>
        ))}
      </View>
      {rows.length === 0 ? (
        <View style={{ borderBottomWidth: 0 }}>
          <Text style={pdfStyles.emptyRowText}>{emptyText}</Text>
        </View>
      ) : (
        rows.map((r, ri) => (
          <View key={ri} style={[pdfStyles.tbodyRow, ri === rows.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
            {r.map((cell, ci) => (
              <Text key={ci} style={[ci === r.length - 1 ? pdfStyles.tdLast : pdfStyles.td, { width: columns[ci].width }]}>
                {cell || ' '}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  )
}