import { Modal, Form, Button } from "react-bootstrap";
import { useEffect, useRef } from "react";

const ItemModal = ({
  show,
  onHide,
  handleSaveItem,
  initialContent = "",
  initialLink = "",
  initialNotes = "",
}) => {
  const contentRef = useRef();
  const linkRef = useRef();
  const notesRef = useRef();

  useEffect(() => {
    if (show) {
      contentRef.current.value = initialContent;
      linkRef.current.value = initialLink;
      notesRef.current.value = initialNotes;
    }
  }, [show, initialContent, initialLink, initialNotes]);

  const onAdd = () => {
    handleSaveItem({
      content: contentRef.current.value,
      link: linkRef.current.value,
      notes: notesRef.current.value,
    });
    contentRef.current.value = "";
    linkRef.current.value = "";
    notesRef.current.value = "";
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Item Content</Modal.Title>
      </Modal.Header>
      <Form className="p-3">
        <Form.Group className="mb-3" controlId="itemContent">
          <Form.Control
            ref={contentRef}
            size="lg"
            type="text"
            placeholder="Title"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="itemLink">
          <Form.Control
            ref={linkRef}
            size="md"
            type="text"
            placeholder="Link"
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="itemNotes">
          <Form.Control
            ref={notesRef}
            size="sm"
            type="text"
            placeholder="Notes"
          />
        </Form.Group>
      </Form>
      <Modal.Footer>
        <Button variant="primary" onClick={onAdd}>
          Add Item
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ItemModal;
