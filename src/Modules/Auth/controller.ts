import { Request, Response } from "express";
import { AuthService } from "./services";

export class AuthController {
  // POST /api/auth/signup
  static async signup(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, password, confirmPassword, role  } = req.body;
      const result = await AuthService.signup({
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        role
      });
      res.status(201).json({ message: "User created successfully", user: result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/auth/login
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const token = await AuthService.login({ email, password });
      res.status(200).json({ message: "Login successful", token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/auth/forgot-password
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const token = await AuthService.forgotPassword(email);
      res.status(200).json({ message: "Reset token generated", token });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }


  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const result = await AuthService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });
      res.status(200).json({ message: result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
