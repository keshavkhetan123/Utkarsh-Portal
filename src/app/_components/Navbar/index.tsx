


"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation"; // ✨ Added usePathname
import { signOut, useSession } from "next-auth/react";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";

import useThemeContext from "~/app/_utils/theme/ThemeContext";

import Logo from "~/assets/logo.svg"; // Default logo
import LandingLogo from "~/assets/logoo.png"; // ✨ New landing logo

import ThemeSwitch from "./ThemeSwitch";
import YearSelector from "./YearSelector";

export default function Navbar({
  setIsDrawerOpen,
  noSidebar,
}: {
  setIsDrawerOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  noSidebar?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname(); // ✨ Get current path

  const { themeMode, toggleTheme } = useThemeContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const sideMenuRef = useRef(null);
  const menuRef = useRef(null);
  const { data: session, status } = useSession();

  const isStudent = useMemo(() => {
    return session?.user.userGroup === "student";
  }, [session?.user]);

  function handleLogout() {
    signOut();
  }

  
  const selectedLogo = pathname === "/" ? LandingLogo.src : Logo.src;

  return (
    <AppBar
      position="sticky"
      className="sticky top-0 bg-none shadow-none"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "bgclear",
        backdropFilter: "blur(8px)",
      }}
    >
      <Toolbar>
        <Container
          maxWidth="xl"
          className="flex flex-row justify-between px-0 items-center"
        >
          {!noSidebar && (
            <IconButton
              aria-label="Sidebar Toggle"
              aria-controls="sidebar-menu"
              size="large"
              color="primary"
              className="md:hidden mr-4"
              onClick={() => setIsDrawerOpen?.((prev) => !prev)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box className="flex flex-row gap-2">
            {/* Mobile Logo */}
            <Image
              src={selectedLogo}
              alt="Logo"
              width={32}
              height={32}
              className="cursor-pointer block md:hidden"
              onClick={() => {
                router.push("/");
              }}
            />
            {/* Desktop Logo */}
            <Image
              src={selectedLogo}
              alt="Logo"
              width={40}
              height={40}
              className="cursor-pointer hidden md:block"
              onClick={() => {
                router.push("/");
              }}
            />
            {/* Title */}
            <Typography
              variant="h1"
              fontFamily={"'Oswald Variable', sans-serif"}
              fontWeight={400}
              color="title"
              className="justify-self-center md:justify-self-start text-2xl block md:hidden cursor-pointer"
              onClick={() => {
                router.push("/");
              }}
            >
             {pathname === "/" ? "Utkarsh-Placement Portal, IIIT Allahabad" : "Utkarsh"}
            </Typography>
            <Typography
              variant="h1"
              fontFamily={"'Oswald Variable', sans-serif"}
              fontWeight={400}
              color="title"
              className="justify-self-center md:justify-self-start text-4xl hidden md:block cursor-pointer"
              onClick={() => {
                router.push("/");
              }}
            >
             {pathname === "/" ? "Utkarsh-Placement Portal, IIIT Allahabad" : "Utkarsh"}
            </Typography>
          </Box>

          {/* Desktop Menu */}
          <div className="flex-row justify-end items-center gap-2 hidden md:flex">
            {status !== "loading" &&
              (session ? (
                <>
                  <YearSelector />
                  <Button
                    color="primary"
                    className="text-lg"
                    endIcon={<ArrowDropDownIcon />}
                    ref={menuRef}
                    aria-controls={menuOpen ? "menu-list" : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? "true" : undefined}
                    onClick={() => setMenuOpen(true)}
                  >
                    {session.user.username}
                  </Button>
                  <Menu
                    slotProps={{
                      paper: {
                        id: "menu-list",
                      },
                    }}
                    anchorEl={menuRef.current}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem>
                      Dark Mode
                      <ThemeSwitch
                        sx={{ ml: 1 }}
                        small="true"
                        checked={themeMode === "dark"}
                        onClick={toggleTheme}
                      />
                    </MenuItem>
                    {isStudent && (
                      <MenuItem
                        onClick={() => {
                          router.push("/dashboard/profile");
                          setMenuOpen(false);
                        }}
                      >
                        My Profile
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                    >
                      Log Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <ThemeSwitch
                    checked={themeMode === "dark"}
                    onClick={toggleTheme}
                  />
                  <Button
                    aria-label="Login Button"
                    variant="outlined"
                    className="normal-case font-semibold tracking-wider border-2"
                    onClick={() => {
                      router.push("/login");
                    }}
                  >
                    Log In
                  </Button>
                </>
              ))}
          </div>

          {/* Mobile Menu */}
          <IconButton
            size="large"
            color="primary"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            ref={sideMenuRef}
            onClick={() => setSideMenuOpen(!sideMenuOpen)}
            className="md:hidden"
            aria-label="User Actions"
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={sideMenuRef.current}
            open={sideMenuOpen}
            onClose={() => setSideMenuOpen(false)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <MenuItem>
              Dark Mode
              <ThemeSwitch
                sx={{ ml: 1 }}
                small="true"
                checked={themeMode === "dark"}
                onClick={toggleTheme}
              />
            </MenuItem>
            {status !== "loading" &&
              (session ? (
                <>
                  {isStudent && (
                    <MenuItem
                      onClick={() => {
                        router.push("/dashboard/profile");
                        setSideMenuOpen(false);
                      }}
                    >
                      My Profile
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => {
                      handleLogout();
                      setSideMenuOpen(false);
                    }}
                  >
                    Log Out
                  </MenuItem>
                </>
              ) : (
                <MenuItem
                  onClick={() => {
                    router.push("/login");
                    setSideMenuOpen(false);
                  }}
                >
                  Log In
                </MenuItem>
              ))}
          </Menu>
        </Container>
      </Toolbar>
    </AppBar>
  );
}

