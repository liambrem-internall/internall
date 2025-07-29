import { Modal, Form, Button } from "react-bootstrap";
import { useEffect, useRef } from "react";
import "./ItemModal.css";
import useEditingSocket from "../../../hooks/useEditingSocket";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import useRoomUsers from "../../../hooks/rooms/useRoomUsers";
import { BsTrashFill } from "react-icons/bs";


const ItemModal = ({
  show,
  onHide,
  handleSaveItem,
  handleDeleteItem,
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

  const onDelete = () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      handleDeleteItem(itemId);
      onHide();
    }
  };

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

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {itemId ? "Update Item" : "Add Item"}
        </Modal.Title>
      </Modal.Header>
      <Form className="p-3">
        <div className="mb-2">Title:</div>
        <Form.Group className="mb-3" controlId="itemContent">
          <Form.Control
            ref={contentRef}
            size="sm"
            type="text"
            placeholder="Title"
          />
        </Form.Group>
        <div className="mb-2">Link:</div>
        <Form.Group className="mb-3" controlId="itemLink">
          <Form.Control
            ref={linkRef}
            size="sm"
            type="text"
            placeholder="Link"
          />
        </Form.Group>
        <div className="mb-2">Notes:</div>
        <Form.Group className="mb-3" controlId="itemNotes">
          <Form.Control
            ref={notesRef}
            as="textarea"
            rows={6}
            size="sm"
            type="text"
            placeholder="Notes"
          />
        </Form.Group>
      </Form>
      <Modal.Footer>
        {itemId && (
          <Button
            variant="danger"
            onClick={onDelete}
            style={{ marginRight: "auto" }}
          >
            <BsTrashFill style={{ marginRight: 6, marginBottom: 2 }} />
            Delete
          </Button>
        )}
        <Button variant="primary" onClick={onAdd}>
          {itemId ? "Update Item" : "Add Item"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ItemModal;
