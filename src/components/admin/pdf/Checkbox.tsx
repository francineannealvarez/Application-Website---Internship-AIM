/**
 * Checkbox.tsx
 * Tiny square checkbox + labeled option, matching the small boxes used
 * throughout the paper form (Civil Status, Yes/No answers) — not an
 * oversized modern checkbox.
 */
 
import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
 
export function CheckSquare({ checked }: { checked: boolean }) {
  return <View style={pdfStyles.checkSquare}>{checked && <Text style={pdfStyles.checkSquareText}>X</Text>}</View>
}
 
export function CheckOption({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={pdfStyles.checkOption}>
      <CheckSquare checked={checked} />
      <Text style={pdfStyles.checkOptionLabel}>{label}</Text>
    </View>
  )
}
 