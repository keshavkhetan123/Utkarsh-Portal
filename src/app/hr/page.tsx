"use client";
import { api } from "~/trpc/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function JobOpeningsPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const decodedToken = decodeURIComponent(token || "")
    .replace(/ /g, "+")
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const { data: openings, isLoading } = api.jobOpenings.hrGetJobOpenings.useQuery({ token });

  useEffect(() => {
    if (isLoading) return;

    if (openings !== undefined && openings !== null && openings.data !== undefined && openings.data !== null && openings.data.length > 0) {
      redirect("./hr/" + openings.data[0].id + "/?token=" + decodedToken);
    }
    else{
      redirect("./hr/new?token=" + decodedToken)
    }

  }, [openings, decodedToken]);

  return null;
}
