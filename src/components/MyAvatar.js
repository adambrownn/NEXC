import { MAvatar } from "./@material-extend";
import createAvatar from "../utils/createAvatar";

// ----------------------------------------------------------------------

export default function MyAvatar(props, { ...other }) {
  return (
    <MAvatar
      src={props.profileImage}
      alt={props.profileImage}
      color={false ? "default" : createAvatar(props.profileImage).color}
      {...other}
    >
      {createAvatar(props.name).name}
    </MAvatar>
  );
}
