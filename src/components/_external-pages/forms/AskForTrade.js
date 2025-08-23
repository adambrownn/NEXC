import React from "react";
import {
  Button,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import TradeDatalist from "../trades/TradeDatalist";
import UserService from "../../../services/user";
import UserForm from "./UserForm";

const LearnMoreContext = React.createContext();
const UserDetailsContext = React.createContext();

export default function ApplicationInfo(props) {
  const [askForTradeOpen, setAskForTradeOpen] = React.useState(false);
  const [userFormOpen, setUserFormOpen] = React.useState(false);

  const handlePurchase = async () => {
    const user = await UserService.getBillingUser();

    setAskForTradeOpen(true);
    if (!user) {
      // ask to enter details
      setUserFormOpen(true);
    }
  };

  const handleAskForTradeClose = () => {
    setAskForTradeOpen(false);
  };

  return (
    <div>
      <CardActions>
        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={handlePurchase}
        >
          Apply Now
        </Button>
      </CardActions>
      <LearnMoreContext.Provider value={{ setAskForTradeOpen }}>
        <Dialog
          open={askForTradeOpen}
          onClose={handleAskForTradeClose}
          scroll={"paper"}
          fullWidth={true}
          maxWidth={"sm"}
        >
          <DialogTitle sx={{ pb: 2 }}>Search and Select a Trade </DialogTitle>

          <DialogContent dividers={true}>
            <TradeDatalist />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAskForTradeClose}>Close</Button>
            <Button variant="contained" onClick={handleAskForTradeClose}>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </LearnMoreContext.Provider>

      {userFormOpen && (
        <UserDetailsContext.Provider value={{ userFormOpen, setUserFormOpen }}>
          <UserForm userDetailsContext={UserDetailsContext} />
        </UserDetailsContext.Provider>
      )}
    </div>
  );
}
