import { Icon } from "@iconify/react";
import arrowIosDownwardFill from "@iconify/icons-eva/arrow-ios-downward-fill";
// material
import {
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Box,
  Chip,
  alpha,
  useTheme,
  Fade,
} from "@mui/material";
import { Help as HelpIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from "react";
import axiosInstance from "../../../axiosConfig";

// Styled components for consistency with dashboard
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '&:before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: `${theme.spacing(1)} 0`,
    boxShadow: theme.shadows[4],
  },
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  textTransform: 'capitalize',
}));

export default function FaqsList(props) {
  const theme = useTheme();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  let search = window.location.search;
  let params = new URLSearchParams(search);
  let category = params.get("faq");

  const getCategoryColor = (category) => {
    const colors = {
      test: theme.palette.info.main,
      qualification: theme.palette.success.main,
      course: theme.palette.warning.main,
      center: theme.palette.error.main,
      card: theme.palette.primary.main,
      trade: theme.palette.secondary.main,
      payment: theme.palette.info.dark,
      info: theme.palette.text.primary,
      other: theme.palette.text.secondary,
    };
    return colors[category] || theme.palette.text.secondary;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let resp = [];
        if (category) {
          resp = await axiosInstance.get(`/v1/faqs?category=${category}`);
        } else {
          resp = await axiosInstance.get(`/v1/faqs`);
        }
        setFaqs(resp.data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Fallback to mock data
        const mockFaqs = [
          {
            _id: 'mock-1',
            title: 'How do I book a CSCS test?',
            description: 'You can book your CSCS test through our online booking system. Select your preferred test center, date, and time slot. We offer flexible scheduling with multiple locations across the UK.',
            category: 'test'
          },
          {
            _id: 'mock-2',
            title: 'What documents do I need for CISRS scaffolding card?',
            description: 'You will need valid ID, proof of training, and any existing certifications. Check our documentation guide for full requirements. Original certificates must be provided for verification.',
            category: 'card'
          },
          {
            _id: 'mock-3',
            title: 'How long does it take to process my application?',
            description: 'Most applications are processed within 5-10 working days. Complex applications may take longer. You will receive email updates throughout the process.',
            category: 'info'
          }
        ].filter(faq => !category || faq.category === category);
        setFaqs(mockFaqs);
      } finally {
        setLoading(false);
      }
    })();
  }, [props, category]);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading FAQs...
        </Typography>
      </Box>
    );
  }

  if (faqs.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <HelpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No FAQs Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {category 
            ? `No FAQs found for the "${category}" category.`
            : 'No frequently asked questions are currently available.'
          }
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ '& > *': { mb: 1 } }}>
      {faqs.map((faq, index) => (
        <Fade in timeout={300 + (index * 100)} key={faq._id}>
          <StyledAccordion>
            <AccordionSummary
              expandIcon={
                <Icon icon={arrowIosDownwardFill} width={20} height={20} />
              }
              sx={{
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: theme.spacing(1, 0),
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <HelpIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                  {faq.title}
                </Typography>
                {faq.category && (
                  <CategoryChip
                    label={faq.category}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getCategoryColor(faq.category), 0.1),
                      color: getCategoryColor(faq.category),
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {faq.description}
              </Typography>
            </AccordionDetails>
          </StyledAccordion>
        </Fade>
      ))}
    </Box>
  );
}
