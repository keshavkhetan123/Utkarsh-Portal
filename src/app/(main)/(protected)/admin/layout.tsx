import { type ReactNode } from "react";
import { redirect } from "next/navigation";

import { Container, Typography } from "@mui/material/index";

import { getServerAuthSession } from "~/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  let session = await getServerAuthSession();
  if (session.user.role.name !== 'superAdmin') {
    redirect("/");
  }
  return <>{children}</>;
}
