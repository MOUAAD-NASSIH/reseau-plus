import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
    console.log("Seeding started...");

    // 1. Create Roles
    const roles = ["admin", "worker", "institution"];
    for (const roleName of roles) {
        await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName, description: `Role for ${roleName} users` },
        });
    }
    console.log("✓ Roles created.");

    // 2. Create Specialities
    const specialities = [
        { name: "Social Worker", description: "General social work services" },
        { name: "Child Protection", description: "Specialized in child welfare and protection" },
        { name: "Elderly Care", description: "Specialized in elderly care and support" },
        { name: "Mental Health", description: "Mental health and counseling services" },
        { name: "Family Counseling", description: "Family therapy and counseling" },
    ];

    const createdSpecialities = [];
    for (const spec of specialities) {
        const speciality = await prisma.speciality.upsert({
            where: { name: spec.name },
            update: {},
            create: spec,
        });
        createdSpecialities.push(speciality);
    }
    console.log("✓ Specialities created.");

    // 3. Create Domains
    const domains = [
        { name: "Healthcare", description: "Healthcare and medical services" },
        { name: "Education", description: "Educational institutions and programs" },
        { name: "Community Services", description: "Community outreach and support" },
        { name: "Child Welfare", description: "Child protection and welfare services" },
        { name: "Disability Support", description: "Support for people with disabilities" },
    ];

    const createdDomains = [];
    for (const domain of domains) {
        const createdDomain = await prisma.domain.upsert({
            where: { name: domain.name },
            update: {},
            create: domain,
        });
        createdDomains.push(createdDomain);
    }
    console.log("✓ Domains created.");

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("password123", salt);

    // 4. Create Admin User
    const adminEmail = "admin@example.com";
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password,
            role: { connect: { name: "admin" } },
        },
    });
    console.log("✓ Admin created.");

    // 5. Create Worker User with full details
    const workerEmail = "worker@example.com";
    const workerUser = await prisma.user.upsert({
        where: { email: workerEmail },
        update: {},
        create: {
            email: workerEmail,
            password,
            role: { connect: { name: "worker" } },
        },
    });

    // Delete existing worker if exists (for re-seeding)
    await prisma.worker.deleteMany({ where: { userId: workerUser.id } });

    const worker = await prisma.worker.create({
        data: {
            userId: workerUser.id,
            firstName: "John",
            lastName: "Doe",
            specialityId: createdSpecialities[0].id, // Social Worker
            experienceYears: 5,
            bio: "Experienced social worker with a passion for helping families and children. Specialized in community outreach and family counseling.",
            city: "Agadir",
            zipCode: "80000",
            latitude: 30.4278,
            longitude: -9.5981,
            birthDate: new Date("1990-05-15"),
            gender: "Male",
            status: "VERIFIED",
        },
    });
    console.log("✓ Worker created.");

    // 6. Link Worker with Domains
    await prisma.workerDomain.createMany({
        data: [
            { workerId: worker.id, domainId: createdDomains[0].id }, // Healthcare
            { workerId: worker.id, domainId: createdDomains[2].id }, // Community Services
            { workerId: worker.id, domainId: createdDomains[3].id }, // Child Welfare
        ],
        skipDuplicates: true,
    });
    console.log("✓ Worker domains linked.");

    // 7. Add Worker Experiences
    await prisma.workerExperience.createMany({
        data: [
            {
                workerId: worker.id,
                jobTitle: "Social Worker",
                organization: "Community Health Center",
                startDate: new Date("2018-01-15"),
                endDate: new Date("2020-12-31"),
                description: "Provided counseling and support services to families in need. Coordinated with healthcare providers and community organizations.",
            },
            {
                workerId: worker.id,
                jobTitle: "Senior Social Worker",
                organization: "Child Protection Services",
                startDate: new Date("2021-01-01"),
                endDate: null, // Currently working
                description: "Leading a team of social workers in child protection cases. Conducting assessments and developing intervention plans for at-risk families.",
            },
        ],
        skipDuplicates: true,
    });
    console.log("✓ Worker experiences added.");

    // 8. Add Worker Availabilities
    await prisma.workerAvailability.createMany({
        data: [
            {
                workerId: worker.id,
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-12-31"),
                isRecurring: true,
            },
        ],
        skipDuplicates: true,
    });
    console.log("✓ Worker availabilities added.");

    // 9. Create another Worker User
    const worker2Email = "jane.smith@example.com";
    const worker2User = await prisma.user.upsert({
        where: { email: worker2Email },
        update: {},
        create: {
            email: worker2Email,
            password,
            role: { connect: { name: "worker" } },
        },
    });

    await prisma.worker.deleteMany({ where: { userId: worker2User.id } });

    const worker2 = await prisma.worker.create({
        data: {
            userId: worker2User.id,
            firstName: "Jane",
            lastName: "Smith",
            specialityId: createdSpecialities[2].id, // Elderly Care
            experienceYears: 8,
            bio: "Dedicated social worker specializing in elderly care and support services.",
            city: "Casablanca",
            zipCode: "20000",
            latitude: 33.5731,
            longitude: -7.5898,
            birthDate: new Date("1985-08-22"),
            gender: "Female",
            status: "VERIFIED",
        },
    });

    await prisma.workerDomain.createMany({
        data: [
            { workerId: worker2.id, domainId: createdDomains[0].id }, // Healthcare
            { workerId: worker2.id, domainId: createdDomains[4].id }, // Disability Support
        ],
        skipDuplicates: true,
    });

    await prisma.workerExperience.createMany({
        data: [
            {
                workerId: worker2.id,
                jobTitle: "Elderly Care Specialist",
                organization: "Senior Living Center",
                startDate: new Date("2016-03-01"),
                endDate: new Date("2022-06-30"),
                description: "Provided comprehensive care coordination for elderly residents.",
            },
            {
                workerId: worker2.id,
                jobTitle: "Lead Social Worker",
                organization: "Retirement Community Services",
                startDate: new Date("2022-07-01"),
                endDate: null,
                description: "Managing social work programs for elderly community members.",
            },
        ],
        skipDuplicates: true,
    });
    console.log("✓ Second worker created with details.");

    // 10. Create Institution User
    const instEmail = "inst@example.com";
    const inst = await prisma.user.upsert({
        where: { email: instEmail },
        update: {},
        create: {
            email: instEmail,
            password,
            role: { connect: { name: "institution" } },
        },
    });

    await prisma.institution.deleteMany({ where: { userId: inst.id } });

    await prisma.institution.create({
        data: {
            userId: inst.id,
            institutionName: "Child Care Center",
            address: "RUE 45 BLOCK 6 Talborjt",
            city: "Agadir",
            latitude: 30.4278,
            longitude: -9.5981,
        },
    });
    console.log("✓ Institution created.");

    console.log("\n✅ Seeding completed successfully!");
    console.log("\nTest Accounts:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:       admin@example.com / password123");
    console.log("Worker 1:    worker@example.com / password123");
    console.log("Worker 2:    jane.smith@example.com / password123");
    console.log("Institution: inst@example.com / password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
