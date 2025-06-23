import Button from "react-bootstrap/Button";
import { BsPlus } from "react-icons/bs";
import "./AddButton.css";

const AddButton = () => {
  return (
    <Button className="add-circular-btn d-flex align-items-center justify-content-center">
      <BsPlus className="add-plus-icon" />
    </Button>
  );
};

export default AddButton;
