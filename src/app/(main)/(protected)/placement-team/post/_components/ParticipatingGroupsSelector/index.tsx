"use client";

import { useEffect } from "react";
import { CircularProgress, Paper, Typography } from "@mui/material";
import { api } from "~/trpc/react";
import GroupCard from "./GroupCard";
import { useSession } from "next-auth/react";

export default function PostGroupSelector(props: PostGroupsSelectorProps) {
  const { data: yearWisePrograms, isLoading } =
    api.placementConfig.getYearwisePrograms.useQuery();

  const { data: session } = useSession();

  useEffect(() => {
    if (yearWisePrograms && session?.user?.year) {
      const participatingGroups = Object.entries(yearWisePrograms)
        .filter(([yearStr]) => parseInt(yearStr) === session.user.year)
        .flatMap(([yearStr, programs]) =>
          programs.map((program) => ({
            passOutYear: parseInt(yearStr),
            program,
          })),
        );
      props.onChange(participatingGroups);
    }
  }, [yearWisePrograms, session]);

  return (
    <Paper className="flex flex-col gap-4 py-2 px-3">
      <Typography>Eligible student groups:</Typography>
      {!yearWisePrograms || isLoading ? (
        <div className="flex items-center justify-center p-8">
          <CircularProgress />
        </div>
      ) : (
        <div className="grid gap-2 grid-cols-1 md:auto-rows-fr sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
          {props.value.map((group, index) => (
            <GroupCard
              key={index}
              index={index}
              group={group}
              disabled={props.disabled}
              allGroups={Object.fromEntries(
                Object.keys(yearWisePrograms)
                  .filter((key) => {
                    const remainingGroups = props.value.filter(
                      (el, elIdx) =>
                        elIdx !== index && el.passOutYear === Number(key),
                    );
                    return (
                      remainingGroups.length !==
                      yearWisePrograms[Number(key)].length
                    );
                  })
                  .map((key) => [
                    key,
                    yearWisePrograms[Number(key)].filter((batch) => {
                      return !props.value.some(
                        (el, elIdx) =>
                          elIdx !== index &&
                          el.program === batch &&
                          el.passOutYear === Number(key),
                      );
                    }),
                  ]),
              )}
              onDelete={() => {
                props.onChange(props.value.filter((_, i) => i !== index));
              }}
              onChange={(newGroup) => {
                const newValue = [...props.value];
                newValue[index] = newGroup;
                props.onChange(newValue);
              }}
            />
          ))}
        </div>
      )}
    </Paper>
  );
}
