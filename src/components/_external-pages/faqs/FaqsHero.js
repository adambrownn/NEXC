import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import searchFill from "@iconify/icons-eva/search-fill";
// material
import { experimentalStyled as styled } from "@mui/material/styles";
import {
  Box,
  alpha,
  Container,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
//
import { TextAnimate, varWrapEnter } from "../../animate";

// ----------------------------------------------------------------------

const RootStyle = styled(motion.div)(({ theme }) => ({
  backgroundColor: "#1B2129",
  padding: theme.spacing(10, 0),
  [theme.breakpoints.up("md")]: {
    height: 560,
    padding: 0,
  },
}));

const ContentStyle = styled("div")(({ theme }) => ({
  textAlign: "center",
  [theme.breakpoints.up("md")]: {
    textAlign: "left",
    position: "absolute",
    bottom: theme.spacing(10),
  },
}));

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 320,
  color: theme.palette.common.white,
  transition: theme.transitions.create(["box-shadow", "width"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  "&.Mui-focused": {
    backgroundColor: alpha(theme.palette.common.white, 0.04),
    [theme.breakpoints.up("md")]: {
      width: 480,
    },
  },
  "& fieldset": {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

// ----------------------------------------------------------------------

export default function FaqsHero() {
  return (
    <RootStyle initial="initial" animate="animate" variants={varWrapEnter}>
      <Container maxWidth="lg" sx={{ position: "relative", height: "100%" }}>
        <ContentStyle>
          <TextAnimate text="How" sx={{ color: "primary.main" }} />
          <br />
          <Box sx={{ display: "inline-flex", color: "common.white" }}>
            <TextAnimate text="can" sx={{ mr: 2 }} />
            <TextAnimate text="we" sx={{ mr: 2 }} />
            <TextAnimate text="help" sx={{ mr: 2 }} />
            <TextAnimate text="you?" />
          </Box>
          <div sx={{ mt: 5 }}>
            <SearchStyle
              placeholder="Search support"
              startAdornment={
                <InputAdornment position="start">
                  <Box
                    component={Icon}
                    icon={searchFill}
                    sx={{ color: "text.disabled" }}
                  />
                </InputAdornment>
              }
            />
          </div>
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
