import { Icon } from "@iconify/react";
import searchFill from "@iconify/icons-eva/search-fill";
// material
import { styled, alpha } from "@mui/material/styles";
import {
  Box,
  Input,
  InputAdornment,
  ClickAwayListener,
} from "@mui/material";


// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;

const SearchbarStyle = styled("div")(({ theme }) => ({
  top: 0,
  left: 0,
  zIndex: 99,
  width: "100%",
  display: "flex",
  position: "absolute",
  alignItems: "center",
  height: APPBAR_MOBILE,
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)", // Fix on Mobile
  boxShadow: theme.customShadows.z8,
  backgroundColor: `${alpha(theme.palette.background.default, 1)}`,
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar({ handFilterByTitle }) {
  const handleClose = () => {
    // Implement what should happen when clicking away
    // For example, you might want to clear the search or close the searchbar
  };
  return (
     <ClickAwayListener onClickAway={handleClose}>
      <div>
        <SearchbarStyle>
          <Input
            autoFocus
            fullWidth
            disableUnderline
            onChange={handFilterByTitle}
            placeholder="Search…"
            startAdornment={
              <InputAdornment position="start">
                <Box
                  component={Icon}
                  icon={searchFill}
                  sx={{ color: "text.disabled", width: 20, height: 20 }}
                />
              </InputAdornment>
            }
            sx={{ mr: 1, fontWeight: "fontWeightBold" }}
          />
        </SearchbarStyle>
      </div>
    </ClickAwayListener>
  );
}
