/**
 * SectionHeading.tsx
 * Plain bold centered text used for the three major section titles
 * ("Educational Background", "Employment Record", "Other Information")
 * — no fill, no border, sits tight against the table right below it,
 * matching the paper form instead of a shaded modern "card header".
 */
 
import React from 'react'
import { Text } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
 
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <Text style={pdfStyles.sectionHeading}>{children}</Text>
}
 
export function SubHeading({ children }: { children: React.ReactNode }) {
  return <Text style={pdfStyles.subHeading}>{children}</Text>
}
 