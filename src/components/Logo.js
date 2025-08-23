import PropTypes from "prop-types";
// material
import { Box } from "@mui/material";
import CSLlogo1 from "../assets/logos/CSLlogo1.png";

// ----------------------------------------------------------------------

Logo.propTypes = {
  sx: PropTypes.object,
};

export default function Logo({ sx }) {
  return (
    <Box
      component="img"
      src={CSLlogo1}
      // src="/static/logo.svg"
      sx={{
        width: 240,
        height: 60,
        ...sx,
      }}
    />
  );
}
