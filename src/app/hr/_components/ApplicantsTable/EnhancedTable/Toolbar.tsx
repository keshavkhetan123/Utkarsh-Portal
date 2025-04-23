"use client";

import { useCallback, useMemo, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import SwipeLeftAltIcon from "@mui/icons-material/SwipeLeftAlt";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  alpha,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import { api } from "~/trpc/react";

import { STATUS_ORDER } from "./constants";
import { type BasicStudentDetails, type DataColumn } from "./types";
interface EnhancedTableToolbarProps {
  isDownloadLoading: boolean;
  handleDownload: () => void;
  columns: string[];
  query: string;
  setQuery: (q: string) => void;
  allColumns: DataColumn[];
  setColumns: (cols: string[]) => void;
}

export default function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const utils = api.useUtils();

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const [columnSelectAnchorEl, setColumnSelectAnchorEl] =
    useState<null | HTMLElement>(null);
  const openColumnSelect = Boolean(columnSelectAnchorEl);
  const handleOpenColumnSelect = (event: React.MouseEvent<HTMLElement>) => {
    setColumnSelectAnchorEl(event.currentTarget);
  };

  const upgradeStatusMutation = api.jobApplication.upgradeStatus.useMutation({
    onSuccess: () => {
      utils.jobApplication.getJobApplicants.invalidate();
      setIsUpgradeOpen(false);
      setIsRejectOpen(false);
    },
  });

  const handleClose = () => {
    setColumnSelectAnchorEl(null);
  };

  const handleMenuItemClick = (column: string) => {
    const index = props.columns.indexOf(column);
    const newColumns = [...props.columns];
    if (index === -1) {
      newColumns.push(column);
    } else {
      newColumns.splice(index, 1);
    }
    props.setColumns(newColumns);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      
    <Typography
      sx={{ flex: "1 1 100%" }}
      variant="h6"
      id="tableTitle"
      component="div"
    >
      Applications
    </Typography>
      
      
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <SearchIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
        <TextField
          size="small"
          variant="standard"
          value={props.query}
          onChange={(e) => props.setQuery(e.target.value)}
          placeholder="Search student"
          className="min-w-48"
        />
      </Box>
      <Tooltip title="Download all applications">
        <IconButton onClick={props.handleDownload}>
          {props.isDownloadLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <FileDownloadIcon />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="Filter list">
        <IconButton onClick={handleOpenColumnSelect}>
          <FilterListIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="lock-menu"
        anchorEl={columnSelectAnchorEl}
        open={openColumnSelect}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
        slotProps={{
          paper: {
            style: {
              maxHeight: 400,
            },
          },
        }}
      >
        {props.allColumns.map((col, index) => (
          <MenuItem
            key={index}
            selected={props.columns.find((c) => c === col.id) !== undefined}
            onClick={() => handleMenuItemClick(col.id)}
          >
            <ListItemIcon>
              <Checkbox
                checked={
                  props.columns.find((c) => c === col.id) !== undefined
                }
                onChange={() => handleMenuItemClick(col.id)}
              />
            </ListItemIcon>
            <Typography noWrap>{col.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
    
    </Toolbar>
  );
}
