import { z } from "zod";

import { roleProtectedProcedure, createTRPCRouter } from "~/server/api/trpc";

export const analyticsRouter = createTRPCRouter({
  getJobTypes: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam', 'PlacementTeamMember']).query(async ({ ctx }) => {
    const data = await ctx.db.placementType.findMany({
      where: {
        ParticipatingGroups: {
          some: {
            year: ctx.session.user.year,
          },
        },
      },
    });
    return data;
  }),

  getJobTypeSelectionAnalytics: roleProtectedProcedure(['superAdmin', 'PlacementCoreTeam', 'PlacementTeamMember'])
  .input(z.object({
    filterType: z.enum(["program", "Caste", "Religion", "gender"]),
  }))
  .query(async ({ ctx, input }) => {
    const { filterType } = input;

    // Fetch all selected students
    const selectedStudents = await ctx.db.selectedStudents.findMany({
      where: {
        year: ctx.session.user.year,
      },
      select: {
        userId: true,
        jobType: true,
      },
    });

    // Fetch all students
    const allStudents = await ctx.db.students.findMany({
      where: {
        passOutYear: ctx.session.user.year,
      },
      select: {
        userId: true,
        [filterType]: true,
      },
    });
    // Set to track the selected student IDs for efficient look-up
    const selectedStudentIds = new Set(selectedStudents.map((s) => s.userId));

    // Group data by filterType and jobType
    const groupedData: Record<string, Record<string, { selected: number; all: number }>> = {};

    // Loop through all students to classify them based on filterType and jobType
   // Initialize a filterCount map to keep track of all students for each filter group
const filterCount: Map<string, number> = new Map();

for (const student of allStudents) {
  const filterKey = (student as any)[filterType] ?? "Unknown"; // e.g., "Hindu" for Religion, "CSE" for program

  // Increment the count for the filterKey (total students for that filterType)
  filterCount.set(filterKey, (filterCount.get(filterKey) || 0) + 1);

  // Initialize the group in groupedData if it doesn't exist yet
  if (!groupedData[filterKey]) {
    groupedData[filterKey] = {};
  }

  // Loop through selected students and increment the count for the corresponding jobType
  const studentJobType = selectedStudents.find((s) => s.userId === student.userId)?.jobType ?? "Unplaced";
  
  if (!groupedData[filterKey][studentJobType]) {
    groupedData[filterKey][studentJobType] = { selected: 0, all: 0 };
  }

  // Increment the "all" count for this filterType and jobType
  groupedData[filterKey][studentJobType].all += 1;

  // Increment the "selected" count if this student is selected for the jobType
  if (selectedStudentIds.has(student.userId)) {
    groupedData[filterKey][studentJobType].selected += 1;
  }
}

// Now you can use the filterCount map to get the total count of students for each filter group
console.log(filterCount); // This will give you the total count of students for each filter group


    // Convert the grouped data into an array format
    const result = Object.entries(groupedData).map(([filterValue, jobTypes]) => ({
      group: { filterType: filterValue },
      jobTypes: Object.entries(jobTypes).map(([jobType, stats]) => ({
        jobType,
        all: stats.all,
        totalStudents: allStudents.length,
        selected: stats.selected,
      })),
      filterCount,
    }));
console.log("result ",result);
    return result;
  }),

  getJobTypePaymentAnalytics: roleProtectedProcedure('superAdmin')
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.$transaction([
        // @ts-ignore
        ctx.db.selectedStudents.groupBy({
          by: "payNumeric",
          _count: {
            payNumeric: true,
          },
          _min: {
            payNumeric: true,
          },
          _max: {
            payNumeric: true,
          },
          where: {
            year: ctx.session.user.year,
            jobType: input,
          },
        }),
        // @ts-ignore
        ctx.db.selectedStudents.groupBy({
          by: "basePay",
          _count: {
            basePay: true,
          },
          _min: {
            basePay: true,
          },
          _max: {
            basePay: true,
          },
          where: {
            year: ctx.session.user.year,
            jobType: input,
          },
        }),
        // @ts-ignore
        ctx.db.selectedStudents.groupBy({
          by: "stipend",
          _count: {
            stipend: true,
          },
          _min: {
            stipend: true,
          },
          _max: {
            stipend: true,
          },
          where: {
            year: ctx.session.user.year,
            jobType: input,
          },
        }),
      ]);
      return data;
    }),
});
