import { Icon } from "@iconify/react";
import arrowIosDownwardFill from "@iconify/icons-eva/arrow-ios-downward-fill";
// material
import {
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosConfig";

export default function FaqsList(props) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  let search = window.location.search;
  let params = new URLSearchParams(search);
  let category = params.get("faq");

  useEffect(() => {
    (async () => {
      setLoading(true);
      let resp = [];
      if (category) {
        resp = await axiosInstance.get(`/others/faqs?category=${category}`);
      } else {
        resp = await axiosInstance.get(`/others/faqs`);
      }
      setFaqs(resp.data || []);
      setLoading(false);
    })();
  }, [props, category]);

  return (
    <>
      {loading ? (
        <div style={{ textAlign: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {faqs?.map((faq) => (
            <Accordion key={faq._id}>
              <AccordionSummary
                expandIcon={
                  <Icon icon={arrowIosDownwardFill} width={20} height={20} />
                }
              >
                <Typography variant="subtitle1">{faq.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.description}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </>
  );
}
