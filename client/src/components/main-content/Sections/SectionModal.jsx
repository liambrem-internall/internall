import { Modal, Form, Button } from "react-bootstrap";
import "./SectionModal.css";

const SectionModal = ({
  show,
  onHide,
  pendingSectionTitle,
  setPendingSectionTitle,
  handleSaveSection,
}) => {


  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Enter Section Title Content</Modal.Title>
      </Modal.Header>
      <Form.Control
        id="sectionTitle"
        size="lg"
        type="text"
        placeholder="Section Title"
        value={pendingSectionTitle}
        onChange={(e) => setPendingSectionTitle(e.target.value)}
        required
      />
      <Modal.Footer>
        <Button variant="primary" onClick={handleSaveSection} disabled={!pendingSectionTitle.trim()}>
          Add Section
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SectionModal;
