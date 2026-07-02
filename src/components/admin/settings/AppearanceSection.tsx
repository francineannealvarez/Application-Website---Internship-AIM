'use client'

import React, { useState } from 'react'

// TODO: wire this up to actual dark mode implementation once set up.
// For now this is just a UI toggle — doesn't change anything yet.
type ThemeOption = 'light' | 'dark'

export default function AppearanceSection() {
  const [theme, setTheme] = useState<ThemeOption>('light')

  return (
    <div className="bg-white border border-[#e2e8ed] rounded-lg p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-[#0f1f29] mb-1">
        Appearance
      </h2>
      <p className="text-xs text-[#8fa3b0] mb-5">
        Choose how the admin portal looks. Dark mode support is coming soon.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-sm">
        <button
          onClick={() => setTheme('light')}
          className={`text-sm font-medium rounded-lg border px-4 py-3 transition-colors ${
            theme === 'light'
              ? 'border-[#00bbda] text-[#00bbda] bg-[#e6f9fb]'
              : 'border-[#e2e8ed] text-[#1a2a35] hover:border-[#00bbda]'
          }`}
        >
          ☀️ Light
        </button>
        <button
          disabled
          className="text-sm font-medium rounded-lg border px-4 py-3 border-[#e2e8ed] text-[#8fa3b0] bg-[#f4f7f9] cursor-not-allowed"
        >
          🌙 Dark
          <span className="block text-[10px] font-normal mt-0.5">Coming soon</span>
        </button>
      </div>
    </div>
  )
}