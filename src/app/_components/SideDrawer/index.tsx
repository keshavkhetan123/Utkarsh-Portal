// "use client";

// import { Fragment } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useSession } from "next-auth/react";

// import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
// import {
//   Box,
//   Divider,
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   ListSubheader,
//   SwipeableDrawer,
//   Toolbar,
//   Typography,
// } from "@mui/material/index";

// import { ADMIN_SIDEBAR } from "./AdminDrawer/constants";
// import { USER_SIDEBAR } from "./UserDrawer/constants";

// interface ResponsiveDrawerProps {
//   open: boolean;
//   setOpen: (open: boolean) => void;
//   isAdmin: boolean;
// }

// const DRAWER_WIDTH = 240;

// export default function ResponsiveDrawer({
//   open,
//   setOpen,
//   isAdmin,
// }: ResponsiveDrawerProps) {
//   const { data: session } = useSession();
//   const pathname = usePathname();

//   const handleDrawerToggle = () => {
//     setOpen(!open);
//   };

//   if (!session) return null;
//   const { user } = session;

//   const drawer = (
//     <div id="sidebar-menu">
//       <Toolbar>
//         <Typography
//           variant="h2"
//           className="w-full text-xl text-center"
//           color="primary"
//         >
//           {isAdmin ? "Admin" : "Dashboard"}
//         </Typography>
//       </Toolbar>
//       <Divider />
//       {!(isAdmin && user.role.name !== "superAdmin") &&
//         (isAdmin ? ADMIN_SIDEBAR : USER_SIDEBAR).map((list, index) => {
//           return (
//             <Fragment key={index}>
//               <List>
//                 {list.title && (
//                   <ListSubheader disableSticky>{list.title}</ListSubheader>
//                 )}
//                 {list.links.map((item) => (
//                   <Link
//                     key={item.label}
//                     href={list.base + item.path}
//                     onClick={() => setOpen(false)}
//                   >
//                     <ListItem disablePadding>
//                       <ListItemButton
//                         selected={pathname === list.base + item.path}
//                       >
//                         <ListItemIcon>
//                           <item.icon
//                             color={
//                               pathname === list.base + item.path
//                                 ? "primary"
//                                 : undefined
//                             }
//                           />
//                         </ListItemIcon>
//                         <ListItemText
//                           primary={item.label}
//                           primaryTypographyProps={{
//                             color:
//                               pathname === list.base + item.path
//                                 ? "primary"
//                                 : undefined,
//                           }}
//                         />
//                       </ListItemButton>
//                     </ListItem>
//                   </Link>
//                 ))}
//               </List>
//               <Divider />
//             </Fragment>
//           );
//         })}
//       {user?.role &&
//   (user.role.name === "superAdmin" ? (
//     !isAdmin && (
//       <Link href="/admin" onClick={() => setOpen(false)}>
//         <ListItemButton>
//           <ListItemIcon>
//             <VerifiedUserIcon />
//           </ListItemIcon>
//           <ListItemText primary={"Admin Panel"} />
//         </ListItemButton>
//       </Link>
//     )
//   ) : (
//     !isAdmin && (
//       <Link href="/dashboard" onClick={() => setOpen(false)}>
//         <ListItemButton>
//           <ListItemIcon>
//             <AccountCircleIcon />
//           </ListItemIcon>
//           <ListItemText primary={"User Panel"} />
//         </ListItemButton>
//       </Link>
//     )
//   ))}

//     </div>
//   );

//   return (
//     <Box
//       component="nav"
//       className={`w-0 md:w-[240px] flex-shrink md:flex-shrink-0 h-dvh`}
//       aria-label="mailbox folders"
//     >
//       <SwipeableDrawer
//         variant="temporary"
//         open={open}
//         onClose={handleDrawerToggle}
//         onOpen={handleDrawerToggle}
//         ModalProps={{
//           keepMounted: false,
//         }}
//         color="background"
//         sx={{
//           "& .MuiDrawer-paper": {
//             boxSizing: "border-box",
//             width: DRAWER_WIDTH,
//             backgroundImage: "none",
//           },
//         }}
//         className="md:hidden block"
//       >
//         {drawer}
//       </SwipeableDrawer>
//       <Drawer
//         variant="permanent"
//         sx={{
//           "& .MuiDrawer-paper": {
//             boxSizing: "border-box",
//             width: DRAWER_WIDTH,
//           },
//         }}
//         className="md:block hidden"
//       >
//         {drawer}
//       </Drawer>
//     </Box>
//   );
// }



"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  SwipeableDrawer,
  Toolbar,
  Typography,
} from "@mui/material/index";

import { ADMIN_SIDEBAR } from "./AdminDrawer/constants";
import { USER_SIDEBAR } from "./UserDrawer/constants";
import { PLACEMENT_CORE_SIDEBAR } from "./PlacementCore/constants";
import { PL_TEAM } from "./PlacementTeam/constants";

interface ResponsiveDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  isAdmin: boolean;
}

const DRAWER_WIDTH = 240;

