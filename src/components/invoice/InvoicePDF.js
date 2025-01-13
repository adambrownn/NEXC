import PropTypes from "prop-types";
import {
  Page,
  View,
  Text,
  Font,
  Image,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { payStatus, poundSymbol } from "../../utils/constant";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf" },
    { src: "/fonts/Roboto-Bold.ttf" },
  ],
});

const styles = StyleSheet.create({
  col4: { width: "45%" },
  col8: { width: "55%" },
  col6: { width: "50%" },
  mb8: { marginBottom: 8 },
  mb40: { marginBottom: 40 },
  overline: {
    fontSize: 8,
    marginBottom: 8,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  h3: { fontSize: 16, fontWeight: 700 },
  h4: { fontSize: 13, fontWeight: 700 },
  body1: { fontSize: 10 },
  subtitle2: { fontSize: 9, fontWeight: 700 },
  alignRight: { textAlign: "right" },
  page: {
    padding: "40px 24px 0 24px",
    fontSize: 9,
    lineHeight: 1.6,
    fontFamily: "Roboto",
    backgroundColor: "#fff",
    textTransform: "capitalize",
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    margin: "auto",
    borderTopWidth: 1,
    borderStyle: "solid",
    position: "absolute",
    borderColor: "#DFE3E8",
  },
  gridContainer: { flexDirection: "row", justifyContent: "space-between" },
  table: { display: "flex", width: "auto" },
  tableHeader: {},
  tableBody: {},
  tableRow: {
    padding: "8px 0",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: "#DFE3E8",
  },
  noBorder: { paddingTop: 8, paddingBottom: 0, borderBottomWidth: 0 },
  tableCell_1: { width: "5%" },
  tableCell_2: { width: "47%", paddingRight: 16 },
  tableCell_3: { width: "29%" },
});

InvoicePDF.propTypes = {
  invoice: PropTypes.object.isRequired,
};

export default function InvoicePDF({ invoice }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.gridContainer, styles.mb40]}>
          <Image source="/static/CSLlogo1.jpg" style={{ height: 32 }} />
          <View style={{ alignItems: "right", flexDirection: "column" }}>
            <Text style={styles.h3}>{payStatus[invoice.paymentStatus]}</Text>
            <Text>INV-{invoice._id}</Text>
            <Text>
              Date: {new Date(invoice?.createdAt).toLocaleDateString("en-GB")}{" "}
            </Text>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.mb40]}>
          <View style={styles.col6}>
            <Text style={[styles.overline, styles.mb8]}>Recipient</Text>
            <Text style={styles.body1}>{invoice?.customer?.name}</Text>
            <Text style={styles.body1}>
              {invoice?.customer?.phoneNumber &&
                "Phone: +44 (0) " + invoice?.customer?.phoneNumber}
            </Text>
            <Text style={styles.body1}>
              {invoice?.customer?.email && "Email: " + invoice?.customer?.email}
            </Text>
          </View>
          <View style={styles.col6}>
            {invoice?.customer?.address && (
              <>
                <Text style={[styles.overline, styles.mb8]}>Address</Text>
                <Text style={styles.body1}>{invoice?.customer?.address}</Text>
                <Text style={styles.body1}>{invoice?.customer?.zipcode}</Text>
              </>
            )}

            <Text style={styles.body1}>
              {invoice?.customer?.NINumber &&
                "NI Number: " + invoice?.customer?.NINumber}
            </Text>
          </View>
        </View>

        <Text style={[styles.overline, styles.mb8]}>Invoice Details</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableRow}>
              <View style={styles.tableCell_1}>
                <Text style={styles.subtitle2}>#</Text>
              </View>
              <View style={styles.tableCell_2}>
                <Text style={styles.subtitle2}>Description</Text>
              </View>
              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>Validity</Text>
              </View>
              <View style={styles.tableCell_3}>
                <Text style={styles.subtitle2}>Info</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text style={styles.subtitle2}>Total</Text>
              </View>
            </View>
          </View>

          <View style={styles.tableBody}>
            {invoice.items &&
              invoice?.items.map((item, index) => (
                <View style={styles.tableRow} key={index}>
                  <View style={styles.tableCell_1}>
                    <Text>{index + 1}</Text>
                  </View>
                  <View style={styles.tableCell_2}>
                    <Text style={styles.subtitle2}>{item?.title}</Text>

                    <Text>
                      {item?.trade?.title && "Trade: " + item?.trade?.title}
                    </Text>

                    <Text>
                      {item?.citbTestId && "CITB Test ID: " + item?.citbTestId}
                    </Text>
                  </View>
                  <View style={styles.tableCell_3}>
                    <Text>{item?.validity}</Text>
                  </View>
                  <View style={styles.tableCell_3}>
                    <Text> {"QTY: " + 1}</Text>
                    <Text>
                      {item.type === "cards" && (
                        <>{item.newRenew?.toUpperCase()}</>
                      )}
                    </Text>
                    {item.type === "tests" && (
                      <>
                        <Text>
                          {item.testDate &&
                            "Test Date: " +
                              new Date(item.testDate).toLocaleDateString(
                                "en-GB"
                              )}
                        </Text>
                        <Text>{item.testTime && "Time: " + item.testTime}</Text>
                        <Text>
                          {item.testModule?.length > 0 &&
                            "Test Modules: " + item.testModule?.toString()}
                        </Text>
                        <Text>
                          {item.voiceover && "Voiceover: " + item.voiceover}
                        </Text>
                      </>
                    )}
                  </View>
                  <View style={[styles.tableCell_3, styles.alignRight]}>
                    <Text>{poundSymbol + item?.price}</Text>
                  </View>
                </View>
              ))}

            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3}>
                <Text>Total Items</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text>{invoice?.items?.length}</Text>
              </View>
            </View>

            <View style={[styles.tableRow, styles.noBorder]}>
              <View style={styles.tableCell_1} />
              <View style={styles.tableCell_2} />
              <View style={styles.tableCell_3} />
              <View style={styles.tableCell_3}>
                <Text style={styles.h4}>Total</Text>
              </View>
              <View style={[styles.tableCell_3, styles.alignRight]}>
                <Text style={styles.h4}>
                  {poundSymbol + invoice.grandTotalToPay}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.gridContainer, styles.footer]}>
          <View style={styles.col8}>
            <Text style={styles.subtitle2}>Company Number: 13546291</Text>
            <Text>
              71 - 75, Shelton Street, Covent Garden London WC2H 9JQ UNITED
              KINGDOM
            </Text>
          </View>
          <View style={[styles.col4, styles.alignRight]}>
            <Text style={styles.subtitle2}>Have a Question?</Text>
            <Text>support@constructionsafetyline.co.uk</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
