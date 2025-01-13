import PropTypes from "prop-types";
// material
import { Box } from "@material-ui/core";
import CSLlogo2 from "../assets/logos/CSLlogo2.png";

// ----------------------------------------------------------------------

Logo.propTypes = {
  sx: PropTypes.object,
};

export default function Logo({ sx }) {
  return (
    <Box
      component="img"
      src={CSLlogo2}
      // src="/static/logo.svg"
      sx={{ width: 90, height: 40, ...sx }}
    />
  );
}
