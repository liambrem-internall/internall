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

  // define fields for form to be mapped over
  const fields = [
    {
      ref: contentRef,
      size: "lg",
      type: "text",
      placeholder: "Title",
      controlId: "itemContent",
    },
    {
      ref: linkRef,
      size: "md",
      type: "text",
      placeholder: "Link",
      controlId: "itemLink",
    },
    {
      ref: notesRef,
      size: "sm",
      type: "text",
      placeholder: "Notes",
      controlId: "itemNotes",
    },
  ];

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Item Content</Modal.Title>
      </Modal.Header>
      <Form className="p-3">
        {fields.map((field) => (
          <Form.Group
            className="mb-3"
            controlId={field.controlId}
            key={field.controlId}
          >
            <Form.Control
              ref={field.ref}
              size={field.size}
              type={field.type}
              placeholder={field.placeholder}
            />
          </Form.Group>
        ))}
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
