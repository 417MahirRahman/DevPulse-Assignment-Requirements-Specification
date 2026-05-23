import bcrypt from "bcryptjs";
import { pool } from "./../../database/index";

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const { name, email, password } = payload;
  const validRoles = ["contributor", "maintainer"];
  const role =
    payload.role && validRoles.includes(payload.role)
      ? payload.role
      : "contributor";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userInfo = await pool.query(
      `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `,
      [name, email, hashedPassword, role],
    );
    console.log("userInfo: ", userInfo.rows[0]);
    return userInfo.rows[0];
  } catch (err: any) {
    if (err.code === "23505") {
      throw new Error("EMAIL_IN_USE");
    }

    throw err;
  }
};

const loginUserIntoDB = async (payload: {
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

};

export const authService = {
  registerUser,
  loginUserIntoDB,
};
