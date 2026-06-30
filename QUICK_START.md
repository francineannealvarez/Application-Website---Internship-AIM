# ⚡ Quick Start Guide - Arvin Applicant Portal

## 🚀 Getting Started (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up PostgreSQL Database
Make sure you have PostgreSQL running. You can:
- Use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`
- Or install locally from [postgresql.org](https://www.postgresql.org/)

### Step 3: Configure Environment
Create `.env.local` in the project root:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/arvin_portal?schema=public"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_FILE_UPLOAD_TYPE="local"
```

### Step 4: Initialize Database
```bash
npm run db:push
```

This creates all tables in PostgreSQL.

### Step 5: Seed Sample Data
```bash
npm run db:seed
```

This creates:
- 1 HR Admin account
- 1 Sample Applicant
- 7 Open positions
- 8 Required documents

### Step 6: Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

---

## 🔑 Test Accounts

After seeding, you can log in with:

### HR Admin
```
Email: hr@arvininternational.com
Password: admin123
```
→ Access HR dashboard at `/hr/dashboard`

### Applicant
```
Email: applicant@test.com
Password: test123
```
→ Access applicant dashboard at `/dashboard`

---

## 📋 What You Get

### For Applicants:
✅ Multi-step application form (4 steps)  
✅ Real-time status tracking with visual stepper  
✅ Document upload and verification  
✅ Notifications when status changes  
✅ View submitted application details  

### For HR Admins:
✅ Dashboard with applicant statistics  
✅ Filter and search applicants  
✅ Update application status  
✅ Add rejection reasons  
✅ Manage open positions  
✅ Manage required documents  

---

## 🎨 Customization

### Brand Colors
In components, you'll see:
- `#00AEEF` - Primary Cyan Blue
- `#1B3A5C` - Secondary Navy
- `#FFFFFF` - White

Update these in your Tailwind CSS config if needed.

### Company Info
- Edit app name in logo throughout pages
- Update tagline: "Moving Ahead to Serve You Better"
- Customize tagline text

---

## 🔧 Common Tasks

### Add a New Position
1. Login as HR Admin (`hr@arvininternational.com`)
2. Go to "Manage Positions"
3. Click "+ Add New Position"
4. Fill in details and submit

### Update an Applicant Status
1. Go to "All Applicants"
2. Click "View Profile" on an applicant
3. Select new status from dropdown
4. Add rejection reason if rejecting
5. Click "Update Status"

### Create a New User
1. Go to `/register`
2. Fill in name, email, password
3. Create account (auto-registered as applicant)

---

## 📦 Deployment

### To Production:
```bash
npm run build
npm start
```

### Environment Variables for Production:
```env
DATABASE_URL="postgresql://user:password@db-host:5432/arvin_portal"
NEXTAUTH_SECRET="generate-a-strong-random-key"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check PostgreSQL is running and DATABASE_URL is correct |
| "Cannot find module" | Run `npm install` again |
| Login page shows blank | Check NEXTAUTH_SECRET is set |
| Files not uploading | Ensure `/public/uploads/` directory exists |
| Port 3000 in use | Run `npm run dev -- -p 3001` or kill process on 3000 |

---

## 📚 Project Structure

```
src/
  app/
    (auth)/login, register      # Public auth pages
    apply/                      # Multi-step application form
    dashboard/                  # Applicant dashboard
    application/                # View application details
    requirements/               # Upload required documents
    notifications/              # View all notifications
    hr/                         # HR admin pages
      dashboard/                # HR dashboard
      applicants/               # List and view applicants
      positions/                # Manage positions
      requirements/             # Manage requirements
    api/                        # Backend API routes
      auth/                     # Authentication endpoints
      applications/             # Application endpoints
      positions/                # Position endpoints
      requirements/             # Requirement endpoints
      documents/                # Document upload
      notifications/            # Notification endpoints
      hr/                       # HR-specific endpoints
  auth.ts                       # NextAuth configuration
prisma/
  schema.prisma                 # Database schema
  seed.ts                       # Seeding script
```

---

## 🎯 Next Steps

1. **Customize branding** - Update colors and logo
2. **Add email notifications** - Integrate with SendGrid/AWS SES
3. **Upload to cloud** - Use Cloudinary/AWS S3 for files
4. **Deploy** - Use Vercel, Netlify, or your own server
5. **Add more requirements** - Edit seed.ts or use HR panel

---

## 📞 Questions?

Refer to `PORTAL_README.md` for detailed documentation or check:
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org

---

**Happy recruiting! 🎉**  
*Arvin International Marketing, Inc. - "Moving Ahead to Serve You Better"*
