import {
  type DefaultSession,
  getServerSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { db } from "~/server/db";
import { getStudentAviralData, verifyPassword } from "~/server/utils/aviral";
import { jwtHelper, tokenOneDay, tokenOnWeek } from "~/server/utils/jwtHelper";

declare module "next-auth" {
  interface User {
    id?: string;
    name?: string;
    username?: string;
    userGroup?: string;
    // New role property instead of admin: CHANGE
    role: {
      name: string;
    };
    isOnboardingComplete: boolean;
    year?: number;
  }

  interface Session {
    user: {
      id?: string;
      name?: string;
      username?: string;
      userGroup?: string;
      // New role property: CHANGE
      role: {
        name: string;
      };
      isOnboardingComplete: boolean;
      year?: number;
    };
    error?: "RefreshAccessTokenError";
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    user: any;
    accessToken: string;
    refreshToken: string;
    accessTokenExpired: number;
    refreshTokenExpired: number;
    error?: "RefreshAccessTokenError";
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // credentials provider:  Save the access token and refresh token in the JWT on the initial login
      if (user) {
        const authUser = { ...user };

        const accessToken = await jwtHelper.createAcessToken(authUser);
        const refreshToken = await jwtHelper.createRefreshToken(authUser);
        const accessTokenExpired = Date.now() / 1000 + tokenOneDay;
        const refreshTokenExpired = Date.now() / 1000 + tokenOnWeek;

        return {
          ...token,
          accessToken,
          refreshToken,
          accessTokenExpired,
          refreshTokenExpired,
          user: authUser,
        };
      } else {
        if (token) {
          // In subsequent requests, check access token has expired, try to refresh it
          if (Date.now() / 1000 > token.accessTokenExpired) {
            const verifyToken = await jwtHelper.verifyToken(token.refreshToken);

            if (verifyToken) {
              const user = await db.user.findFirst({
                where: {
                  id: token.user.id,
                },
              });

              if (user) {
                const accessToken = await jwtHelper.createAcessToken(
                  token.user,
                );
                const accessTokenExpired = Date.now() / 1000 + tokenOneDay;

                return { ...token, accessToken, accessTokenExpired };
              }
            }

            return { ...token, error: "RefreshAccessTokenError" };
          }
        }
      }

      if (trigger === "update") {
        if (session.info.year) {
          const user = await db.user.findFirst({
            where: {
              id: token.user.id,
            },
            select: { //CHANGED
              userGroup: true,
              role: { select: { name: true } },
              student: { select: { admissionYear: true, program: true } },
            },
            
          });
          if (user.role.name == 'superAdmin') {
            const newUser = { ...token.user };
            newUser.year = session.info.year;
            return {
              ...token,
              user: newUser,
            };
          } else if (user.userGroup === "student") {
            const yearExists = await db.participatingGroups.findFirst({
              where: {
                year: session.info.year,
                admissionYear: user.student?.admissionYear || null,
                program: user.student?.program || null,
              },
            });
            if (yearExists) {
              const newUser = { ...token.user };
              newUser.year = session.info.year;
              return {
                ...token,
                user: newUser,
              };
            }
          }
        } else if (session.info.onboardingComplete) {
          const user = await db.user.findFirst({
            where: {
              id: token.user.id,
            },
            select: {
              student: {
                select: {
                  isOnboardingComplete: true,
                },
              },
            },
          });
          if (user.student && user.student.isOnboardingComplete) {
            const newUser = { ...token.user };
            newUser.isOnboardingComplete = true;
            return {
              ...token,
              user: newUser,
            };
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          username: token.user.username as string,
          name: token.user.name as string,
          id: token.user.id,
          role: token.user.role, // new role property
          userGroup: token.user.userGroup,
          year: token.user.year,
          isOnboardingComplete: token.user.isOnboardingComplete,
        };        
      }
      session.error = token.error;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "LDAP",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // @ts-ignore
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password)
          throw new Error("Missing Credentials");

        let authenticatedUserGroup = await verifyPassword(
          credentials.username,
          credentials.password,
        );

        if (!authenticatedUserGroup) throw new Error("Invalid Credentials");

        let user = await db.user.findFirst({  //CHANGED
          where: { username: credentials.username },
          select: {
            id: true,
            name: true,
            username: true,
            year: true,
            userGroup: true,
            role: { select: { name: true } },
            student: {
              select: {
                admissionYear: true,
                program: true,
                isOnboardingComplete: true,
                passOutYear : true
              },
            },
          },
        });
        

        if (!user) {
          const userCount = await db.user.count();
          if (authenticatedUserGroup === "student" && userCount > 0) {
            let userData = await getStudentAviralData(
              credentials.username,
              credentials.password,
            );
            //if (!userData) throw new Error("User Not Found");

            user = await db.user.create({
              data: {
                userGroup: authenticatedUserGroup,
                username: credentials.username,
                name: 'sugam',  // or userData.name,
                email: credentials.username + "@iiita.ac.in",
                // New role logic:
                role: {
                  connectOrCreate: {
                    where: { name: "student" },
                    create: { name: "student" },
                  },
                },
                student: {
                  create: {
                    program: 'ECE',
                    admissionYear: 2022,
                    duration: 4,
                    currentSemester: '6',
                    completedCredits: 108,  
                    totalCredits: 150,//userData.totalCredits,
                    cgpa: 7.6,
                    email: credentials.username + "@iiita.ac.in",
                  },
                },
              },
              select: {
                id: true,
                name: true,
                username: true,
                userGroup: true,
                // Remove admin and include role:
                role: { select: { name: true } },
                student: {
                  select: {
                    admissionYear: true,
                    program: true,
                    isOnboardingComplete: true,
                    passOutYear : true
                  },
                },
              },
            });
            
          } else if (userCount === 0) {   //authenticatedUserGroup === "faculty"
            console.log("I have reached My destination");
            let userData = await getStudentAviralData(
              credentials.username,
              credentials.password,
            );
            if (!userData) throw new Error("User Not Found");
            user = await db.user.create({
              data: {
                userGroup: 'Admin',       //authenticatedUserGroup,
                username: credentials.username,
                name: userData.name,
                email: credentials.username + "@iiita.ac.in",
                role: {
                  connectOrCreate: {
                    where: { name: "superAdmin"},
                    create: { name: "superAdmin" },
                  },
                },
                
              },
              select: {
                id: true,
                name: true,
                year: true,
                username: true,
                userGroup: true,
                role: { select: { name: true } },
                student: {
                  select: {
                    admissionYear: true,
                    program: true,
                    isOnboardingComplete: true,
                  },
                },
              },
            });
          } else {
            throw new Error("Only students and faculties supported");
          }
        }

        // const latestYear = await db.participatingGroups.findFirst({
        //   select: {
        //     year: true,
        //   },
        //   where: {
        //     ...(user.student && {
        //       admissionYear: user.student?.admissionYear,
        //       program: user.student?.program,
        //     }),
        //   },
        //   orderBy: {
        //     year: "desc",
        //   },
        // });

        const latestYear = user.student?.passOutYear || user.year;

        console.log("This is the passout year for the student : ",  latestYear);

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          userGroup: user.userGroup,
          role: user.role,
          isOnboardingComplete: user.student
            ? user.student.isOnboardingComplete
            : true,
          year: latestYear,
        } as DefaultSession["user"];               
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
};

export const getServerAuthSession = () => {
  return getServerSession(authOptions);
};
