import jwt, { type JwtPayload } from "jsonwebtoken";

export interface DecodedToken extends JwtPayload {
    id: string;
    role: 'admin' | 'worker' | 'institution';
}

export const generateToken = (id: number, role: 'admin' | 'worker' | 'institution') => {
    return jwt.sign({ id: id, role }, process.env.JWT_SECRET!, {
        expiresIn: "24h"
    });
}

export const verifyToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        return decoded;
    } catch (err) {
        return null;
    }
}