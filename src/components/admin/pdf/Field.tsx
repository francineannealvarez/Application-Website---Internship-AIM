/**
 * Field.tsx
 * A single labeled cell inside the form grid (e.g. "Last Name" + its value).
 * `Row` is the flex container that holds a group of Fields side by side —
 * every field row in the document (name row, DOB row, etc.) is built from
 * one <Row> wrapping several <Field>s.
 */
 
import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
 
export function Row({ children, minHeight, noWrap = true }: { children: React.ReactNode; minHeight?: number; noWrap?: boolean }) {
  return (
    <View style={[pdfStyles.row, minHeight ? { minHeight } : {}]} wrap={!noWrap}>
      {children}
    </View>
  )
}
 
export function Field({
  label,
  value,
  width,
  last,
}: {
  label: string
  value?: string
  width?: string | number
  last?: boolean
}) {
  return (
    <View style={[last ? pdfStyles.cellLast : pdfStyles.cell, width ? { width } : { flex: 1 }]}>
      <Text style={pdfStyles.label}>{label}</Text>
      <Text style={pdfStyles.value}>{value && value.trim() ? value : ' '}</Text>
    </View>
  )
}