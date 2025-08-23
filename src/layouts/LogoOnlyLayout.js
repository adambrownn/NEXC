import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink, Outlet } from "react-router-dom";
// material
// material
import { Box, Container, Typography } from "@mui/material";
// components
import Logo from "../components/Logo";
import { styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

const HeaderStyle = styled("header")(({ theme }) => ({
  top: 0,
  left: 0,
  lineHeight: 0,
  position: "absolute",
  padding: theme.spacing(3, 3, 0),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(5, 5, 0),
  },
}));

// ----------------------------------------------------------------------

export default function LogoOnlyLayout() {
  return (
    <>
      <HeaderStyle>
        <RouterLink to="/">
          <Logo />
        </RouterLink>
      </HeaderStyle>
      <Outlet />
      <Box
        sx={{
          py: 5,
          textAlign: "center",
          position: "relative",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="lg">
          <ScrollLink to="move_top" spy smooth>
            <Logo sx={{ mb: 1, mx: "auto", cursor: "pointer" }} />
          </ScrollLink>

          <Typography variant="caption" component="p">
            © 2010 - 2025{" "}
            <RouterLink to="https://nexc.co.uk/">
              <strong>www.nexc.co.uk</strong>
            </RouterLink>{" "}
            All Rights Reserved
          </Typography>
        </Container>
      </Box>
    </>
  );
}
