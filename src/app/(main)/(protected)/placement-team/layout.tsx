import { type ReactNode } from "react";
import { redirect } from "next/navigation";

import { Container, Typography } from "@mui/material/index";

import { getServerAuthSession } from "~/server/auth";

import RequestAdminAccess from "./_components/RequestAdminAcess";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  let session = await getServerAuthSession();
  if (session.user.role.name !== 'PlacementTeamMember') {
    redirect("/");
  }
  return <>{children}</>;
}
