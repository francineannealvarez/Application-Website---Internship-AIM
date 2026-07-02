'use client'
 
/**
 * ApplicantPdfDocument.tsx
 * ─────────────────────────────────────────────────────────────
 * Assembles the applicant's saved answers into a PDF that follows AIMI's
 * paper "Personal Information Sheet" field-for-field: the checkbox grid
 * for Civil Status, the Name of Father/Mother/Sibling(s)/Spouse rows,
 * the SSS-over-Pag-IBIG / T.I.N.-over-PhilHealth stacked columns,
 * Educational Background + Employment Record tables, the six Yes/No
 * background questions, Character References + Emergency Contact
 * tables, the sketch reminder, certification statements, and the
 * Date/Signature footer — in that order, tight against each other like
 * the original continuous grid (no big card-style gaps between sections).
 *
 * The actual layout pieces (Header, Field, PersonRow, DataTable,
 * YesNoQuestion, SectionHeading, Checkbox) live in
 * components/admin/pdf/ — reusable, one definition each, edited in one
 * place if AIMI ever changes a field.
 *
 * Built with @react-pdf/renderer on a single <Page size="A4" wrap>, so it
 * paginates itself: a light submission prints on 2 pages, a fuller one
 * (more siblings, employment history, references, etc.) flows onto a 3rd
 * page automatically — no manual page-splitting.
 *
 * This file only READS applicant data — it does not fetch or mutate
 * anything. Pass it the same `ApplicantDetail` object already loaded on
 * the profile page.
 *
 * Requires: npm install @react-pdf/renderer
 * Also requires: public/logo.png (see components/admin/pdf/Header.tsx)
 * ─────────────────────────────────────────────────────────────
 */
 
import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import type { ApplicantDetail } from './page'
 
import { pdfStyles } from '@/components/admin/pdf/pdfStyles'
import { Row, Field } from '@/components/admin/pdf/Field'
import {Header} from '@/components/admin/pdf/Header'
import { CheckOption } from '@/components/admin/pdf/Checkbox'
import { PersonRow } from '@/components/admin/pdf/PersonRow'
import { DataTable } from '@/components/admin/pdf/DataTable'
import { YesNoQuestion } from '@/components/admin/pdf/YesNoQuestion'
import { SectionHeading, SubHeading } from '@/components/admin/pdf/SectionHeading'
 
