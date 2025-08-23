import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import downloadFill from "@iconify/icons-eva/download-fill";
import { PDFDownloadLink } from "@react-pdf/renderer";
// material
import { Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
//
import InvoicePDF from "./InvoicePDF";

InvoiceToolbar.propTypes = {
  invoice: PropTypes.object.isRequired,
};

export default function InvoiceToolbar({ invoice }) {
  return (
    <>
      <Stack
        mb={5}
        spacing={1.5}
        sx={{
          flexDirection: "row",
          justifyContent: "flex-end",
          "@media (max-width: 1200px)": {
            justifyContent: "center",
          },
        }}
      >
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoice} />}
          fileName={`CSL-Invoice-${invoice._id}`}
          style={{ textDecoration: "none" }}
        >
          {({ loading }) => (
            <LoadingButton
              size="small"
              variant="contained"
              loadingPosition="end"
              endIcon={<Icon icon={downloadFill} />}
            >
              Download
            </LoadingButton>
          )}
        </PDFDownloadLink>
      </Stack>
    </>
  );
}
