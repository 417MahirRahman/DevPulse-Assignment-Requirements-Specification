import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./../../database/index";
import config from "../../config";

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userInfo = await pool.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
      RETURNING id, name, email, role, created_at, updated_at
      `,
      [name, email, hashedPassword, role],
    );

    return userInfo.rows[0];
  } catch (err: any) {
    throw new Error(err.message);
  }
};

const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  const token = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: "1d",
  });

  return { token, user: jwtpayload };
};

export const authService = {
  registerUser,
  loginUser,
};
