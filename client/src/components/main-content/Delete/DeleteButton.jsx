import { BsTrashFill } from "react-icons/bs";
import "./DeleteButton.css";

const DeleteButton = () => {
  return (
    <div className="delete-btn">
      <BsTrashFill className="trash-icon" color="var(--gray2)" size={100}/>
    </div>
  );
};

export default DeleteButton;
