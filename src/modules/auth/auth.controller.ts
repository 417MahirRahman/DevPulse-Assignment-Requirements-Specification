import type { Request, Response } from "express";
import { authService } from "./auth.service";

const signup = async (req: Request, res: Response) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res
      .status(400)
      .json({
        success: false,
        message: "name, email, and password are required",
      });
    return;
  }

  try {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err: any) {
    if (err.message === "EMAIL_IN_USE") {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    console.log("result: ", { result });
    res.status(200).json({
      success: true,
      message: "User login successfully!",
      data: req.body,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

export const authController = {
  signup,
  login,
};
