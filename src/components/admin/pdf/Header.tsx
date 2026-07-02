/** 
* Header.tsx
 * The form's top banner: logo | company name + form title | photo box.
 *
 * Uses the real AIMI logo. Drop your logo file at:
 *   public/logo.png
 * @react-pdf/renderer fetches it from the site root ("/logo.png") when the
 * PDF is generated in the browser, same as an <img src="/logo.png" /> would.
 * If you don't have the file there yet, this will render a blank box —
 * just add public/logo.png and it'll pick it up automatically, no code change.
 */
 
import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { pdfStyles } from './pdfStyles'
 
export function Header() {
  return (
    <View style={pdfStyles.headerBox}>
      <View style={pdfStyles.logoCell}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src="/logo.png" style={pdfStyles.logoImage} />
      </View>
      <View style={pdfStyles.titleCell}>
        <Text style={pdfStyles.companyName}>ARVIN INTERNATIONAL MARKETING, INC</Text>
        <Text style={pdfStyles.formTitle}>PERSONAL INFORMATION SHEET</Text>
      </View>
      <View style={pdfStyles.photoCell}>
        <Text style={pdfStyles.photoText}>Photo</Text>
      </View>
    </View>
  )
}