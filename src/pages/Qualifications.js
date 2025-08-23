// material
import { experimentalStyled as styled } from "@mui/material/styles";
// import { Container } from "@mui/material";
// components
import Page from "../components/Page";
import { QualificationPlanCard } from "../components/_external-pages/qualifications";
import { Helmet } from 'react-helmet-async';

// Sample qualification data - can be populated from your API or static content
const QUALIFICATION_DATA = [
  {
    level: 1,
    title: "Entry Level Construction Qualification",
    description: "Start your construction career with industry-recognized credentials",
    role: "Labourer",
    trade: "All Trades",
    badge: "Most Popular",
    price: "495",
    // Other fields can be populated here
  },
  // Add more qualification objects here
];

const RootStyle = styled(Page)(({ theme }) => ({
  minHeight: "100%",
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10),
}));

export default function QualificationsPage() {
  return (
    <RootStyle title="Construction Qualifications & NVQs | Advance Your Career | NEXC">
      <Helmet>
        <meta name="description" content="Get industry-recognized NVQ qualifications and CSCS cards to advance your construction career, increase earning potential, and access better job opportunities." />
        <meta name="keywords" content="construction qualifications, NVQ, CSCS card, construction career, trade qualification, supervisor qualification, management qualification" />
      </Helmet>
      <QualificationPlanCard qualificationData={QUALIFICATION_DATA} />
    </RootStyle>
  );
}
