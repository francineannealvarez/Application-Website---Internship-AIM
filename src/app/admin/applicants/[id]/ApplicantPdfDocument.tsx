'use client'
 
/**
 * ApplicantPdfDocument.tsx
 * ─────────────────────────────────────────────────────────────
 * Renders an applicant's full submission as a PDF that mirrors
 * AIMI's paper "Personal Information Sheet" — same sections, same
 * field order, same field labels — but built with @react-pdf/renderer
 * so it lays out on real A4 pages and paginates automatically
 * (2 pages for a light submission, 3+ if the applicant filled in a
 * lot of repeatable rows — siblings, employment history, references, etc).
 *
 * This file only READS applicant data — it does not fetch or mutate
 * anything. Pass it the same `ApplicantDetail` object already loaded
 * on the profile page.
 *
 * Requires: npm install @react-pdf/renderer
 * ─────────────────────────────────────────────────────────────
 */
 
import React from 'react'
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ApplicantDetail } from './page'
 
// ─── Styles ─────────────────────────────────────────────────
const BORDER = '#000000'
 
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
 
  // Header
  headerBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: BORDER,
  },
  logoCell: {
    width: 64,
    borderRightWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logoText: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleCell: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  formTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 3,
  },
  photoCell: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  photoText: {
    fontSize: 7,
    color: '#666666',
  },
 
  // Generic bordered field row / cell
  row: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  cell: {
    padding: 3,
    borderRightWidth: 1,
    borderColor: BORDER,
    justifyContent: 'flex-start',
  },
  cellLast: {
    padding: 3,
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 6,
    color: '#555555',
    marginBottom: 1,
  },
  value: {
    fontSize: 8,
  },
 
  // Section header bar
  sectionBar: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
    backgroundColor: '#e9edf0',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  sectionBarText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  subLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    marginTop: 6,
    marginBottom: 2,
  },
 
  // Tables
  table: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
  },
  theadRow: {
    flexDirection: 'row',
    backgroundColor: '#e9edf0',
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  tbodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  th: {
    padding: 3,
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    borderRightWidth: 1,
    borderColor: BORDER,
  },
  td: {
    padding: 3,
    fontSize: 7,
    borderRightWidth: 1,
    borderColor: BORDER,
  },
  thLast: { padding: 3, fontSize: 6.5, fontFamily: 'Helvetica-Bold' },
  tdLast: { padding: 3, fontSize: 7 },
  emptyRowText: {
    padding: 4,
    fontSize: 7,
    color: '#777777',
    fontStyle: 'italic',
  },
 
  // Yes/No question block
  ynRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
    padding: 4,
    alignItems: 'flex-start',
  },
  ynQuestion: { fontSize: 7.5, flex: 1 },
  ynAnswer: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', width: 70 },
  ynDetail: { fontSize: 6.5, color: '#333333', marginTop: 2 },
 
  noteBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
    padding: 4,
  },
  noteText: { fontSize: 6.5, color: '#333333' },
 
  certBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
    padding: 5,
  },
  certText: { fontSize: 6.5, marginBottom: 4, lineHeight: 1.3 },
 
  footerRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: BORDER,
  },
  footerCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  footerCellLast: { flex: 1, padding: 6, alignItems: 'center' },
  footerValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  footerCaption: { fontSize: 6, color: '#555555' },
})
 
// ─── Small building blocks ─────────────────────────────────
function Field({
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
    <View style={[last ? styles.cellLast : styles.cell, width ? { width } : { flex: 1 }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value && value.trim() ? value : ' '}</Text>
    </View>
  )
}
 
function SectionBar({ title }: { title: string }) {
  return (
    <View style={styles.sectionBar}>
      <Text style={styles.sectionBarText}>{title}</Text>
    </View>
  )
}
 
function SubLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subLabel}>{children}</Text>
}
 
function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <Text style={{ fontSize: 7.5, marginRight: 8 }}>
      {checked ? '[X] ' : '[ ] '}
      {label}
    </Text>
  )
}
 
function EmptyRow({ text }: { text: string }) {
  return (
    <View style={{ borderBottomWidth: 1, borderColor: BORDER }}>
      <Text style={styles.emptyRowText}>{text}</Text>
    </View>
  )
}
 
