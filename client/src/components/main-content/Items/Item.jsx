import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {CSS} from '@dnd-kit/utilities';
import "./Item.css";
import Button from 'react-bootstrap/Button';


const Item = (props) => {
    
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable",
  });
  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div className="item">
      <Button ref={setNodeRef} style={style} {...listeners} {...attributes} className="item-button">
        Draggable
      </Button>
    </div>
  );
};

export default Item;
