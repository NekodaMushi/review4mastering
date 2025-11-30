import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {prisma} from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", 
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Test config
  /* 
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.0.103:3000",
  ],*/
 
});
