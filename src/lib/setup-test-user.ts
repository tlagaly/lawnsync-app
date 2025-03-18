import { db } from "./db";
import bcrypt from "bcryptjs";

const TEST_USER = {
  email: "test@example.com",
  password: "password123",
  name: "Test User",
};

export async function setupTestUser() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  try {
    // Check if test user exists
    const existingUser = await db.user.findUnique({
      where: { email: TEST_USER.email },
    });

    if (!existingUser) {
      // Create test user if it doesn't exist
      const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
      await db.user.create({
        data: {
          email: TEST_USER.email,
          password: hashedPassword,
          name: TEST_USER.name,
        },
      });
      console.log("Test user created successfully");
    }
  } catch (error) {
    console.error("Error setting up test user:", error);
  }
}