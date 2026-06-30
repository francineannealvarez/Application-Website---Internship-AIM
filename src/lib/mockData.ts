// Mock data for testing without database
// This file contains hardcoded sample data for all features

export const mockUsers = {
  hrAdmin: {
    id: "1",
    name: "Maria Santos",
    email: "hr@arvininternational.com",
    role: "HR_ADMIN" as const,
  },
  applicant1: {
    id: "2",
    name: "John Miguel De La Cruz",
    email: "john@example.com",
    role: "APPLICANT" as const,
  },
  applicant2: {
    id: "3",
    name: "Sarah Garcia",
    email: "sarah@example.com",
    role: "APPLICANT" as const,
  },
  applicant3: {
    id: "4",
    name: "Carlos Reyes",
    email: "carlos@example.com",
    role: "APPLICANT" as const,
  },
};

export const mockPositions = [
  {
    id: "1",
    title: "Sales Representative",
    department: "Sales",
    employmentType: "Full-time",
    description:
      "We are looking for a dynamic Sales Representative to drive sales growth and expand our client base. You will be responsible for building relationships with clients and closing deals.",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "2",
    title: "Warehouse Staff",
    department: "Operations",
    employmentType: "Full-time",
    description:
      "Join our warehouse team to manage inventory, organize shipments, and ensure efficient operations. Experience in warehouse management is preferred.",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "3",
    title: "Logistics Coordinator",
    department: "Logistics",
    employmentType: "Full-time",
    description:
      "Coordinate logistics operations and manage supply chain activities. Must have strong organizational skills and attention to detail.",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "4",
    title: "IT Support",
    department: "IT",
    employmentType: "Full-time",
    description:
      "Provide technical support to employees and maintain company IT infrastructure. CompTIA A+ certification preferred.",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "5",
    title: "Finance Officer",
    department: "Finance",
    employmentType: "Full-time",
    description:
      "Manage financial records, prepare reports, and ensure compliance with accounting standards. CPA preferred.",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "6",
    title: "OJT Intern (IT/CS)",
    department: "IT",
    employmentType: "Internship",
    description:
      "On-the-job training opportunity for IT or Computer Science students. Learn real-world IT operations and support.",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "7",
    title: "OJT Intern (Marketing)",
    department: "Marketing",
    employmentType: "Internship",
    description:
      "On-the-job training opportunity for Marketing students. Gain experience in digital marketing and brand promotion.",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
];

export const mockRequirements = [
  {
    id: "1",
    name: "NBI Clearance",
    description: "National Bureau of Investigation clearance certificate",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "2",
    name: "SSS Number",
    description: "Social Security System registration number",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "3",
    name: "PhilHealth ID",
    description: "Philippine Health Insurance Corporation identification",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "4",
    name: "TIN Number",
    description: "Tax Identification Number from Bureau of Internal Revenue",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "5",
    name: "Birth Certificate (PSA)",
    description:
      "Philippine Statistics Authority certified true copy of birth certificate",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "6",
    name: "2x2 ID Photo",
    description: "Recent passport-sized identification photograph (2x2 inches)",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "7",
    name: "Barangay Clearance",
    description: "Community clearance certificate from barangay office",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
  {
    id: "8",
    name: "Medical Certificate",
    description: "Medical fitness certificate from licensed physician",
    isActive: true,
    createdAt: new Date("2026-05-01"),
    updatedAt: new Date("2026-05-01"),
  },
];

// Application statuses for different scenarios
export const mockApplications = {
  submitted: {
    id: "app-1",
    userId: "2",
    positionId: "1",
    status: "SUBMITTED" as const,
    resumePath: "/uploads/john-resume.pdf",
    coverLetterPath: "/uploads/john-cover-letter.pdf",
    portfolioUrl: "https://portfolio.example.com/john",
    rejectionReason: null,
    // Personal info
    phone: "+63-9171234567",
    address: "123 Mabini St, Makati, Metro Manila",
    dateOfBirth: "1995-06-15",
    gender: "Male",
    howHeardAboutUs: "Job Portal",
    preferredStartDate: "2026-07-15",
    applicationMessage:
      "I am very interested in this Sales Representative position and believe my experience makes me a great fit for your team.",
    createdAt: new Date("2026-06-20"),
    updatedAt: new Date("2026-06-20"),
  },
  underReview: {
    id: "app-2",
    userId: "3",
    positionId: "2",
    status: "UNDER_REVIEW" as const,
    resumePath: "/uploads/sarah-resume.pdf",
    coverLetterPath: "/uploads/sarah-cover-letter.pdf",
    portfolioUrl: null,
    rejectionReason: null,
    phone: "+63-9179876543",
    address: "456 Ayala Ave, Makati, Metro Manila",
    dateOfBirth: "1998-03-22",
    gender: "Female",
    howHeardAboutUs: "LinkedIn",
    preferredStartDate: "2026-08-01",
    applicationMessage:
      "I have 3 years of warehouse management experience and am excited about this opportunity.",
    createdAt: new Date("2026-06-15"),
    updatedAt: new Date("2026-06-25"),
  },
  shortlisted: {
    id: "app-3",
    userId: "2", // John - second application
    positionId: "4",
    status: "SHORTLISTED" as const,
    resumePath: "/uploads/john-resume-it.pdf",
    coverLetterPath: "/uploads/john-cover-it.pdf",
    portfolioUrl: "https://github.com/johnmiguel",
    rejectionReason: null,
    phone: "+63-9171234567",
    address: "123 Mabini St, Makati, Metro Manila",
    dateOfBirth: "1995-06-15",
    gender: "Male",
    howHeardAboutUs: "Job Portal",
    preferredStartDate: "2026-07-20",
    applicationMessage:
      "I have IT certification and would love to join your support team.",
    createdAt: new Date("2026-06-10"),
    updatedAt: new Date("2026-06-28"),
  },
  requirements: {
    id: "app-4",
    userId: "4",
    positionId: "3",
    status: "REQUIREMENTS" as const,
    resumePath: "/uploads/carlos-resume.pdf",
    coverLetterPath: "/uploads/carlos-cover-letter.pdf",
    portfolioUrl: null,
    rejectionReason: null,
    phone: "+63-9165555555",
    address: "789 EDSA, Quezon City",
    dateOfBirth: "1996-12-10",
    gender: "Male",
    howHeardAboutUs: "Referral",
    preferredStartDate: "2026-08-01",
    applicationMessage:
      "I am interested in the Logistics Coordinator position with my 2 years of logistics experience.",
    createdAt: new Date("2026-06-05"),
    updatedAt: new Date("2026-06-27"),
  },
  hired: {
    id: "app-5",
    userId: "3", // Sarah - second application
    positionId: "6",
    status: "HIRED" as const,
    resumePath: "/uploads/sarah-ojt-resume.pdf",
    coverLetterPath: null,
    portfolioUrl: null,
    rejectionReason: null,
    phone: "+63-9179876543",
    address: "456 Ayala Ave, Makati, Metro Manila",
    dateOfBirth: "1998-03-22",
    gender: "Female",
    howHeardAboutUs: "School",
    preferredStartDate: "2026-07-01",
    applicationMessage: "I am a CS student looking for OJT experience.",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-26"),
  },
  rejected: {
    id: "app-6",
    userId: "4", // Carlos - second application
    positionId: "5",
    status: "REJECTED" as const,
    resumePath: "/uploads/carlos-finance-resume.pdf",
    coverLetterPath: "/uploads/carlos-finance-letter.pdf",
    portfolioUrl: null,
    rejectionReason:
      "We appreciate your interest, but we have selected other candidates with more relevant accounting experience. We encourage you to apply for future positions.",
    phone: "+63-9165555555",
    address: "789 EDSA, Quezon City",
    dateOfBirth: "1996-12-10",
    gender: "Male",
    howHeardAboutUs: "Referral",
    preferredStartDate: "2026-08-15",
    applicationMessage:
      "I am interested in the Finance Officer position with my bookkeeping background.",
    createdAt: new Date("2026-06-03"),
    updatedAt: new Date("2026-06-24"),
  },
};

// Mock applicant documents (for the shortlisted applicant)
export const mockApplicantDocuments = [
  {
    id: "doc-1",
    applicationId: "app-3",
    requirementId: "1",
    userId: "2",
    filePath: "/uploads/john-nbi.pdf",
    isVerified: true,
    uploadedAt: new Date("2026-06-29"),
  },
  {
    id: "doc-2",
    applicationId: "app-3",
    requirementId: "2",
    userId: "2",
    filePath: "/uploads/john-sss.pdf",
    isVerified: true,
    uploadedAt: new Date("2026-06-29"),
  },
  {
    id: "doc-3",
    applicationId: "app-3",
    requirementId: "3",
    userId: "2",
    filePath: "/uploads/john-philhealth.pdf",
    isVerified: false,
    uploadedAt: new Date("2026-06-28"),
  },
  {
    id: "doc-4",
    applicationId: "app-3",
    requirementId: "4",
    userId: "2",
    filePath: null,
    isVerified: false,
    uploadedAt: null,
  },
  {
    id: "doc-5",
    applicationId: "app-3",
    requirementId: "5",
    userId: "2",
    filePath: "/uploads/john-birthcert.pdf",
    isVerified: true,
    uploadedAt: new Date("2026-06-29"),
  },
  {
    id: "doc-6",
    applicationId: "app-3",
    requirementId: "6",
    userId: "2",
    filePath: "/uploads/john-2x2.jpg",
    isVerified: true,
    uploadedAt: new Date("2026-06-27"),
  },
  {
    id: "doc-7",
    applicationId: "app-3",
    requirementId: "7",
    userId: "2",
    filePath: null,
    isVerified: false,
    uploadedAt: null,
  },
  {
    id: "doc-8",
    applicationId: "app-3",
    requirementId: "8",
    userId: "2",
    filePath: "/uploads/john-medical.pdf",
    isVerified: false,
    uploadedAt: new Date("2026-06-28"),
  },
];

// Mock notifications
export const mockNotifications = [
  {
    id: "notif-1",
    userId: "2",
    applicationId: "app-1",
    message: "Your application has been received and is now under review.",
    isRead: true,
    createdAt: new Date("2026-06-20"),
  },
  {
    id: "notif-2",
    userId: "2",
    applicationId: "app-3",
    message:
      "Great news! You have been shortlisted for the IT Support position. Please upload the required documents.",
    isRead: true,
    createdAt: new Date("2026-06-28"),
  },
  {
    id: "notif-3",
    userId: "2",
    applicationId: "app-3",
    message:
      "We have received 5 of 8 required documents. Please upload the remaining documents.",
    isRead: false,
    createdAt: new Date("2026-06-29"),
  },
  {
    id: "notif-4",
    userId: "3",
    applicationId: "app-2",
    message: "Your application status has been updated to Under Review.",
    isRead: true,
    createdAt: new Date("2026-06-25"),
  },
  {
    id: "notif-5",
    userId: "3",
    applicationId: "app-5",
    message: "Congratulations! You have been hired as OJT Intern (IT/CS).",
    isRead: true,
    createdAt: new Date("2026-06-26"),
  },
];

// Helper function to get user's current application
export const getUserApplication = (userId: string) => {
  const apps = Object.values(mockApplications);
  return apps.find((app) => app.userId === userId);
};

// Helper function to get all applications for HR view
export const getAllApplications = () => {
  return Object.values(mockApplications);
};

// Helper function to get specific application by ID
export const getApplicationById = (applicationId: string) => {
  return Object.values(mockApplications).find((app) => app.id === applicationId);
};

// Helper function to get documents for an application
export const getApplicationDocuments = (applicationId: string) => {
  return mockApplicantDocuments.filter((doc) => doc.applicationId === applicationId);
};

// Helper function to get user's notifications
export const getUserNotifications = (userId: string) => {
  return mockNotifications
    .filter((notif) => notif.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
