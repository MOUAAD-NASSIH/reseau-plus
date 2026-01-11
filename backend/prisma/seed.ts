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
    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password,
            role: { connect: { name: "admin" } },
        },
    });
    console.log("✓ Admin created.");

    // 5. Create Worker User 1 with full details
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

    await prisma.worker.deleteMany({ where: { userId: workerUser.id } });

    const worker = await prisma.worker.create({
        data: {
            userId: workerUser.id,
            firstName: "John",
            lastName: "Doe",
            specialityId: createdSpecialities[0].id,
            experienceYears: 5,
            bio: "Experienced social worker with a passion for helping families and children.",
            city: "Agadir",
            zipCode: "80000",
            latitude: 30.4278,
            longitude: -9.5981,
            birthDate: new Date("1990-05-15"),
            gender: "Male",
            status: "VERIFIED",
        },
    });
    console.log("✓ Worker 1 created.");

    // Link Worker 1 with Domains
    await prisma.workerDomain.createMany({
        data: [
            { workerId: worker.id, domainId: createdDomains[0].id },
            { workerId: worker.id, domainId: createdDomains[2].id },
            { workerId: worker.id, domainId: createdDomains[3].id },
        ],
        skipDuplicates: true,
    });

    // Add Worker 1 Experiences
    await prisma.workerExperience.createMany({
        data: [
            {
                workerId: worker.id,
                jobTitle: "Social Worker",
                organization: "Community Health Center",
                startDate: new Date("2018-01-15"),
                endDate: new Date("2020-12-31"),
                description: "Provided counseling and support services to families in need.",
            },
            {
                workerId: worker.id,
                jobTitle: "Senior Social Worker",
                organization: "Child Protection Services",
                startDate: new Date("2021-01-01"),
                endDate: null,
                description: "Leading a team of social workers in child protection cases.",
            },
        ],
        skipDuplicates: true,
    });

    // Add Worker 1 Availabilities
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
    console.log("✓ Worker 1 experiences and availabilities added.");

    // 6. Create Worker User 2
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
            specialityId: createdSpecialities[2].id,
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
            { workerId: worker2.id, domainId: createdDomains[0].id },
            { workerId: worker2.id, domainId: createdDomains[4].id },
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
        ],
        skipDuplicates: true,
    });
    console.log("✓ Worker 2 created with details.");

    // 7. Create Worker 3 (PENDING status for testing verification)
    const worker3Email = "pending.worker@example.com";
    const worker3User = await prisma.user.upsert({
        where: { email: worker3Email },
        update: {},
        create: {
            email: worker3Email,
            password,
            role: { connect: { name: "worker" } },
        },
    });

    await prisma.worker.deleteMany({ where: { userId: worker3User.id } });

    const worker3 = await prisma.worker.create({
        data: {
            userId: worker3User.id,
            firstName: "Mike",
            lastName: "Johnson",
            specialityId: createdSpecialities[3].id,
            experienceYears: 3,
            bio: "Mental health specialist awaiting verification.",
            city: "Rabat",
            zipCode: "10000",
            status: "PENDING",
        },
    });
    console.log("✓ Worker 3 (pending) created.");

    // 8. Create Institution 1
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

    const institution = await prisma.institution.create({
        data: {
            userId: inst.id,
            institutionName: "Child Care Center",
            address: "RUE 45 BLOCK 6 Talborjt",
            city: "Agadir",
            latitude: 30.4278,
            longitude: -9.5981,
        },
    });
    console.log("✓ Institution 1 created.");

    // 9. Create Institution 2
    const inst2Email = "hospital@example.com";
    const inst2 = await prisma.user.upsert({
        where: { email: inst2Email },
        update: {},
        create: {
            email: inst2Email,
            password,
            role: { connect: { name: "institution" } },
        },
    });

    await prisma.institution.deleteMany({ where: { userId: inst2.id } });

    const institution2 = await prisma.institution.create({
        data: {
            userId: inst2.id,
            institutionName: "Regional Hospital",
            address: "Avenue Hassan II",
            city: "Casablanca",
            latitude: 33.5731,
            longitude: -7.5898,
        },
    });
    console.log("✓ Institution 2 created.");

    // 10. Create Missions
    const mission1 = await prisma.mission.create({
        data: {
            institutionId: institution.id,
            title: "Child Support Program Assistant",
            description: "Assist with daily activities and provide emotional support for children in our care program.",
            startDate: new Date("2024-02-01"),
            endDate: new Date("2024-06-30"),
            requiredSpecialityId: createdSpecialities[1].id,
            location: "Agadir",
            budget: 5000,
            urgency: "MEDIUM",
            status: "OPEN",
        },
    });

    const mission2 = await prisma.mission.create({
        data: {
            institutionId: institution.id,
            title: "Family Counseling Sessions",
            description: "Conduct weekly family counseling sessions for at-risk families.",
            startDate: new Date("2024-03-01"),
            endDate: new Date("2024-08-31"),
            requiredSpecialityId: createdSpecialities[4].id,
            location: "Agadir",
            budget: 8000,
            urgency: "HIGH",
            status: "OPEN",
        },
    });

    const mission3 = await prisma.mission.create({
        data: {
            institutionId: institution2.id,
            title: "Elderly Patient Support",
            description: "Provide social support services for elderly patients in the hospital.",
            startDate: new Date("2024-01-15"),
            endDate: new Date("2024-04-15"),
            requiredSpecialityId: createdSpecialities[2].id,
            location: "Casablanca",
            budget: 6000,
            urgency: "HIGH",
            status: "ONGOING",
        },
    });

    const mission4 = await prisma.mission.create({
        data: {
            institutionId: institution2.id,
            title: "Mental Health Outreach",
            description: "Community mental health awareness and support program.",
            startDate: new Date("2023-06-01"),
            endDate: new Date("2023-12-31"),
            requiredSpecialityId: createdSpecialities[3].id,
            location: "Casablanca",
            budget: 10000,
            urgency: "MEDIUM",
            status: "CLOSED",
        },
    });

    const mission5 = await prisma.mission.create({
        data: {
            institutionId: institution.id,
            title: "Youth Mentorship Program",
            description: "Mentor at-risk youth in the community, providing guidance and support for education and personal development.",
            startDate: new Date("2024-05-01"),
            endDate: new Date("2024-12-31"),
            requiredSpecialityId: createdSpecialities[0].id,
            location: "Agadir",
            budget: 7500,
            urgency: "LOW",
            status: "OPEN",
        },
    });

    const mission6 = await prisma.mission.create({
        data: {
            institutionId: institution2.id,
            title: "Disability Support Coordinator",
            description: "Coordinate support services for individuals with disabilities, including resource allocation and advocacy.",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-10-31"),
            requiredSpecialityId: createdSpecialities[0].id,
            location: "Casablanca",
            budget: 9000,
            urgency: "HIGH",
            status: "ONGOING",
        },
    });

    const mission7 = await prisma.mission.create({
        data: {
            institutionId: institution.id,
            title: "Crisis Intervention Team Member",
            description: "Provide immediate crisis intervention and support for families experiencing domestic violence or emergency situations.",
            startDate: new Date("2024-03-15"),
            endDate: new Date("2024-09-15"),
            requiredSpecialityId: createdSpecialities[3].id,
            location: "Agadir",
            budget: 12000,
            urgency: "HIGH",
            status: "OPEN",
        },
    });

    const mission8 = await prisma.mission.create({
        data: {
            institutionId: institution2.id,
            title: "Senior Living Wellness Program",
            description: "Develop and implement wellness activities for seniors in assisted living facilities.",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-12-31"),
            requiredSpecialityId: createdSpecialities[2].id,
            location: "Casablanca",
            budget: 6500,
            urgency: "MEDIUM",
            status: "OPEN",
        },
    });

    const mission9 = await prisma.mission.create({
        data: {
            institutionId: institution.id,
            title: "Substance Abuse Counseling",
            description: "Provide counseling and support services for individuals struggling with substance abuse issues.",
            startDate: new Date("2024-02-15"),
            endDate: new Date("2024-08-15"),
            requiredSpecialityId: createdSpecialities[3].id,
            location: "Agadir",
            budget: 11000,
            urgency: "HIGH",
            status: "ONGOING",
        },
    });

    const mission10 = await prisma.mission.create({
        data: {
            institutionId: institution2.id,
            title: "Foster Care Support Services",
            description: "Support foster families and children in foster care with resources, counseling, and home visits.",
            startDate: new Date("2024-01-01"),
            endDate: new Date("2024-06-30"),
            requiredSpecialityId: createdSpecialities[1].id,
            location: "Casablanca",
            budget: 8500,
            urgency: "MEDIUM",
            status: "ONGOING",
        },
    });

    console.log("✓ Missions created.");

    // 11. Create Mission Domains
    await prisma.missionDomain.createMany({
        data: [
            { missionId: mission1.id, domainId: createdDomains[3].id },
            { missionId: mission2.id, domainId: createdDomains[2].id },
            { missionId: mission2.id, domainId: createdDomains[3].id },
            { missionId: mission3.id, domainId: createdDomains[0].id },
            { missionId: mission4.id, domainId: createdDomains[0].id },
            { missionId: mission4.id, domainId: createdDomains[2].id },
            { missionId: mission5.id, domainId: createdDomains[1].id },
            { missionId: mission5.id, domainId: createdDomains[2].id },
            { missionId: mission6.id, domainId: createdDomains[4].id },
            { missionId: mission6.id, domainId: createdDomains[0].id },
            { missionId: mission7.id, domainId: createdDomains[3].id },
            { missionId: mission7.id, domainId: createdDomains[2].id },
            { missionId: mission8.id, domainId: createdDomains[0].id },
            { missionId: mission9.id, domainId: createdDomains[0].id },
            { missionId: mission9.id, domainId: createdDomains[2].id },
            { missionId: mission10.id, domainId: createdDomains[3].id },
        ],
        skipDuplicates: true,
    });
    console.log("✓ Mission domains linked.");

    // 12. Create Mission Applications
    const application1 = await prisma.missionApplication.create({
        data: {
            missionId: mission1.id,
            workerId: worker.id,
            status: "SUBMITTED",
        },
    });

    const application2 = await prisma.missionApplication.create({
        data: {
            missionId: mission3.id,
            workerId: worker2.id,
            status: "ACCEPTED",
        },
    });

    const application3 = await prisma.missionApplication.create({
        data: {
            missionId: mission4.id,
            workerId: worker.id,
            status: "ACCEPTED",
        },
    });

    const application4 = await prisma.missionApplication.create({
        data: {
            missionId: mission5.id,
            workerId: worker2.id,
            status: "SUBMITTED",
        },
    });

    const application5 = await prisma.missionApplication.create({
        data: {
            missionId: mission6.id,
            workerId: worker.id,
            status: "ACCEPTED",
        },
    });

    const application6 = await prisma.missionApplication.create({
        data: {
            missionId: mission7.id,
            workerId: worker.id,
            status: "SUBMITTED",
        },
    });

    const application7 = await prisma.missionApplication.create({
        data: {
            missionId: mission8.id,
            workerId: worker2.id,
            status: "REJECTED",
        },
    });

    const application8 = await prisma.missionApplication.create({
        data: {
            missionId: mission9.id,
            workerId: worker2.id,
            status: "ACCEPTED",
        },
    });

    const application9 = await prisma.missionApplication.create({
        data: {
            missionId: mission10.id,
            workerId: worker.id,
            status: "ACCEPTED",
        },
    });

    console.log("✓ Mission applications created.");

    // 13. Create Mission Assignments
    const assignment1 = await prisma.missionAssignment.create({
        data: {
            missionId: mission3.id,
            workerId: worker2.id,
            institutionId: institution2.id,
            status: "ONGOING",
        },
    });

    const assignment2 = await prisma.missionAssignment.create({
        data: {
            missionId: mission4.id,
            workerId: worker.id,
            institutionId: institution2.id,
            status: "COMPLETED",
        },
    });

    const assignment3 = await prisma.missionAssignment.create({
        data: {
            missionId: mission6.id,
            workerId: worker.id,
            institutionId: institution2.id,
            status: "ONGOING",
        },
    });

    const assignment4 = await prisma.missionAssignment.create({
        data: {
            missionId: mission9.id,
            workerId: worker2.id,
            institutionId: institution.id,
            status: "ONGOING",
        },
    });

    const assignment5 = await prisma.missionAssignment.create({
        data: {
            missionId: mission10.id,
            workerId: worker.id,
            institutionId: institution2.id,
            status: "ACTIVE",
        },
    });

    console.log("✓ Mission assignments created.");

    // 14. Create Payments
    await prisma.payment.create({
        data: {
            missionAssignmentId: assignment2.id,
            institutionId: institution2.id,
            workerId: worker.id,
            amountTotal: 10000,
            platformFee: 1500,
            workerAmount: 8500,
            status: "COMPLETED",
            paidAt: new Date("2024-01-05"),
        },
    });

    await prisma.payment.create({
        data: {
            missionAssignmentId: assignment3.id,
            institutionId: institution2.id,
            workerId: worker.id,
            amountTotal: 9000,
            platformFee: 1350,
            workerAmount: 7650,
            status: "PENDING",
        },
    });

    await prisma.payment.create({
        data: {
            missionAssignmentId: assignment4.id,
            institutionId: institution.id,
            workerId: worker2.id,
            amountTotal: 11000,
            platformFee: 1650,
            workerAmount: 9350,
            status: "PENDING",
        },
    });

    console.log("✓ Payments created.");

    // 15. Create Reviews
    await prisma.review.create({
        data: {
            missionAssignmentId: assignment2.id,
            reviewerId: inst2.id,
            revieweeId: workerUser.id,
            rating: 5,
            comment: "Excellent work! John was professional and dedicated throughout the program.",
        },
    });

    await prisma.review.create({
        data: {
            missionAssignmentId: assignment2.id,
            reviewerId: workerUser.id,
            revieweeId: inst2.id,
            rating: 4,
            comment: "Great organization to work with. Good communication and support.",
        },
    });
    console.log("✓ Reviews created.");

    // 16. Create Notifications
    await prisma.notification.createMany({
        data: [
            {
                userId: workerUser.id,
                type: "APPLICATION_ACCEPTED",
                message: "Your application for 'Mental Health Outreach' has been accepted!",
                isRead: true,
            },
            {
                userId: workerUser.id,
                type: "PAYMENT_RECEIVED",
                message: "You have received a payment of €8500.00 for mission 'Mental Health Outreach'.",
                isRead: true,
            },
            {
                userId: workerUser.id,
                type: "REVIEW_RECEIVED",
                message: "You received a 5-star review for mission 'Mental Health Outreach'.",
                isRead: false,
            },
            {
                userId: worker2User.id,
                type: "APPLICATION_ACCEPTED",
                message: "Your application for 'Elderly Patient Support' has been accepted!",
                isRead: true,
            },
            {
                userId: inst.id,
                type: "APPLICATION_RECEIVED",
                message: "New application received from John Doe for mission 'Child Support Program Assistant'.",
                isRead: false,
            },
            {
                userId: inst2.id,
                type: "ASSIGNMENT_COMPLETED",
                message: "Mission 'Mental Health Outreach' has been completed.",
                isRead: true,
            },
        ],
    });
    console.log("✓ Notifications created.");

    // 17. Create Admin Logs
    await prisma.adminLog.createMany({
        data: [
            {
                adminId: adminUser.id,
                targetUserId: workerUser.id,
                actionType: "WORKER_VERIFIED",
                reason: "All documents verified and credentials confirmed.",
            },
            {
                adminId: adminUser.id,
                targetUserId: worker2User.id,
                actionType: "WORKER_VERIFIED",
                reason: "Profile and experience verified.",
            },
        ],
    });
    console.log("✓ Admin logs created.");

    // 18. Create Worker Documents
    await prisma.workerDocument.createMany({
        data: [
            {
                workerId: worker.id,
                type: "DIPLOMA",
                fileUrl: "https://res.cloudinary.com/demo/diploma_john.pdf",
                status: "APPROVED",
                adminComment: "Verified diploma from accredited institution.",
                reviewedAt: new Date("2024-01-01"),
            },
            {
                workerId: worker.id,
                type: "CV",
                fileUrl: "https://res.cloudinary.com/demo/cv_john.pdf",
                status: "APPROVED",
                reviewedAt: new Date("2024-01-01"),
            },
            {
                workerId: worker3.id,
                type: "DIPLOMA",
                fileUrl: "https://res.cloudinary.com/demo/diploma_mike.pdf",
                status: "PENDING",
            },
            {
                workerId: worker3.id,
                type: "ID",
                fileUrl: "https://res.cloudinary.com/demo/id_mike.pdf",
                status: "PENDING",
            },
        ],
        skipDuplicates: true,
    });
    console.log("✓ Worker documents created.");

    console.log("\n✅ Seeding completed successfully!");
    console.log("=".repeat(50));
    console.log("Test accounts created:");
    console.log("  Admin:       admin@example.com / password123");
    console.log("  Worker 1:    worker@example.com / password123 (VERIFIED)");
    console.log("  Worker 2:    jane.smith@example.com / password123 (VERIFIED)");
    console.log("  Worker 3:    pending.worker@example.com / password123 (PENDING)");
    console.log("  Institution: inst@example.com / password123");
    console.log("  Institution: hospital@example.com / password123");
    console.log("=".repeat(50));
}

main()
    .catch((e) => {
        console.error("Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
