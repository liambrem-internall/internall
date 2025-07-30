import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./BoardCard.css";

const URL = import.meta.env.VITE_API_URL;

const BoardCard = ({ user }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/${user.username}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="board-card" onClick={handleCardClick}>
      <Card.Body>
        <div className="board-card-header">
          <div className="user-avatar-large">
            {user.username?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="user-info">
            <h5 className="user-name">{user.username}</h5>
          </div>
        </div>

        <div className="board-footer">
          <span className="join-date">Joined {formatDate(user.createdAt)}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BoardCard;
