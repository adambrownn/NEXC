import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, CardActions } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import CheckIcon from "@material-ui/icons/Check";
import CartBucketService from "../../../services/bucket";
import UserService from "../../../services/user";
import UserForm from "./UserForm";

const UserDetailsContext = React.createContext();

export default function ApplicationForm(props) {
  const [isSelected, setIsSelected] = React.useState();
  const [userFormOpen, setUserFormOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleAddItem = async () => {
    // check if user details exists
    const user = await UserService.getBillingUser();
    if (!user) {
      // ask to enter details
      setUserFormOpen(true);
    }

    if (isSelected) {
      await CartBucketService.removeItemFromBucket(props._id);
    } else {
      await CartBucketService.addItemToBucket(props);

      setIsSelected(!isSelected);
    }
    navigate(
      `/trades?cartitems=${JSON.parse(localStorage.getItem("cart")).length}`
    );
  };

  React.useEffect(() => {
    const itemsInCart = JSON.parse(localStorage.getItem("cart"));
    const _resp = itemsInCart?.some((item) => item._id === props._id);
    setIsSelected(_resp);
  }, [props]);

  return (
    <div>
      <CardActions
        style={{
          paddingBottom: 20,
          bottom: 0,
          right: 0,
        }}
      >
        <Button
          fullWidth
          size="small"
          color={isSelected ? "success" : "primary"}
          variant={isSelected ? "contained" : "outlined"}
          onClick={handleAddItem}
          endIcon={isSelected ? <CheckIcon /> : <AddIcon />}
        >
          {isSelected ? "Selected" : "Add Item"}
        </Button>
        <UserDetailsContext.Provider value={{ userFormOpen, setUserFormOpen }}>
          <UserForm userDetailsContext={UserDetailsContext} />
        </UserDetailsContext.Provider>
      </CardActions>
    </div>
  );
}
