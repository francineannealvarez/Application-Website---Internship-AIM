/**
 * YesNoQuestion.tsx
 * One row of the "Yes/No + if yes, please provide details" pattern used
 * for the six background questions (case filed, convicted, smokes, asked
 * to resign, surgery, outstanding loans). One component, called six times.
 */
 
import React from 'react'
import { View, Text } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
import { CheckOption } from './Checkbox'
 
export interface YesNoDetail {
  answer: 'Yes' | 'No'
  details?: string
}
 
export function YesNoQuestion({ question, detail }: { question: string; detail: YesNoDetail }) {
  return (
    <View style={pdfStyles.ynRow} wrap={false}>
      <View style={pdfStyles.ynQuestionLine}>
        <Text style={pdfStyles.ynQuestion}>{question}</Text>
        <CheckOption checked={detail.answer === 'Yes'} label="Yes" />
        <CheckOption checked={detail.answer === 'No'} label="No" />
      </View>
      <Text style={pdfStyles.ynDetailLine}>
        If yes, please provide details: {detail.answer === 'Yes' && detail.details ? detail.details : '_______________________________'}
      </Text>
    </View>
  )
}
 