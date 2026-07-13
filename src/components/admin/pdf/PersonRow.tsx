/**
 * PersonRow.tsx
 * The "Name of ___ | Address | Occupation & Company | Age" row pattern
 * used four times on the paper form (Father, Mother, Sibling(s), Spouse).
 * One component, reused each time — same pattern as the reusable
 * "+ Add [Item]" repeatable-section idea from the applicant portal spec.
 */
 
import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
import { Field } from './Field'
 
export function PersonRow({
  label,
  name,
  address,
  occupation,
  age,
}: {
  label: string
  name?: string
  address?: string
  occupation?: string
  age?: string
}) {
  return (
    <View style={pdfStyles.row} wrap={false}>
      <View style={[pdfStyles.cell, { width: '28%' }]}>
        <Text style={pdfStyles.label}>{label}</Text>
        <Text style={pdfStyles.value}>{name || ' '}</Text>
      </View>
      <Field label="Address" value={address} width="28%" />
      <Field label="Occupation & Company" value={occupation} width="28%" />
      <Field label="Age" value={age} width="16%" last />
    </View>
  )
}
 