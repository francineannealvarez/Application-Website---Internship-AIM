# Arvin International Applicant Portal

A full-stack Next.js recruitment system for **Arvin International Marketing, Inc.** — the No. 1 Salt Provider in the Philippines.

**Tagline:** "Moving Ahead to Serve You Better"

---

## 🚀 Technology Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with credentials provider (email/password)
- **File Upload:** Local storage (upgradeable to Cloudinary)

---

## 📦 Project Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- `.env.local` file configured (see below)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/arvin_portal?schema=public"

   # NextAuth
   NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"

   # File Upload
   NEXT_PUBLIC_FILE_UPLOAD_TYPE="local"
   ```

3. **Push database schema to PostgreSQL:**
   ```bash
   npm run db:push
   ```

4. **Seed the database with initial data:**
   ```bash
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be running at `http://localhost:3000`

---

## 🔐 Test Credentials

After seeding, use these credentials to test the application:

### HR Admin Account
- **Email:** `hr@arvininternational.com`
- **Password:** `admin123`

### Sample Applicant Account
- **Email:** `applicant@test.com`
- **Password:** `test123`

---

## 📋 Database Schema

### Users
- `id` - Unique identifier
- `name` - Full name
- `email` - Email address (unique)
- `password` - Hashed password
- `role` - `APPLICANT` or `HR_ADMIN`
- `createdAt`, `updatedAt` - Timestamps

### Positions
- `id` - Unique identifier
- `title` - Job title
- `department` - Department name
- `employmentType` - Full-time, Part-time, Internship, OJT
- `description` - Job description
- `isActive` - Whether position is open
- `createdAt`, `updatedAt` - Timestamps

### Applications
- `id` - Unique identifier
- `userId` - Reference to user
- `positionId` - Reference to position
- `status` - SUBMITTED, UNDER_REVIEW, SHORTLISTED, REQUIREMENTS, HIRED, REJECTED
- `resumePath` - Path to resume file
- `coverLetterPath` - Path to cover letter (optional)
- `portfolioUrl` - Portfolio/LinkedIn URL (optional)
- `rejectionReason` - Reason for rejection (if rejected)
- Personal information: `phoneNumber`, `homeAddress`, `dateOfBirth`, `gender`
- Application details: `heardAboutUs`, `preferredStartDate`, `message`
- `submittedAt`, `updatedAt` - Timestamps

### Requirements
- `id` - Unique identifier
- `name` - Requirement name (e.g., "NBI Clearance")
- `description` - Description of the requirement
- `isActive` - Whether requirement is active
- `createdAt`, `updatedAt` - Timestamps

### Applicant Documents
- `id` - Unique identifier
- `applicationId` - Reference to application
- `requirementId` - Reference to requirement
- `filePath` - Path to uploaded document
- `isVerified` - Whether HR verified the document
- `uploadedAt` - When document was uploaded

### Notifications
- `id` - Unique identifier
- `userId` - Reference to user
- `applicationId` - Reference to application (optional)
- `message` - Notification message
- `isRead` - Whether user read it
- `createdAt` - When created

---

## 🎯 Application Routes

### Public Routes
- `/` - Landing page / redirect to dashboard
- `/login` - Login page
- `/register` - Registration page

### Applicant Routes (Protected - requires APPLICANT role)
- `/dashboard` - Main applicant dashboard with status stepper
- `/apply` - Multi-step application form (4 steps)
- `/application` - View submitted application
- `/requirements` - Upload required documents (unlocks at SHORTLISTED status)
- `/notifications` - View all notifications

### HR Admin Routes (Protected - requires HR_ADMIN role)
- `/hr/dashboard` - HR dashboard with statistics
- `/hr/applicants` - List all applicants with filters
- `/hr/applicants/[id]` - View applicant profile and update status
- `/hr/positions` - Manage open positions
- `/hr/requirements` - Manage required documents

---

## 🔄 Application Status Flow

1. **SUBMITTED** - Application received
2. **UNDER_REVIEW** - HR team reviewing
3. **SHORTLISTED** - Candidate selected, requirements section unlocks
4. **REQUIREMENTS** - Waiting for documents
5. **HIRED** - Offer accepted / hired
6. **REJECTED** - Application rejected

---

## 📝 Multi-Step Application Form

### Step 1: Personal Information
- Full Name (pre-filled from account)
- Email (pre-filled, read-only)
- Phone Number
- Home Address
- Date of Birth
- Gender
- How did you hear about us?

### Step 2: Position & Availability
- Position Applied For
- Preferred Start Date
- Why do you want to join Arvin? (max 500 chars)

### Step 3: Documents
- Resume (PDF, max 5MB) **REQUIRED**
- Cover Letter (PDF, max 5MB) **OPTIONAL**
- Portfolio / LinkedIn URL **OPTIONAL**

### Step 4: Review & Submit
- Review all information
- Confirm accuracy
- Submit application

---

## 🎨 Brand Identity

- **Company:** Arvin International Marketing, Inc.
- **Tagline:** "Moving Ahead to Serve You Better"
- **Primary Color:** Cyan/Sky Blue (`#00AEEF`)
- **Secondary Color:** Dark Navy (`#1B3A5C`)
- **Accent:** White (`#FFFFFF`)
- **Font:** Inter, Poppins (via Tailwind)

---

## 🔔 Notifications System

- In-app notifications (no email for now)
- Auto-created when HR updates applicant status
- Shows status change messages
- Mark all as read functionality
- Notification bell with unread count badge

---

## 📤 File Upload

Currently using local file storage. Files are saved to `/public/uploads/`.

To upgrade to cloud storage (Cloudinary):
1. Set up Cloudinary account
2. Update `.env.local` with API credentials
3. Modify file upload logic in API routes

---

## 🛡️ Authentication & Security

- **Method:** NextAuth.js with credentials provider
- **Password Hashing:** bcryptjs (10 salt rounds)
- **Session:** JWT-based
- **HTTPS:** Required in production
- **Environment Variables:** Never commit `.env.local`

---

## 🧑‍💼 HR Admin Features

### Dashboard
- View statistics (total applicants, under review, shortlisted, hired)
- Quick access to applicants and positions

### All Applicants
- Filter by status, position, or search by name
- View applicant profile with full details
- Download resume and other documents
- Update applicant status and add rejection reason

### Manage Positions
- Add new positions
- Edit position details
- Toggle active/inactive status
- View all applicants for each position

### Manage Requirements
- Add required documents
- Edit requirement details
- Toggle active/inactive status
- Global requirements shown to all shortlisted applicants

---

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for mobile devices. All forms and tables adapt to smaller screens.

---

## 🚦 Build & Deployment

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Environment setup for production:
- Change `NEXTAUTH_SECRET` to a strong, random value
- Update `NEXTAUTH_URL` to your production domain
- Use a production PostgreSQL database
- Enable HTTPS

---

## 📞 Support & Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env.local`
- Run `npm run db:push` to sync schema

### Authentication Issues
- Ensure NEXTAUTH_SECRET is set
- Check session cookies in browser DevTools
- Clear browser cache and try again

### File Upload Issues
- Check `/public/uploads/` directory exists
- Verify file size is under 5MB
- Allowed formats: PDF, JPG, PNG

---

## 📄 License

This project is for Arvin International Marketing, Inc.

---

**Made with ❤️ for Arvin International** | "Moving Ahead to Serve You Better"
