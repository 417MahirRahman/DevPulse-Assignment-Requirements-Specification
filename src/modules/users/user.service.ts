import bcrypt from "bcryptjs";
import { pool } from "../../database";
import type { IUser } from "./user.interface";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
     INSERT INTO users(name,email,password,role)
     VALUES($1,$2,$3,COALESCE($4,'contributor'))
     RETURNING *
    `,
    [name, email, hashPassword, role],
  );

  if (result.rows.length > 0) {
    delete result.rows[0].password;
  }

  return result.rows[0];
};

export const userService = {
  createUserIntoDB,
};
