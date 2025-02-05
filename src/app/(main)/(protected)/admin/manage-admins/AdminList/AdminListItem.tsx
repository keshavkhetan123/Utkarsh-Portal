"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TableCell,
  TableRow,
  Select,
  MenuItem,
} from "@mui/material";

import { api } from "~/trpc/react";
import { type api as API } from "~/trpc/server";

type admins = ReturnType<typeof API.admin.getAdmins.query> extends Promise<infer T>
  ? T
  : never;

interface AdminListItemProps {
  admin: admins[number];
  index: number;
}

export default function AdminListItem({ admin, index }: AdminListItemProps) {
  // For the old remove functionality
  const [open, setOpen] = useState(false);
  // For the new role update confirmation
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "PlacementCoreTeam" | "PlacementTeamMember" | "student" | null
  >(null);

  const router = useRouter();
  const updateUserPermissionMutation = api.admin.updateUserPermission.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });
  // The removeAdminMutation is kept commented for reference
  /*
  const removeAdminMutation = api.admin.removeAdmin.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });
  */
  return (
    <TableRow key={index} hover>
      <TableCell style={{ width: 10 }}>{index + 1}</TableCell>
      <TableCell className="uppercase text-center whitespace-nowrap">
        {admin.username}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {admin.name}
      </TableCell>
      <TableCell className="text-center capitalize whitespace-nowrap">
        {admin.userGroup}
      </TableCell>
      <TableCell className="text-center whitespace-nowrap">
        {admin.role.name.toUpperCase()}
      </TableCell>

      {/* Original Remove Admin Cell (kept as a comment) */}
      {/*
      <TableCell className="text-center whitespace-nowrap">
        <Button color="error" variant="outlined" onClick={() => setOpen(true)}>
          Remove
        </Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            component: "form",
            onSubmit: (e) => {
              e.preventDefault();
              removeAdminMutation.mutate(admin.id);
            },
          }}
        >
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            You will be removing admin privileges from{" "}
            <strong>
              {admin.name + " (" + admin.username.toUpperCase() + ")"}
            </strong>
            .
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setOpen(false)} variant="contained">
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              color="error"
              variant="outlined"
              loading={removeAdminMutation.isLoading}
            >
              Remove
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </TableCell>
      */}

      {/* New Dropdown for updating the user's role with confirmation */}
      <TableCell className="text-center whitespace-nowrap">
        <Select
          value={admin.role.name}
          onChange={(e) => {
            const newRole = e.target.value as "PlacementCoreTeam" | "PlacementTeamMember" | "student";
            setSelectedRole(newRole);
            setOpenConfirm(true);
          }}
          displayEmpty
          size="small"
        >
          <MenuItem value="PlacementCoreTeam">PlacementCoreTeam</MenuItem>
          <MenuItem value="PlacementTeamMember">PlacementTeamMember</MenuItem>
          <MenuItem value="student">student</MenuItem>
        </Select>

        <Dialog
          open={openConfirm}
          onClose={() => setOpenConfirm(false)}
          PaperProps={{
            component: "form",
            onSubmit: (e) => {
              e.preventDefault();
              if (selectedRole) {
                updateUserPermissionMutation.mutate({ id: admin.id, role: selectedRole });
              }
              setOpenConfirm(false);
            },
          }}
        >
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogContent>
            {`You are about to change permissions for ${admin.username} to "${selectedRole}".`}
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={() => setOpenConfirm(false)} variant="contained">
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              color="error"
              variant="outlined"
              loading={updateUserPermissionMutation.isLoading}
            >
              Confirm
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
