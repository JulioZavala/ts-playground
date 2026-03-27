import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usersCreateInput } from "../generated/prisma/models";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export class AuthService {
  async register(data: usersCreateInput) {
    data.password = await bcrypt.hash(data.password, 10);

    return await prisma.users.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        createdAt: true,
      },
    });
  }

  async login(email: string, password: string) {
    // 1. Buscar el usuario por email
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new Error("Email y/o Password invalidos.");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error("Email y/o Password invalidos.");
    }

    // Generar el token
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  async getProfile(id: number) {
    return await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        rol: true,
        orders: true,
        createdAt: true,
      },
    });
  }
}


