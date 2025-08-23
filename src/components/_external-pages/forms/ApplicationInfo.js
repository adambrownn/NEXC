import React from "react";
import {
  Button,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  // Typography,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const LearnMoreContext = React.createContext();

export default function ApplicationInfo(props) {
  const [learnMoreOpen, setLearnMoreOpen] = React.useState(false);

  const handleLearnMoreOpen = () => {
    setLearnMoreOpen(true);
  };

  const handleLearnMoreClose = () => {
    setLearnMoreOpen(false);
  };
  return (
    <div>
      <CardActions>
        <Button
          size="small"
          style={{
            color: "#000",
            opacity: 0.33,
            top: -12,
          }}
          onClick={handleLearnMoreOpen}
          startIcon={<InfoIcon />}
        ></Button>
      </CardActions>
      <LearnMoreContext.Provider value={{ setLearnMoreOpen }}>
        <Dialog
          open={learnMoreOpen}
          onClose={handleLearnMoreClose}
          scroll={"paper"}
          fullWidth={true}
          maxWidth={"sm"}
        >
          <DialogTitle sx={{ pb: 2 }}>{props.title} </DialogTitle>

          <DialogContent dividers={true}>
  {props.validity && (
    <DialogContentText variant="body2" color="text.secondary">
      <strong>Validity:</strong> {props.validity}
    </DialogContentText>
  )}
            {props.duration && (
    <DialogContentText variant="body2" color="text.secondary">
      <strong>Duration:</strong> {props.duration}
    </DialogContentText>
  )}
            {props.numberOfQuestions && (
    <DialogContentText variant="body2" color="text.secondary">
      <strong>Number of Questions:</strong> {props.numberOfQuestions}
    </DialogContentText>
  )}
            {props.isOnline && (
    <DialogContentText variant="body2" color="text.secondary">
      <strong>Mode: </strong> offline{props.isOnline && "/online"}
    </DialogContentText>
  )}
            {props.description && (
    <DialogContentText 
      id="scroll-dialog-description" 
      tabIndex={-1}
      variant="body2" 
      color="text.secondary"
    >
      {props.description}
    </DialogContentText>
  )}
</DialogContent>
          <DialogActions>
            <Button onClick={handleLearnMoreClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </LearnMoreContext.Provider>
    </div>
  );
}
