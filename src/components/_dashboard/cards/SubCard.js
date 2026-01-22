import React, { forwardRef } from "react";
import PropTypes from "prop-types";
// material
import { useTheme } from "@mui/material/styles";
import {
  // Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material";

// ==============================|| CUSTOM SUB CARD ||============================== //

const SubCard = forwardRef(
  (
    {
      children,
      content,
      contentClass,
      darkTitle,
      divider,
      secondary,
      sx,
      title,
      ...others
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <Card
        ref={ref}
        sx={{
          border: "1px solid",
          borderColor:
            theme.palette.mode === "dark"
              ? theme.palette.divider
              : theme.palette.grey[300],
          borderRadius: 2,
          boxShadow: theme.customShadows.z1,
          overflow: "hidden",
          position: "relative",
          transition: "all .2s ease-in-out",
          "&:hover": {
            boxShadow: theme.customShadows.z8,
            transform: "translateY(-5px)",
          },
          ...sx,
        }}
        {...others}
      >
        {/* card header and action */}
        {!darkTitle && title && (
          <CardHeader
            sx={{
              p: 2.5,
              "& .MuiCardHeader-action": { m: "0px auto", alignSelf: "center" },
            }}
            titleTypographyProps={{ variant: "h6" }}
            title={title}
            action={secondary}
          />
        )}
        {darkTitle && title && (
          <CardHeader
            sx={{
              p: 2.5,
              backgroundColor: theme.palette.primary.light,
              "& .MuiCardHeader-title": {
                color: theme.palette.background.paper,
              },
            }}
            title={
              <Typography variant="h5" fontWeight="600">
                {title}
              </Typography>
            }
            action={secondary}
          />
        )}

        {/* content & header divider */}
        {title && divider && <Divider sx={{ opacity: 0.5 }} />}

        {/* card content */}
        {content && (
          <CardContent
            sx={{
              p: 2.5,
              pt: title ? 1 : 2.5,
              pb: "20px !important", // to override the default padding bottom
            }}
            className={contentClass || ""}
          >
            {children}
          </CardContent>
        )}
        {!content && children}
      </Card>
    );
  }
);

SubCard.propTypes = {
  children: PropTypes.node,
  content: PropTypes.bool,
  contentClass: PropTypes.string,
  darkTitle: PropTypes.bool,
  divider: PropTypes.bool,
  secondary: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.object,
  ]),
  sx: PropTypes.object,
  title: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.string,
    PropTypes.object,
  ]),
};

SubCard.defaultProps = {
  content: true,
  divider: true,
};

export default SubCard;
