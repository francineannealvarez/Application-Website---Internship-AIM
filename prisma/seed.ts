import bcrypt from "bcryptjs";
import { db as prisma } from "../src/lib/db";

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.applicantDocument.deleteMany();
  await prisma.application.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.position.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating HR Admin user...");
  const hrAdmin = await prisma.user.create({
    data: {
      name: "HR Administrator",
      email: "hr@arvininternational.com",
      password: await bcrypt.hash("admin123", 10),
      role: "HR_ADMIN",
    },
  });

  console.log("Creating sample applicant...");
  const applicant = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "applicant@test.com",
      password: await bcrypt.hash("test123", 10),
      role: "APPLICANT",
    },
  });

  console.log("Creating positions...");
  const positions = await Promise.all([
    prisma.position.create({
      data: {
        title: "Sales Representative",
        department: "Sales",
        employmentType: "Full-time",
        description:
          "We are looking for a dynamic Sales Representative to join our team and drive revenue growth.",
        isActive: true,
      },
    }),
    prisma.position.create({
      data: {
        title: "Warehouse Staff",
        department: "Logistics",
        employmentType: "Full-time",
        description:
          "Support our warehouse operations with inventory management and order fulfillment.",
        isActive: true,
      },
    }),
    prisma.position.create({
      data: {
        title: "Logistics Coordinator",
        department: "Logistics",
        employmentType: "Full-time",
        description:
          "Coordinate logistics operations to ensure timely and efficient delivery of products.",
        isActive: true,
      },
    }),
    prisma.position.create({
      data: {
        title: "IT Support",
        department: "IT",
        employmentType: "Full-time",
        description:
          "Provide technical support to our employees and maintain IT infrastructure.",
        isActive: true,
      },
    }),
    prisma.position.create({
      data: {
        title: "Finance Officer",
        department: "Finance",
        employmentType: "Full-time",
        description:
          "Manage financial records, transactions, and reporting for the organization.",
        isActive: true,
      },
    }),
    prisma.position.create({
      data: {
        title: "OJT Intern (IT/CS)",
        department: "IT",
        employmentType: "OJT",
        description:
          "On-the-Job Training program for IT and Computer Science students.",
        isActive: true,
      },
    }),
    prisma.position.create({
      data: {
        title: "OJT Intern (Marketing)",
        department: "Marketing",
        employmentType: "OJT",
        description: "On-the-Job Training program for Marketing students.",
        isActive: true,
      },
    }),
  ]);

  console.log("Creating requirements...");
  await Promise.all([
    prisma.requirement.create({
      data: {
        name: "NBI Clearance",
        description: "National Bureau of Investigation clearance certificate",
        isActive: true,
      },
    }),
    prisma.requirement.create({
      data: {
        name: "SSS Number",
        description: "Social Security System number or certificate",
        isActive: true,
      },
    }),
    prisma.requirement.create({
      data: {
        name: "PhilHealth ID",
        description: "Philippine Health Insurance Corporation ID",
        isActive: true,
      },
    }),
    prisma.requirement.create({
      data: {
        name: "TIN Number",
        description: "Taxpayer Identification Number",
        isActive: true,
      },
    }),
    prisma.requirement.create({
      data: {
        name: "Birth Certificate (PSA)",
        description:
          "Birth certificate issued by Philippine Statistics Authority",
        isActive: true,
      },
    }),
    prisma.requirement.create({
      data: {
        name: "2x2 ID Photo",
        description: "Two passport-sized ID photos",
        isActive: true,
      },
    }),
    prisma.requirement.create({
      data: {
        name: "Barangay Clearance",
        description: "Clearance certificate from barangay",
        isActive: true,
      },
    }),
    prisma.requirement.create({
      data: {
        name: "Medical Certificate",
        description: "Medical clearance from licensed physician",
        isActive: true,
      },
    }),
  ]);

  console.log("Seeding completed successfully!");
  console.log("\nTest Credentials:");
  console.log("HR Admin - Email: hr@arvininternational.com, Password: admin123");
  console.log(
    "Applicant - Email: applicant@test.com, Password: test123"
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

