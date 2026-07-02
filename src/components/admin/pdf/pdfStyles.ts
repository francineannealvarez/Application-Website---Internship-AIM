/**
 * pdfStyles.ts
 * ─────────────────────────────────────────────────────────────
 * Single source of truth for every style used across the AIMI PDF
 * components (Header, Field, PersonRow, DataTable, YesNoQuestion,
 * SectionHeading). Import from here instead of redefining styles in
 * each component — tweak once, applies everywhere, same idea as
 * admin-theme.ts for the web UI.
 * ─────────────────────────────────────────────────────────────
 */
 
import { StyleSheet } from '@react-pdf/renderer'
 
// Hairline border — closer to the ~0.5pt rules on the actual paper form
// than a default 1pt border.
export const BORDER = '#000000'
export const BORDER_WIDTH = 0.75
 
export const pdfStyles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#000000',
  },
 
  // ── Header ──
  headerBox: { flexDirection: 'row', borderWidth: BORDER_WIDTH, borderColor: BORDER },
  logoCell: {
    width: 56,
    borderRightWidth: BORDER_WIDTH,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  logoImage: { width: 44, height: 44, objectFit: 'contain' },
  logoFallbackText: { fontSize: 7, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  titleCell: {
    flex: 1,
    borderRightWidth: BORDER_WIDTH,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  companyName: { fontSize: 12.5, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  formTitle: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', textAlign: 'center', textDecoration: 'underline', marginTop: 2 },
  photoCell: { width: 56, alignItems: 'center', justifyContent: 'center', padding: 3 },
  photoText: { fontSize: 6.5, color: '#666666' },
 
  // ── Generic bordered grid row / cell — this is the backbone of the whole
  // document; every field row reuses this so the grid reads as one
  // continuous table, same as the paper form. ──
  row: { flexDirection: 'row', borderLeftWidth: BORDER_WIDTH, borderRightWidth: BORDER_WIDTH, borderBottomWidth: BORDER_WIDTH, borderColor: BORDER },
  cell: { padding: 2.5, borderRightWidth: BORDER_WIDTH, borderColor: BORDER, justifyContent: 'flex-start' },
  cellLast: { padding: 2.5, justifyContent: 'flex-start' },
  label: { fontSize: 5.5, color: '#444444', marginBottom: 1 },
  value: { fontSize: 7 },
 
  // ── Section headings — plain bold centered text, no fill/border, tight
  // spacing so it sits right against the table below it (no gap). ──
  sectionHeading: { fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginTop: 5, marginBottom: 1 },
  subHeading: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', marginTop: 4, marginBottom: 1 },
  smallNote: { fontSize: 5.5, color: '#555555', marginBottom: 1 },
 
  // ── Tables ──
  table: { borderWidth: BORDER_WIDTH, borderColor: BORDER },
  theadRow: { flexDirection: 'row', backgroundColor: '#eef1f3', borderBottomWidth: BORDER_WIDTH, borderColor: BORDER },
  tbodyRow: { flexDirection: 'row', borderBottomWidth: BORDER_WIDTH, borderColor: BORDER },
  th: { padding: 2.5, fontSize: 6, fontFamily: 'Helvetica-Bold', borderRightWidth: BORDER_WIDTH, borderColor: BORDER },
  td: { padding: 2.5, fontSize: 6.5, borderRightWidth: BORDER_WIDTH, borderColor: BORDER },
  thLast: { padding: 2.5, fontSize: 6, fontFamily: 'Helvetica-Bold' },
  tdLast: { padding: 2.5, fontSize: 6.5 },
  emptyRowText: { padding: 3, fontSize: 6, color: '#777777', fontStyle: 'italic' },
 
  // ── Checkboxes — small squares matching the tiny boxes on the paper
  // form, not oversized modern checkboxes. ──
  checkSquare: { width: 5.5, height: 5.5, borderWidth: BORDER_WIDTH, borderColor: BORDER, alignItems: 'center', justifyContent: 'center', marginRight: 2.5 },
  checkSquareText: { fontSize: 5, fontFamily: 'Helvetica-Bold' },
  checkOption: { flexDirection: 'row', alignItems: 'center', marginRight: 8, marginBottom: 1 },
  checkOptionLabel: { fontSize: 6.5 },
 
  // ── Yes/No question block ──
  ynRow: { borderWidth: BORDER_WIDTH, borderTopWidth: 0, borderColor: BORDER, padding: 3 },
  ynQuestionLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ynQuestion: { fontSize: 6.5, flex: 1, marginRight: 5 },
  ynDetailLine: { fontSize: 5.5, color: '#333333', marginTop: 1.5 },
 
  noteBox: { borderWidth: BORDER_WIDTH, borderColor: BORDER, padding: 3 },
  noteBoxAttached: { borderWidth: BORDER_WIDTH, borderTopWidth: 0, borderColor: BORDER, padding: 3 },
  noteText: { fontSize: 5.5, color: '#333333' },
 
  certBox: { borderWidth: BORDER_WIDTH, borderTopWidth: 0, borderColor: BORDER, padding: 4 },
  certText: { fontSize: 5.5, marginBottom: 3, lineHeight: 1.25 },
 
  footerRow: { flexDirection: 'row', borderWidth: BORDER_WIDTH, borderTopWidth: 0, borderColor: BORDER },
  footerCell: { flex: 1, padding: 5, borderRightWidth: BORDER_WIDTH, borderColor: BORDER, alignItems: 'center' },
  footerCellLast: { flex: 1, padding: 5, alignItems: 'center' },
  footerValue: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', marginBottom: 1.5 },
  footerCaption: { fontSize: 5.5, color: '#555555' },
})