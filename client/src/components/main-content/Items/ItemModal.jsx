import { Modal, Form, Button } from "react-bootstrap";
import { useEffect, useRef } from "react";
import "./ItemModal.css";
import useEditingSocket from "../../../hooks/useEditingSocket";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import useRoomUsers from "../../../hooks/rooms/useRoomUsers";

const ItemModal = ({
  show,
  onHide,
  handleSaveItem,
  initialContent = "",
  initialLink = "",
  initialNotes = "",
  itemId,
}) => {
  const contentRef = useRef();
  const linkRef = useRef();
  const notesRef = useRef();
  const { user } = useAuth0();
  const { username: roomId } = useParams();
  const allUsers = useRoomUsers(roomId, null); // null so it doesn't filter out self
  const currentUser = allUsers.find((u) => u.id === user?.sub);
  const color = currentUser?.color;

  useEditingSocket({
    roomId,
    userId: user?.sub,
    itemId,
    editing: show,
    color,
  });

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
