$path = "src\lib\demo-session.ts"
$content = Get-Content -Path $path -Raw -Encoding UTF8

$old = @"
export type DemoApplication = {
  fullName: string;
  email: string;
  phone: string;
  positionTitle: string;
  resumeFileName: string;
  coverLetterFileName?: string | null;
  submittedAt: string; // ISO date string
};
"@

$new = @"
export type DemoApplication = {
  fullName: string;
  email: string;
  phone: string;
  positionTitle: string;
  employmentType?: string;
  resumeFileName: string;
  coverLetterFileName?: string | null;
  submittedAt: string; // ISO date string
};
"@

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    Write-Host "SUCCESS: employmentType field added."
} else {
    Write-Host "WARNING: exact block not found. No changes made."
}

[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
