import { db as prisma } from "../src/lib/db";

async function main() {
  console.log("Clearing existing job postings...");
  await prisma.job_postings.deleteMany();

  console.log("Creating job postings...");
  await Promise.all([
    prisma.job_postings.create({
      data: {
        title: "Sales Representative",
        department: "Sales",
        employment_type: "Full-time",
        description:
          "We are looking for a dynamic Sales Representative to join our team and drive revenue growth.",
        status: "Open",
      },
    }),
    prisma.job_postings.create({
      data: {
        title: "Warehouse Staff",
        department: "Logistics",
        employment_type: "Full-time",
        description:
          "Support our warehouse operations with inventory management and order fulfillment.",
        status: "Open",
      },
    }),
    prisma.job_postings.create({
      data: {
        title: "Logistics Coordinator",
        department: "Logistics",
        employment_type: "Full-time",
        description:
          "Coordinate logistics operations to ensure timely and efficient delivery of products.",
        status: "Open",
      },
    }),
    prisma.job_postings.create({
      data: {
        title: "IT Support",
        department: "IT",
        employment_type: "Full-time",
        description:
          "Provide technical support to our employees and maintain IT infrastructure.",
        status: "Open",
      },
    }),
    prisma.job_postings.create({
      data: {
        title: "Finance Officer",
        department: "Finance",
        employment_type: "Full-time",
        description:
          "Manage financial records, transactions, and reporting for the organization.",
        status: "Open",
      },
    }),
    prisma.job_postings.create({
      data: {
        title: "OJT Intern (IT/CS)",
        department: "IT",
        employment_type: "OJT",
        description:
          "On-the-Job Training program for IT and Computer Science students.",
        status: "Open",
      },
    }),
    prisma.job_postings.create({
      data: {
        title: "OJT Intern (Marketing)",
        department: "Marketing",
        employment_type: "OJT",
        description: "On-the-Job Training program for Marketing students.",
        status: "Open",
      },
    }),
  ]);

  console.log("Seeding completed successfully!");
  console.log(
    "\nNote: HR Admin and Applicant test accounts are no longer seeded here."
  );
  console.log(
    "Create real accounts through the actual sign-up / login flow (Auth.js + Supabase Auth)."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });