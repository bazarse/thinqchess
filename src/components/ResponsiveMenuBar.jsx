"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  useMediaQuery,
  Slide,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Courses", href: "/curriculam" },
  { label: "Registration", href: "/registration" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blogs", href: "/blogs" },
  // { label: "Career", href: "/#" },
  { label: "About us", href: "/our-story" },
];

function MenuContent({ mobile = false, onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogin = () => {
    window.location.href = "https://lms.thinqchess.com";
  };
  return (
    <>
      {/* Top Nav */}
      <header className="bg-[#2B3AA0] md:px-4 overflow-hidden sticky top-0 z-50">
        <div className="flex items-center w-11/12 max-md:w-full mx-auto gap-4 md:justify-end justify-center md:px-4 px-2 md:py-[2px] py-1">
          <div className="flex items-center gap-2">
            <a href="mailto:admin@thinqchess.com">
              <img src="/images/email.png" className="w-[16px]" />
            </a>
            <a
              className="text-[14px] max-md:text-[12px] mt-[-2px] font-[500] text-[#FFB31A]"
              href="mailto:admin@thinqchess.com"
            >
              admin@thinqchess.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a href="tel:+91 7975820187">
              <img src="/images/phone.png" className="w-[16px]" />
            </a>
            <a
              className="text-[14px] font-[500] text-[#FFB31A] max-md:text-[12px]"
              href="tel:+91 7975820187"
            >
              +91 7975820187
            </a>
          </div>
          {/* <div className="flex gap-3">
            <a href="#">
              <img src="/images/facebook.png" className="w-[16px]" />
            </a>
            <a href="https://www.instagram.com/thinqchess/" target="_blank">
              <img src="/images/instagram.png" className="w-[16px]" />
            </a>
            <a href="#">
              <img src="/images/linkedin.png" className="w-[16px]" />
            </a>
            <a href="#">
              <img src="/images/youtube.png" className="w-[16px]" />
            </a>
          </div> */}
        </div>
      </header>

      <Toolbar
        sx={{
          px: { xs: 1, md: 4 },
          py: 1,
          justifyContent: "space-between",
        }}
      >
        {/* Logo on the left */}
        <Box>
          <Link href="/">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="md:h-[60px] h-[50px]"
            />
          </Link>
        </Box>

        {/* Center Nav (Desktop Only) */}
        {!mobile && (
          <Box
            sx={{ display: "flex", justifyContent: "center", flex: 1, gap: 2 }}
          >
            {menuItems.map((item, index) => (
              <Button
                key={index}
                component={Link}
                href={item.href}
                sx={{
                  color: pathname === item.href ? "#FFB31A" : "black",
                  fontWeight: pathname === item.href ? 700 : 500,
                  "&:hover": { color: "#FFB31A" },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Right Side Buttons or Hamburger */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!mobile ? (
            <>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FFB31A",
                  "&:hover": {
                    background: "linear-gradient(to right, #fed687, #FFB31A)",
                  },
                }}
              >
                <Link href="/book-a-demo">Book a Demo</Link>
              </Button>
              <a href="https://lms.thinqchess.com">
                <Button
                  variant="contained"
                  onClick={handleLogin}
                  sx={{
                    backgroundColor: "#2B3AA0",
                    "&:hover": {
                      background: "linear-gradient(to right, #7a86d8, #2B3AA0)",
                    },
                  }}
                >
                  Log in
                </Button>
              </a>
            </>
          ) : (
            <IconButton onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </>
  );
}

function FixedNavbar({ isMobile, onMenuClick }) {
  return (
    <AppBar
      position="fixed"
      elevation={4}
      sx={{
        backgroundColor: "white",
        transition: "all 0.3s ease",
        zIndex: 1300,
      }}
    >
      <MenuContent mobile={isMobile} onMenuClick={onMenuClick} />
    </AppBar>
  );
}

// FIXED NAVBAR
export default function ResponsiveMenuBar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  const router = useRouter();

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleLogin = () => {
    toggleDrawer(false);
    window.location.href = "https://lms.thinqchess.com";
  };

  const pathname = usePathname();

  return (
    <>
      {/* Fixed Navbar on scroll */}
      <FixedNavbar isMobile={isMobile} onMenuClick={toggleDrawer(true)} />

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, p: 2 }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem
                key={index}
                component={NextLink}
                href={item.href}
                onClick={toggleDrawer(false)}
                sx={{
                  color: pathname === item.href ? "#FFB31A" : "black",
                  fontWeight: pathname === item.href ? 700 : 500,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>

          <Button
            fullWidth
            variant="contained"
            onClick={toggleDrawer(false)}
            sx={{
              my: 1,
              backgroundColor: "#FFB31A",
              "&:hover": {
                background: "linear-gradient(to right, #fed687, #FFB31A)",
              },
            }}
          >
            <Link href="/book-a-demo">Book a Demo</Link>
          </Button>
          <a href="https://lms.thinqchess.com">
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              sx={{
                backgroundColor: "#2B3AA0",
                "&:hover": {
                  background: "linear-gradient(to right, #7a86d8, #2B3AA0)",
                },
              }}
            >
              Log in
            </Button>
          </a>
        </Box>
      </Drawer>
    </>
  );
}

// NAVBAR WITH ONSCROLL STICKY TO FIXED ANIMATION
// export default function ResponsiveMenuBar() {
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const isMobile = useMediaQuery("(max-width:768px)");
//   const [showFixedNavbar, setShowFixedNavbar] = useState(false);

//   const router = useRouter();

//   const handleLogin = () => {
//     toggleDrawer(false);
//     router.push("/training");
//   };

//   useEffect(() => {
//     const handleScroll = () => {
//       setShowFixedNavbar(window.scrollY > 300);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const toggleDrawer = (open) => () => setDrawerOpen(open);

//   const pathname = usePathname();

//   return (
//     <>
//       {/* Default sticky navbar */}
//       <Box
//         sx={{
//           position: "relative",
//           zIndex: showFixedNavbar ? 0 : 1000,
//           opacity: showFixedNavbar ? 0 : 1,
//           transition: "opacity 0.3s ease",
//         }}
//       >
//       <MenuContent mobile={isMobile} onMenuClick={toggleDrawer(true)} />
//       </Box>

//       {/* Fixed Navbar on scroll */}
//       <Slide appear={false} direction="down" in={showFixedNavbar}>
//         <div>
//       <FixedNavbar isMobile={isMobile} onMenuClick={toggleDrawer(true)} />
//       </div>
//       </Slide>

//       {/* Mobile Drawer */}
//       <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
//         <Box sx={{ width: 250, p: 2 }}>
//           <List>
//             {menuItems.map((item, index) => (
//               <ListItem
//                 key={index}
//                 component={NextLink}
//                 href={item.href}
//                 onClick={toggleDrawer(false)}
//                 sx={{
//                   color: pathname === item.href ? "#FFB31A" : "black",
//                   fontWeight: pathname === item.href ? 700 : 500,
//                   cursor: "pointer",
//                   "&:hover": {
//                     backgroundColor: "#f0f0f0",
//                   },
//                 }}
//               >
//                 <ListItemText primary={item.label} />
//               </ListItem>
//             ))}
//           </List>

//           <Button
//             fullWidth
//             variant="contained"
//             onClick={toggleDrawer(false)}
//             sx={{
//               my: 1,
//               backgroundColor: "#FFB31A",
//               "&:hover": {
//                 background: "linear-gradient(to right, #fed687, #FFB31A)",
//               },
//             }}
//           >
//             <Link href="/contact-us">Book a Demo</Link>
//           </Button>
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={handleLogin}
//             sx={{
//               backgroundColor: "#2B3AA0",
//               "&:hover": {
//                 background: "linear-gradient(to right, #7a86d8, #2B3AA0)",
//               },
//             }}
//           >
//             Log in
//           </Button>
//         </Box>
//       </Drawer>
//     </>
//   );
// }
