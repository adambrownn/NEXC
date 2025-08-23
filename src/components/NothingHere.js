import { motion } from "framer-motion";
import { Box, Typography, Container } from "@mui/material";
// components
import { MotionContainer, varBounceIn } from "../components/animate";

export default function NothingHere() {
  return (
    <Container sx={{ marginTop: 4 }}>
      <MotionContainer initial="initial" open>
        <Box sx={{ maxWidth: 480, margin: "auto", textAlign: "center" }}>
          <motion.div variants={varBounceIn}>
            <Typography variant="h4" sx={{ color: "text.secondary" }} paragraph>
              Didn't find! What you're looking for?
            </Typography>
          </motion.div>
          <Typography sx={{ color: "text.secondary" }}>
            Give us a call if assistance required: ++91 (0)99717 14172
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Please try again with desired information.
          </Typography>
        </Box>
      </MotionContainer>
    </Container>
  );
}