export function ApplicantPdfDocument({ applicant }: { applicant: ApplicantDetail }) {
  const p = applicant.personalInfo
  const f = applicant.familyBackground
  const e = applicant.educationBackground
  const o = applicant.otherInfo
  const r = applicant.references
  const av = applicant.availability
 
  const eduRows: [string, typeof e.elementary][] = [
    ['Elementary', e.elementary],
    ['Secondary', e.secondary],
    ['College', e.college],
    ['Post-Graduate', e.postGraduate],
    ['Vocational', e.vocational],
  ]
 
  const lastName = applicant.name.split(' ').slice(-1)[0]
  const firstName = applicant.name.split(' ').slice(0, -1).join(' ')
 
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <Header />
 
        <Row>
          <Field label="Date" value={av.submittedDate} />
          <Field label="DATE HIRED:" value="" />
          <Field label="Salary Desired" value="" last />
        </Row>
 
        <Row>
          <Field label="Last Name" value={lastName} />
          <Field label="First Name" value={firstName} />
          <Field label="Middle Name" value="" />
          <Field label="Nickname" value="" last />
        </Row>
 
        <Row minHeight={38}>
          <Field label="Present Address" value={p.presentAddress} width="34%" />
          <Field label="Provincial Address" value={p.provincialAddress} width="30%" />
          <View style={pdfStyles.cellLast}>
            <Text style={pdfStyles.label}>Contact Numbers</Text>
            <Text style={pdfStyles.value}>residence: {p.residenceNumber || ' '}</Text>
            <Text style={pdfStyles.value}>cellphone: {p.cellphone}</Text>
            <Text style={pdfStyles.value}>e-mail: {p.email}</Text>
            <Text style={pdfStyles.value}>Religion: {' '}</Text>
          </View>
        </Row>
 
        <Row>
          <Field label="Date of Birth" value={p.dateOfBirth} width="16%" />
          <Field label="Place of Birth" value={p.placeOfBirth} width="17%" />
          <Field label="Nationality" value={p.nationality} width="17%" />
          <Field label="Sex" value={p.sex} width="10%" />
          <Field label="Age" value={p.age} width="10%" />
          <Field label="Height" value={p.height} width="15%" />
          <Field label="Weight" value={p.weight} width="15%" last />
        </Row>
 
        <Row>
          <View style={[pdfStyles.cell, { width: '26%' }]}>
            <Text style={pdfStyles.label}>Civil Status</Text>
            <View style={{ flexDirection: 'row' }}>
              <CheckOption checked={p.civilStatus === 'Single'} label="single" />
              <CheckOption checked={p.civilStatus === 'Widowed'} label="widowed" />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <CheckOption checked={p.civilStatus === 'Married'} label="married" />
              <CheckOption checked={p.civilStatus === 'Separated'} label="separated" />
            </View>
          </View>
          <View style={[pdfStyles.cell, { width: '37%' }]}>
            <Text style={pdfStyles.label}>SSS Number</Text>
            <Text style={pdfStyles.value}>{p.sssNumber || ' '}</Text>
            <Text style={[pdfStyles.label, { marginTop: 3 }]}>Pag-ibig #</Text>
            <Text style={pdfStyles.value}>{p.pagibigNumber || ' '}</Text>
          </View>
          <View style={[pdfStyles.cellLast, { width: '37%' }]}>
            <Text style={pdfStyles.label}>T.I.N.</Text>
            <Text style={pdfStyles.value}>{p.tin || ' '}</Text>
            <Text style={[pdfStyles.label, { marginTop: 3 }]}>PhilHealth #</Text>
            <Text style={pdfStyles.value}>{p.philhealthNumber || ' '}</Text>
          </View>
        </Row>
 
        <PersonRow label="Name of Father" name={f.father.name} address={f.father.address} occupation={f.father.occupation} age={f.father.age} />
        <PersonRow label="Name of Mother" name={f.mother.name} address={f.mother.address} occupation={f.mother.occupation} age={f.mother.age} />
        {f.siblings.length === 0 ? (
          <PersonRow label="Name of Brother(s)/Sister(s)" name="" address="" occupation="" age="" />
        ) : (
          f.siblings.map((s, i) => (
            <PersonRow
              key={s.id}
              label={i === 0 ? 'Name of Brother(s)/Sister(s)' : ''}
              name={s.name}
              address={s.address}
              occupation={s.occupation}
              age={s.age}
            />
          ))
        )}
        <PersonRow
          label="Name of Spouse"
          name={p.civilStatus === 'Married' ? f.spouse?.name : ''}
          address={p.civilStatus === 'Married' ? f.spouse?.address : ''}
          occupation={p.civilStatus === 'Married' ? f.spouse?.occupation : ''}
          age={p.civilStatus === 'Married' ? f.spouse?.age : ''}
        />
 
        <Row>
          <View style={[pdfStyles.cell, { width: '28%' }]}>
            <Text style={pdfStyles.label}>Names of Children / Ages</Text>
            {f.children.length === 0 ? (
              <Text style={pdfStyles.value}>None listed.</Text>
            ) : (
              f.children.map((c) => (
                <Text key={c.id} style={pdfStyles.value}>
                  {c.name} — {c.age}
                </Text>
              ))
            )}
          </View>
          <View style={pdfStyles.cellLast}>
            <Text style={pdfStyles.label}>
              Do you have relative(s) whether by consanguinity or affinity, or friend(s) who is/are presently
              employed with our company? — {f.hasRelativeInCompany}
            </Text>
            {f.hasRelativeInCompany === 'Yes' && f.relativeDetails && (
              <Text style={pdfStyles.value}>
                {f.relativeDetails.name} · {f.relativeDetails.position} · Relationship: {f.relativeDetails.relationship}
              </Text>
            )}
            <Text style={[pdfStyles.label, { marginTop: 3 }]}>How did you learn about our company?</Text>
            <Text style={pdfStyles.value}>{f.howLearned || ' '}</Text>
            <Text style={[pdfStyles.label, { marginTop: 3 }]}>Who referred you to us?</Text>
            <Text style={pdfStyles.value}>{f.referredBy || ' '}</Text>
          </View>
        </Row>
 
        <SectionHeading>Educational Background</SectionHeading>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.theadRow}>
            <Text style={[pdfStyles.th, { width: '14%' }]}>Level</Text>
            <Text style={[pdfStyles.th, { width: '32%' }]}>School and Address</Text>
            <Text style={[pdfStyles.th, { width: '18%' }]}>Years Attended (from-to)</Text>
            <Text style={[pdfStyles.th, { width: '18%' }]}>Degree/Major</Text>
            <Text style={[pdfStyles.thLast, { width: '18%' }]}>Academic Honors</Text>
          </View>
          {eduRows.map(([label, entry], i) => (
            <View key={i} style={[pdfStyles.tbodyRow, i === eduRows.length - 1 ? { borderBottomWidth: 0 } : {}]} wrap={false}>
              <Text style={[pdfStyles.td, { width: '14%' }]}>{label}</Text>
              <Text style={[pdfStyles.td, { width: '32%' }]}>{entry ? [entry.school, entry.address].filter(Boolean).join(', ') : ''}</Text>
              <Text style={[pdfStyles.td, { width: '18%' }]}>{entry?.yearsAttended || ''}</Text>
              <Text style={[pdfStyles.td, { width: '18%' }]}>{entry?.degree || ''}</Text>
              <Text style={[pdfStyles.tdLast, { width: '18%' }]}>{entry?.honors || ''}</Text>
            </View>
          ))}
        </View>
 
        <DataTable
          columns={[
            { label: 'Government Examination(s) Taken', width: '50%' },
            { label: 'Date', width: '25%' },
            { label: 'Rating', width: '25%' },
          ]}
          rows={e.govExams.map((g) => [g.name, g.date, g.rating])}
          emptyText="None taken."
        />
 
        <SectionHeading>Employment Record</SectionHeading>
        <DataTable
          columns={[
            { label: 'Position', width: '18%' },
            { label: 'Name and Address of Employer', width: '32%' },
            { label: 'From', width: '10%' },
            { label: 'To', width: '10%' },
            { label: 'Salary', width: '12%' },
            { label: 'Reason for Leaving', width: '18%' },
          ]}
          rows={applicant.employmentRecord.map((j) => [j.position, j.employer, j.from, j.to, j.salary || '', j.reason || ''])}
          emptyText="No prior employment (e.g. fresh graduate)."
        />
 
        <SectionHeading>Other Information</SectionHeading>
        <SubHeading>Activities (please include involvement in School, Community and Professional Organizations)</SubHeading>
        <DataTable
          columns={[
            { label: 'Organization/Club', width: '40%' },
            { label: 'Position(s) Held', width: '30%' },
            { label: 'Inclusive Dates', width: '30%' },
          ]}
          rows={o.activities.map((a) => [a.org, a.position, a.dates])}
          emptyText="None listed."
        />
 
        <SubHeading>Special Skills, Qualifications, Talents and Hobbies</SubHeading>
        <View style={pdfStyles.noteBox}>
          <Text style={pdfStyles.noteText}>{o.skillsHobbies || ' '}</Text>
        </View>
 
        <SubHeading>Trainings and Seminars Attended</SubHeading>
        <DataTable
          columns={[
            { label: 'Title/Topic', width: '35%' },
            { label: 'Company', width: '35%' },
            { label: 'Inclusive Dates', width: '30%' },
          ]}
          rows={o.trainings.map((t) => [t.title, t.company, t.dates])}
          emptyText="None listed."
        />
 
        <YesNoQuestion question="Has there been case/s filed against you?" detail={o.caseFiled} />
        <YesNoQuestion question="Have you ever been convicted of any offense or crime?" detail={o.convicted} />
        <YesNoQuestion question="Do you smoke?" detail={o.smokes} />
        <YesNoQuestion question="Have you ever been asked to resign or terminated/dismissed by a previous employer?" detail={o.askedToResign} />
        <YesNoQuestion question="Have you undergone any surgery?" detail={o.surgery} />
        <YesNoQuestion question="Do you have any outstanding loans?" detail={o.outstandingLoans} />
 
        <SubHeading>Character References</SubHeading>
        <DataTable
          columns={[
            { label: 'Name', width: '25%' },
            { label: 'Occupation', width: '25%' },
            { label: 'Exact Address', width: '30%' },
            { label: 'Telephone Numbers', width: '20%' },
          ]}
          rows={r.characterReferences.map((c) => [c.name, c.occupation, c.address, c.phone])}
          emptyText="None provided."
        />
 
        <SubHeading>Person(s) to be Notified in Case of Emergency</SubHeading>
        <Text style={pdfStyles.smallNote}>(Please do not include relatives and present employer)</Text>
        <DataTable
          columns={[
            { label: 'Name', width: '30%' },
            { label: 'Relationship', width: '20%' },
            { label: 'Exact Address', width: '30%' },
            { label: 'Telephone Numbers', width: '20%' },
          ]}
          rows={r.emergencyContacts.map((c) => [c.name, c.relationship, c.address, c.phone])}
          emptyText="None provided."
        />
 
        <View style={pdfStyles.noteBox}>
          <Text style={pdfStyles.noteText}>
            Please provide sketch of your residence going to/from AIMI location or area of assignment in a
            separate sheet. (Submitted separately as "Location Sketch"
            {applicant.locationSketch ? ` — ${applicant.locationSketch.fileName}` : ' — none submitted yet'}.)
          </Text>
        </View>
 
        <Row>
          <Field label="How soon can you start?" value={av.howSoon} />
          <Field label="Do you have any pending applications with other companies?" value={av.pendingApplications || 'None stated'} last />
        </Row>
 
        <View style={pdfStyles.certBox}>
          <Text style={pdfStyles.certText}>
            [{av.certifiedNoObligation ? 'X' : ' '}] I hereby confirm that the mere filing of this form does
            not obligate the company to hire my services. I understand that if I am hired, this application
            and all I have stated herein shall form part of my 201 file.
          </Text>
          <Text style={pdfStyles.certText}>
            [{av.certifiedTruth ? 'X' : ' '}] I hereby certify to the truth and correctness of the above
            information and data. I relieve AIMI from any liabilities, resulting from verifying the above
            information and I understand that any false or fraudulent information made in this application
            form shall constitute sufficient ground for disapproval of my application or if employed, for
            termination for cause.
          </Text>
        </View>
 
        <View style={pdfStyles.footerRow} wrap={false}>
          <View style={pdfStyles.footerCell}>
            <Text style={pdfStyles.footerValue}>{av.submittedDate}</Text>
            <Text style={pdfStyles.footerCaption}>DATE</Text>
          </View>
          <View style={pdfStyles.footerCellLast}>
            <Text style={pdfStyles.footerValue}>{av.signatureName}</Text>
            <Text style={pdfStyles.footerCaption}>APPLICANT'S SIGNATURE</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
 
export default ApplicantPdfDocument
 