// Generic table with header + rows, last column has no right border
function DataTable({
  columns,
  rows,
  emptyText,
}: {
  columns: { label: string; width: string }[]
  rows: string[][]
  emptyText: string
}) {
  return (
    <View style={styles.table}>
      <View style={styles.theadRow}>
        {columns.map((c, i) => (
          <Text
            key={i}
            style={[i === columns.length - 1 ? styles.thLast : styles.th, { width: c.width }]}
          >
            {c.label}
          </Text>
        ))}
      </View>
      {rows.length === 0 ? (
        <EmptyRow text={emptyText} />
      ) : (
        rows.map((r, ri) => (
          <View key={ri} style={styles.tbodyRow} wrap={false}>
            {r.map((cell, ci) => (
              <Text
                key={ci}
                style={[ci === r.length - 1 ? styles.tdLast : styles.td, { width: columns[ci].width }]}
              >
                {cell || ' '}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  )
}
 
// ─── Document ───────────────────────────────────────────────
export function ApplicantPdfDocument({ applicant }: { applicant: ApplicantDetail }) {
  const p = applicant.personalInfo
  const f = applicant.familyBackground
  const e = applicant.educationBackground
  const o = applicant.otherInfo
  const r = applicant.references
  const av = applicant.availability
 
  const familyRows: string[][] = [
    ['Father', f.father.name || '', f.father.address || '', f.father.occupation || '', f.father.age || ''],
    ['Mother', f.mother.name || '', f.mother.address || '', f.mother.occupation || '', f.mother.age || ''],
    ...f.siblings.map((s) => ['Sibling', s.name, s.address, s.occupation, s.age]),
  ]
  if (p.civilStatus === 'Married' && f.spouse) {
    familyRows.push(['Spouse', f.spouse.name || '', f.spouse.address || '', f.spouse.occupation || '', f.spouse.age || ''])
  }
 
  const eduRows: [string, typeof e.elementary][] = [
    ['Elementary', e.elementary],
    ['Secondary', e.secondary],
    ['College', e.college],
    ['Post-Graduate', e.postGraduate],
    ['Vocational', e.vocational],
  ]
 
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.headerBox}>
          <View style={styles.logoCell}>
            <Text style={styles.logoText}>AIMI</Text>
          </View>
          <View style={styles.titleCell}>
            <Text style={styles.companyName}>ARVIN INTERNATIONAL MARKETING, INC</Text>
            <Text style={styles.formTitle}>PERSONAL INFORMATION SHEET</Text>
          </View>
          <View style={styles.photoCell}>
            <Text style={styles.photoText}>Photo</Text>
          </View>
        </View>
 
        {/* Date / Date Hired / Salary Desired */}
        <View style={styles.row}>
          <Field label="Date" value={av.submittedDate} />
          <Field label="Date Hired" value="" />
          <Field label="Salary Desired" value="" last />
        </View>
 
        {/* Name */}
        <View style={styles.row}>
          <Field label="Last Name" value={applicant.name.split(' ').slice(-1)[0]} />
          <Field label="First Name" value={applicant.name.split(' ').slice(0, -1).join(' ')} />
          <Field label="Middle Name" value="" />
          <Field label="Nickname" value="" last />
        </View>
 
        {/* Addresses / Contact */}
        <View style={styles.row}>
          <Field label="Present Address" value={p.presentAddress} width="34%" />
          <Field label="Provincial Address" value={p.provincialAddress} width="33%" />
          <View style={styles.cellLast}>
            <Text style={styles.label}>Contact Numbers</Text>
            <Text style={styles.value}>residence: {p.residenceNumber || '—'}</Text>
            <Text style={styles.value}>cellphone: {p.cellphone}</Text>
            <Text style={styles.value}>e-mail: {p.email}</Text>
          </View>
        </View>
 
        {/* DOB row */}
        <View style={styles.row}>
          <Field label="Date of Birth" value={p.dateOfBirth} width="16%" />
          <Field label="Place of Birth" value={p.placeOfBirth} width="17%" />
          <Field label="Nationality" value={p.nationality} width="17%" />
          <Field label="Sex" value={p.sex} width="10%" />
          <Field label="Age" value={p.age} width="10%" />
          <Field label="Height" value={p.height} width="15%" />
          <Field label="Weight" value={p.weight} width="15%" last />
        </View>
 
        {/* Civil status / gov numbers */}
        <View style={styles.row}>
          <View style={[styles.cell, { width: '30%' }]}>
            <Text style={styles.label}>Civil Status</Text>
            <Checkbox checked={p.civilStatus === 'Single'} label="Single" />
            <Checkbox checked={p.civilStatus === 'Married'} label="Married" />
            <Checkbox checked={p.civilStatus === 'Widowed'} label="Widowed" />
            <Checkbox checked={p.civilStatus === 'Separated'} label="Separated" />
          </View>
          <Field label="SSS Number" value={p.sssNumber} width="17.5%" />
          <Field label="T.I.N." value={p.tin} width="17.5%" />
          <Field label="Pag-IBIG #" value={p.pagibigNumber} width="17.5%" />
          <Field label="PhilHealth #" value={p.philhealthNumber} width="17.5%" last />
        </View>
 
        {/* Family Background */}
        <SectionBar title="Family Background" />
        <DataTable
          columns={[
            { label: 'Relation', width: '13%' },
            { label: 'Name', width: '27%' },
            { label: 'Address', width: '27%' },
            { label: 'Occupation & Company', width: '23%' },
            { label: 'Age', width: '10%' },
          ]}
          rows={familyRows}
          emptyText="No family information provided."
        />
 
        {/* Children */}
        <SubLabel>Names of Children</SubLabel>
        <DataTable
          columns={[
            { label: 'Name', width: '75%' },
            { label: 'Age', width: '25%' },
          ]}
          rows={f.children.map((c) => [c.name, c.age])}
          emptyText="None listed."
        />
 
        {/* Relative employed */}
        <SubLabel>
          Do you have relative(s) whether by consanguinity or affinity, or friend(s) who is/are presently
          employed with our company? — {f.hasRelativeInCompany}
        </SubLabel>
        {f.hasRelativeInCompany === 'Yes' && (
          <DataTable
            columns={[
              { label: 'Complete Name', width: '40%' },
              { label: 'Position/Department', width: '35%' },
              { label: 'Relationship', width: '25%' },
            ]}
            rows={f.relativeDetails ? [[f.relativeDetails.name, f.relativeDetails.position, f.relativeDetails.relationship]] : []}
            emptyText="Not specified."
          />
        )}
 
        <View style={styles.row}>
          <Field label="How did you learn about our company?" value={f.howLearned} />
          <Field label="Who referred you to us?" value={f.referredBy} last />
        </View>
 
        {/* Educational Background */}
        <SectionBar title="Educational Background" />
        <View style={styles.table}>
          <View style={styles.theadRow}>
            <Text style={[styles.th, { width: '14%' }]}>Level</Text>
            <Text style={[styles.th, { width: '32%' }]}>School and Address</Text>
            <Text style={[styles.th, { width: '18%' }]}>Years Attended (from-to)</Text>
            <Text style={[styles.th, { width: '18%' }]}>Degree/Major</Text>
            <Text style={[styles.thLast, { width: '18%' }]}>Academic Honors</Text>
          </View>
          {eduRows.map(([label, entry], i) => (
            <View key={i} style={styles.tbodyRow} wrap={false}>
              <Text style={[styles.td, { width: '14%' }]}>{label}</Text>
              <Text style={[styles.td, { width: '32%' }]}>
                {entry ? [entry.school, entry.address].filter(Boolean).join(', ') : ''}
              </Text>
              <Text style={[styles.td, { width: '18%' }]}>{entry?.yearsAttended || ''}</Text>
              <Text style={[styles.td, { width: '18%' }]}>{entry?.degree || ''}</Text>
              <Text style={[styles.tdLast, { width: '18%' }]}>{entry?.honors || ''}</Text>
            </View>
          ))}
        </View>
 
        <SubLabel>Government Examination(s) Taken</SubLabel>
        <DataTable
          columns={[
            { label: 'Exam', width: '50%' },
            { label: 'Date', width: '25%' },
            { label: 'Rating', width: '25%' },
          ]}
          rows={e.govExams.map((g) => [g.name, g.date, g.rating])}
          emptyText="None taken."
        />
 
        {/* Employment Record */}
        <SectionBar title="Employment Record" />
        <DataTable
          columns={[
            { label: 'Position', width: '20%' },
            { label: 'Name and Address of Employer', width: '30%' },
            { label: 'From', width: '10%' },
            { label: 'To', width: '10%' },
            { label: 'Salary', width: '12%' },
            { label: 'Reason for Leaving', width: '18%' },
          ]}
          rows={applicant.employmentRecord.map((j) => [j.position, j.employer, j.from, j.to, j.salary || '', j.reason || ''])}
          emptyText="No prior employment (e.g. fresh graduate)."
        />
 
        {/* Other Information */}
        <SectionBar title="Other Information" />
        <SubLabel>Activities (School, Community, Professional Organizations)</SubLabel>
        <DataTable
          columns={[
            { label: 'Organization/Club', width: '40%' },
            { label: 'Position(s) Held', width: '30%' },
            { label: 'Inclusive Dates', width: '30%' },
          ]}
          rows={o.activities.map((a) => [a.org, a.position, a.dates])}
          emptyText="None listed."
        />
 
        <SubLabel>Special Skills, Qualifications, Talents and Hobbies</SubLabel>
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{o.skillsHobbies || 'None listed.'}</Text>
        </View>
 
        <SubLabel>Trainings and Seminars Attended</SubLabel>
        <DataTable
          columns={[
            { label: 'Title/Topic', width: '40%' },
            { label: 'Company', width: '30%' },
            { label: 'Inclusive Dates', width: '30%' },
          ]}
          rows={o.trainings.map((t) => [t.title, t.company, t.dates])}
          emptyText="None listed."
        />
 
        {[
          ['Has there been case/s filed against you?', o.caseFiled],
          ['Have you ever been convicted of any offense or crime?', o.convicted],
          ['Do you smoke?', o.smokes],
          ['Have you ever been asked to resign or terminated/dismissed by a previous employer?', o.askedToResign],
          ['Have you undergone any surgery?', o.surgery],
          ['Do you have any outstanding loans?', o.outstandingLoans],
        ].map(([question, detail], i) => {
          const q = question as string
          const d = detail as { answer: 'Yes' | 'No'; details?: string }
          return (
            <View key={i} style={styles.ynRow} wrap={false}>
              <Text style={styles.ynQuestion}>{q}</Text>
              <Text style={styles.ynAnswer}>
                [{d.answer === 'Yes' ? 'X' : ' '}] Yes   [{d.answer === 'No' ? 'X' : ' '}] No
              </Text>
              {d.answer === 'Yes' && d.details ? (
                <Text style={styles.ynDetail}> — {d.details}</Text>
              ) : null}
            </View>
          )
        })}
 
        {/* References */}
        <SectionBar title="References" />
        <SubLabel>Person(s) to be Notified in Case of Emergency (excludes relatives / present employer)</SubLabel>
        <DataTable
          columns={[
            { label: 'Name', width: '30%' },
            { label: 'Relationship', width: '20%' },
            { label: 'Exact Address', width: '30%' },
            { label: 'Telephone Number', width: '20%' },
          ]}
          rows={r.emergencyContacts.map((c) => [c.name, c.relationship, c.address, c.phone])}
          emptyText="None provided."
        />
 
        <SubLabel>Character References</SubLabel>
        <DataTable
          columns={[
            { label: 'Name', width: '25%' },
            { label: 'Occupation', width: '25%' },
            { label: 'Exact Address', width: '30%' },
            { label: 'Telephone Number', width: '20%' },
          ]}
          rows={r.characterReferences.map((c) => [c.name, c.occupation, c.address, c.phone])}
          emptyText="None provided."
        />
 
        {/* Sketch note */}
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Please provide sketch of your residence going to/from AIMI location or area of assignment in a
            separate sheet. (Submitted separately as "Location Sketch" — see attached file
            {applicant.locationSketch ? `: ${applicant.locationSketch.fileName}` : ' — none submitted yet'}.)
          </Text>
        </View>
 
        {/* Availability */}
        <SectionBar title="Availability" />
        <View style={styles.row}>
          <Field label="How soon can you start?" value={av.howSoon} />
          <Field label="Do you have any pending applications with other companies?" value={av.pendingApplications || 'None stated'} last />
        </View>
 
        {/* Certifications */}
        <View style={styles.certBox}>
          <Text style={styles.certText}>
            [{av.certifiedNoObligation ? 'X' : ' '}] I hereby confirm that the mere filing of this form does
            not obligate the company to hire my services. I understand that if I am hired, this application
            and all I have stated herein shall form part of my 201 file.
          </Text>
          <Text style={styles.certText}>
            [{av.certifiedTruth ? 'X' : ' '}] I hereby certify to the truth and correctness of the above
            information and data. I relieve AIMI from any liabilities, resulting from verifying the above
            information and I understand that any false or fraudulent information made in this application
            form shall constitute sufficient ground for disapproval of my application or if employed, for
            termination for cause.
          </Text>
        </View>
 
        {/* Footer */}
        <View style={styles.footerRow} wrap={false}>
          <View style={styles.footerCell}>
            <Text style={styles.footerValue}>{av.submittedDate}</Text>
            <Text style={styles.footerCaption}>DATE</Text>
          </View>
          <View style={styles.footerCellLast}>
            <Text style={styles.footerValue}>{av.signatureName}</Text>
            <Text style={styles.footerCaption}>APPLICANT'S SIGNATURE</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
 
export default ApplicantPdfDocument