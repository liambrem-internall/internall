import { useState, useRef } from 'react';

const useSectionListState = () => {
  // section data
  const [sections, setSections] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);
  
  // modal state
  const [showModal, setShowModal] = useState(false);
  const [pendingSectionTitle, setPendingSectionTitle] = useState("");
  
  // editing state
  const [targetSectionId, setTargetSectionId] = useState(null);
  
  // drag state
  const [activeId, setActiveId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteZoneOver, setIsDeleteZoneOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const activeIdRef = useRef(null);
  

  return {
    sectionState: {
      sections,
      setSections,
      sectionOrder,
      setSectionOrder,
    },
    modalState: {
      showModal,
      setShowModal,
      pendingSectionTitle,
      setPendingSectionTitle,
    },
    editingState: {
      targetSectionId,
      setTargetSectionId,
    },
    dragState: {
      activeId,
      setActiveId,
      isDragging,
      setIsDragging,
      isDeleteZoneOver,
      setIsDeleteZoneOver,
      dragPosition,
      setDragPosition,
      activeIdRef,
    },
  };
};

export default useSectionListState;