export default function ResponsiveDrawer({
  open,
  setOpen,
  isAdmin,
}: ResponsiveDrawerProps) {
  const { data: session, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Only fetch passOutYear for student users
  const { data: passOutYear, isLoading: isYearLoading } =
    api.student.getStudentPassOutYear.useQuery(undefined, {
      enabled: session?.user?.role.name === "PlacementCoreTeam" || session?.user?.role.name==="PlacementTeamMember",
  });

  if (!session) return null;
  const { user } = session;
  // Determine the sidebar to show based on the user role
  const getSidebar = () => {
    if (isAdmin) return ADMIN_SIDEBAR;
    if (user.role.name === "PlacementCoreTeam" && pathname.includes('placement-core')){
        return PLACEMENT_CORE_SIDEBAR;
    }
    if (user.role.name === "PlacementTeamMember" && pathname.includes('placement-team')) return PL_TEAM;
    return USER_SIDEBAR;
  };

  // Dynamic title based on role
  const getTitle = () => {
    if (isAdmin) return "Admin";
    if (user.role.name === "PlacementCoreTeam") return "Placement Core";
    if (user.role.name === "PlacementTeamMember") return "Placement Team";
    return "Student";
  };

   // When the user clicks "Student Panel", set their session.year to passOutYear, then go to /dashboard
  const goToStudentPanel = async () => {
    if (passOutYear) {
     await update({ info: { year: passOutYear } });
    }
    router.push("/dashboard");
    setOpen(false);
  };

  const drawer = (
    <div id="sidebar-menu">
      <Toolbar>
        <Typography
          variant="h2"
          className="w-full text-xl text-center"
          color="primary"
        >
          {getTitle()}
        </Typography>
      </Toolbar>
      <Divider />
      {/* Render the correct sidebar based on role */}
      {getSidebar().map((list, index) => (
        <Fragment key={index}>
          <List>
            {list.title && (
              <ListSubheader disableSticky>{list.title}</ListSubheader>
            )}
            {list.links.map((item) => (
              <Link
                key={item.label}
                href={list.base + item.path}
                onClick={() => setOpen(false)}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    selected={pathname === list.base + item.path}
                  >
                    <ListItemIcon>
                      <item.icon
                        color={
                          pathname === list.base + item.path
                            ? "primary"
                            : undefined
                        }
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        color:
                          pathname === list.base + item.path
                            ? "primary"
                            : undefined,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Link>
            ))}
          </List>
          <Divider />
        </Fragment>
      ))}

  {user?.role && (
  <>
    {user.role.name === "superAdmin" && !isAdmin && (
      <Link href="/admin" onClick={() => setOpen(false)}>
        <ListItemButton>
          <ListItemIcon>
            <VerifiedUserIcon />
          </ListItemIcon>
          <ListItemText primary={"Admin Panel"} />
        </ListItemButton>
      </Link>
    )}

    {user.role.name === "PlacementCoreTeam" && (
      pathname.includes('/dashboard') ? (
      <Link href="/placement-core" onClick={() => setOpen(false)}>
        <ListItemButton>
          <ListItemIcon>
            <VerifiedUserIcon />
          </ListItemIcon>
          <ListItemText primary={"Placement Core Panel"} />
        </ListItemButton>
      </Link>
      ) : (
      <ListItemButton onClick={goToStudentPanel} disabled={isYearLoading}>
        <ListItemIcon><VerifiedUserIcon /></ListItemIcon>
        <ListItemText primary={"Student Panel"} />
      </ListItemButton>
    ))}

    {user.role.name === "PlacementTeamMember" && (
      pathname.includes('/dashboard') ? (
        <Link href="/placement-team" onClick={() => setOpen(false)}>
          <ListItemButton>
            <ListItemIcon>
            <VerifiedUserIcon />
            </ListItemIcon>
            <ListItemText primary={"Placement Team Panel"} />
          </ListItemButton>
        </Link>
      ) : (
        <ListItemButton onClick={goToStudentPanel} disabled={isYearLoading}>
          <ListItemIcon><VerifiedUserIcon /></ListItemIcon>
          <ListItemText primary={"Student Panel"} />
        </ListItemButton>
      )
    )}

    {user.role.name === "student" && (
      <Link href="/dashboard" onClick={() => setOpen(false)}>
        <ListItemButton>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary={"User Panel"} />
        </ListItemButton>
      </Link>
    )}
  </>
)} 

    </div>
  );

  return (
    <Box
      component="nav"
      className={`w-0 md:w-[240px] flex-shrink md:flex-shrink-0 h-dvh`}
      aria-label="mailbox folders"
    >
      <SwipeableDrawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        onOpen={handleDrawerToggle}
        ModalProps={{
          keepMounted: false,
        }}
        color="background"
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            backgroundImage: "none",
          },
        }}
        className="md:hidden block"
      >
        {drawer}
      </SwipeableDrawer>
      <Drawer
        variant="permanent"
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
          },
        }}
        className="md:block hidden"
      >
        {drawer}
      </Drawer>
    </Box>
  );
}


