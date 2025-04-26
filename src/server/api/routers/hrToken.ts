// In a new HRToken router file (e.g., src/server/api/routers/hrToken.ts):

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, roleProtectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {randomBytes} from "crypto"

// encryption library
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

import { env } from "~/env";

const secretKey = naclUtil.decodeBase64(env.ENCRYPTION_KEY);

type comapnyInput = {
  name    ?:  string;
  website ?:  string;
  logo    ?:  string;
}

function encryptObject(obj: comapnyInput) {
  const jsonString = JSON.stringify(obj);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength); // 24-byte nonce
  const messageUint8 = naclUtil.decodeUTF8(jsonString);
  const encrypted = nacl.secretbox(messageUint8, nonce, secretKey);
  return {
    token: naclUtil.encodeBase64(encrypted),
    nonce: naclUtil.encodeBase64(nonce),
  };
}

function decryptObject(encryptedData: string, nonce: string) {
  const decrypted = nacl.secretbox.open(
    naclUtil.decodeBase64(encryptedData),
    naclUtil.decodeBase64(nonce),
    secretKey
  );

  if (!decrypted) {
    throw new Error("Failed to decrypt data.");
  }

  return JSON.parse(naclUtil.encodeUTF8(decrypted)) as comapnyInput;
}


export const hrTokenRouter = createTRPCRouter({
  generateHRToken: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam'])
  .input(
    z.object({
      name: z.string(),
      website: z.string(),
      logo: z.string(),
    })
  )
  .mutation(async ({ input }) => {

    // Encrypt the company data using nacl library and store the token and nonce in db.
    // nonce is a unique key that is used witth secret key to encrypt and decrypt data such that even 2 same data does not have same encryption
    
    const {token , nonce} = encryptObject(input);
    
    // Create the HRToken record
    const hrToken = await db.hR.create({
      data: { 
        token : token,
        nonce : nonce,
        isValid : true
      },
    });

    // Here you might also store the title/company if needed (or later associate them)
    // For now, simply return the token or the generated link (for example, a URL with the token as query parameter)
    return { token , link: `${process.env.NEXTAUTH_URL}/hr/new?token=${token}` };
  }),

  // This procedure verifies a token, marks it as used (or simply returns valid) and allows access to the job opening form
  verifyHRToken: publicProcedure.input(
    z.object({
      token: z.string(),
    })
  ).query(async ({ input }) => {

    const decodedToken = decodeURIComponent(input.token)
    .replace(/ /g, "+")
    .replace(/-/g, "+")
    .replace(/_/g, "/");  
    
    const hrToken = await db.hR.findUnique({
      where: { token: decodedToken },
    });

    if (!hrToken) {
      throw new Error("Invalid token");
    }
    if(!hrToken.viewPermissions){
      return {
        viewPermission:false
      }
    }
    if (!hrToken.isValid) {
      return { valid: false , company:{
        name: "This token has already been used.",
        website: "",
        logo: "",
      }};
    }

    const nonce = hrToken.nonce;

    const company = decryptObject(decodedToken , nonce)

    
    // Optionally, mark the token as used:
    // await db.HR.update({ where: { token: input.token }, data: { isValid: false } });

    return { valid: true , company:company};
  }),
  adminGetHrToken: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam'])
      .query(async ({ ctx, input }) => {
        const tokenData = await ctx.db.jobOpening.findMany({
          where: {
            year : ctx.session.user.year,
          },
          select:{
            token:true,
            id:true,
            company:{
              select:{
                logo:true,
                name:true
              }
            }
          }
        });
        return {
          data: tokenData
        }
      }),
      adminDisableToken: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam'])
      .input(
        z.object({
          token:z.string()
        })
      )
      .mutation(async ({ ctx, input }) => {
        await ctx.db.hR.update({
          where:{
            token:input.token
          },
          data:{
            isValid:false,
            viewPermissions: false
          }
        });
        return {
          status:"success"
        }
      }),
      adminGetTokenStatus: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam'])
      .input(
        z.object({
          token:z.string()
        })
      )
      .query(async ({ ctx, input }) => {
        const tokenData = await ctx.db.hR.findUnique({
          where:{
            token:input.token
          }
        });
        return {
          data: tokenData
        }
      }
      ),
      adminEnableToken: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam'])
      .input(
        z.object({
          token:z.string()
        })
      )
      .mutation(async ({ ctx, input }) => {
        await ctx.db.hR.update({
          where:{
            token:input.token
          },
          data:{
            viewPermissions: true
          }
        });
        return {
          status:"success"
        }
      }),
});
