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
        <Modal.Title>Add Section</Modal.Title>
      </Modal.Header>
      <Form.Group className="mb-3" controlId="sectionTitle">
        <Form.Control
          type="text"
          placeholder="Section Title"
          className="form-control"
          value={pendingSectionTitle}
          onChange={(e) => setPendingSectionTitle(e.target.value)}
        />
      </Form.Group>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleSaveSection}
          disabled={!pendingSectionTitle.trim()}
        >
          Add Section
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SectionModal;
