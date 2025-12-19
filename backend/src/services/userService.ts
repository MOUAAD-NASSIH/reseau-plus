import { prisma } from "../lib/prisma";

// Get all users
export const getAllUsers = async () => {
    return prisma.user.findMany();
};

// Get single user by id
export const getUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        include: { role: true }
    });
};

// Get single user by email
export const getUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
        where: { email },
        include: { role: true },
    });
};

// update a user by id
export const updateUserById = async (id: number, data: {
    name?: string;
    email?: string;
    password?: string;
    role?: 'admin' | 'worker' | 'institution'
}) => {
    const { role, name, ...rest } = data;
    const updateData: any = { ...rest };
    if (role) {
        updateData.role = { connect: { name: role } };
    }
    return prisma.user.update({
        where: { id },
        data: updateData,
    });
};

// delete a user by id
export const deleteUserById = async (id: number) => {
    return prisma.user.delete({
        where: { id },
    });
};
