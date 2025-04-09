"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import { api } from "~/trpc/react";

import PDFViewer from "./PdfViewer";

export default function NOCCard(props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const router = useRouter();
  console.log("link" + props.src);

//   const deleteNOCMutation = api.studentResume.deleteStudentNOC.useMutation({
//     onSuccess: () => {
//       setAnchorEl(null);
//       setDialogOpen(false);
//       router.refresh();
//     },
//   });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card>
      <Link href={props.src} target="_blank">
        <CardMedia className="w-[25%]">
          <PDFViewer file={props.src} />
        </CardMedia>
      </Link>

      <CardContent className="flex flex-row justify-between">
        <Link href={props.src} target="_blank" className="w-[85%]">
          <div className="flex flex-col w-full">
            <Typography component="div" className="w-full" variant="h6">
              NOC
            </Typography>
          </div>
        </Link>
        {/* <div className="-mr-2 -mt-1">
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              onClick={() => {
                setDialogOpen(true);
                handleClose();
              }}
            >
              Delete
            </MenuItem>
          </Menu>
        </div> */}
      </CardContent>

      {/* <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          component: "form",
          onSubmit: (e) => {
            e.preventDefault();
            deleteNOCMutation.mutate(props.id);
          },
        }}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          You will be deleting your NOC with name <strong>{props.name}</strong>.
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            color="error"
            variant="outlined"
            loading={deleteNOCMutation.isLoading}
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog> */}
    </Card>
  );
}
