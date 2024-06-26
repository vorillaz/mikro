import { useEffect, useRef } from "react";
import { IDragProps, IDragStatus, TTarget } from "./types";

export const Draggable = ({
  children,
  onDrag,
  getTarget,
  deps = [],
}: IDragProps) => {
  const gripRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<IDragStatus>({
    startPosition: 0,
    startWidth: 200,
    x: 0,
    isOn: false,
    currPosition: 0,
    currWidth: 0,
    target: "drag",
  });

  useEffect(() => {
    if (gripRef?.current) {
      gripRef.current.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (gripRef?.current) {
        gripRef.current.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [...deps]);

  const handleMouseDown = (e: MouseEvent) => {
    const target = getTarget();
    if (!target) {
      return;
    }
    const eTarget = e.target as HTMLElement;

    dragRef.current.startPosition = target.offsetLeft;
    dragRef.current.startWidth = target.offsetWidth;

    dragRef.current.x = e.x;
    dragRef.current.isOn = true;

    dragRef.current.target = eTarget.getAttribute("data-dir") as TTarget;
  };

  const handleMouseUp = () => {
    if (!dragRef.current.isOn) {
      return;
    }

    dragRef.current.isOn = false;
    dragRef.current.startPosition = dragRef.current.currPosition;
    dragRef.current.startWidth = dragRef.current.currWidth;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isOn) {
      return;
    }

    const diff = e.x - dragRef.current.x;

    const resp = onDrag(diff, dragRef.current);
    if (resp) {
      const {
        leftWidth = dragRef.current.currPosition,
        width = dragRef.current.currWidth,
      } = resp;
      dragRef.current.currPosition = leftWidth;
      dragRef.current.currWidth = width;
    }
  };

  return <div ref={gripRef}>{children}</div>;
};
