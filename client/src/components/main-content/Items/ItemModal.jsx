import { Modal } from "react-bootstrap";

const ItemModal = () => {
  <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Enter Item Content</Modal.Title>
    </Modal.Header>
    <Form.Control
      id="itemContent"
      size="lg"
      type="text"
      placeholder="Item content"
      value={pendingItemContent}
      onChange={(e) => setPendingItemContent(e.target.value)}
    />
    <Modal.Footer>
      <Button variant="primary" onClick={handleSaveItem}>
        Add Item
      </Button>
    </Modal.Footer>
  </Modal>;
};
