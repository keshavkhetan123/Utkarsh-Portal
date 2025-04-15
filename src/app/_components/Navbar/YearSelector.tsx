"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import { api } from "~/trpc/react";

export default function YearSelector() {
  const pathname = usePathname();

  const utils = api.useUtils();

  // const { data, isLoading } =
  //   api.placementConfig.getStudentPlacementYears.useQuery();

  const { data: session, update } = useSession();

  const data = (session?.user?.role.name !== "superAdmin")
    ? session?.user?.year
      ? [session.user.year]
      : []
    : undefined;
  
  const isLoading = false;
  

  const { data: adminYears, isLoading: isAdminYearsLoading } =
    api.placementConfig.getAdminPlacementYears.useQuery(null, {
      enabled: ((session?.user?.role.name === "superAdmin" && pathname.includes("/admin")) || (session?.user?.role.name === 'PlacementCoreTeam' && pathname.includes("/placement-core")) || (session?.user?.role.name === 'PlacementTeamMember' && pathname.includes("/placement-team"))),
    });

    const role = session?.user?.role.name;

    const isAdminView = role === "superAdmin" && pathname.includes("/admin");
    const isCoreView = role === "PlacementCoreTeam" && pathname.includes("/placement-core");
    const isTeamView = role === "PlacementTeamMember" && pathname.includes("/placement-team");

    const yearsToDisplay =
      isAdminView || isCoreView || isTeamView ? adminYears : data;

  const changeYear = useCallback(
    (year: number) => {
      async function updateYear() {
        await update({
          info: {
            year,
          },
        });

        utils.jobOpenings.invalidate();
      }
      updateYear();
    },
    [update],
  );

  const isYearSelectorDisabled = () => {
    const role = session?.user?.role.name;
    if (role === "superAdmin") return !pathname.includes("/admin");
    if (role === "PlacementCoreTeam") return !pathname.includes("/placement-core");
    if (role === "PlacementTeamMember") return !pathname.includes("/placement-team");
    return true; // disable for all other roles
  };
  

  if (data && data.length == 0) {
    return <></>
  }

  // if (!(session?.user?.role.name === "superAdmin") || (!pathname.includes("/admin") && !isLoading)) {
  //   if (data && !data.includes(session?.user?.year)) {
  //     changeYear(data[0]);
  //   }
  // }

  if (
    !session?.user?.year ||
    isLoading ||
    ((session?.user?.role.name === "superAdmin") &&
      pathname.includes("/admin") &&
      isAdminYearsLoading)
  )
    return <></>;

  return (
    <>
      <FormControl
        size="small"
        disabled={isYearSelectorDisabled()}
      >
        <InputLabel>Year</InputLabel>
        <Select
        color="primary"
        value={Number(session.user.year)}
        label="Age"
        onChange={(e) => changeYear(parseInt(e.target.value.toString()))}
        >
        {yearsToDisplay?.map((el) => (
          <MenuItem key={el} value={Number(el)}>
            {el}
          </MenuItem>
        ))}
      </Select>

      </FormControl>
    </>
  );
}