import { useState } from "react";
import { motion, useMotionValue, animate, type PanInfo } from "framer-motion";
import { Trash2, Pencil } from "lucide-react";

interface SwipeActionsProps {
  onDelete: () => void;
  onEdit: () => void;
  children: React.ReactNode;
}

const ACTION_WIDTH = 72;
const PANEL_WIDTH = ACTION_WIDTH * 2;
const OPEN_THRESHOLD = PANEL_WIDTH / 2;

function SwipeActions({ onDelete, onEdit, children }: SwipeActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);

  function snapTo(target: number, open: boolean) {
    animate(x, target, { type: "spring", stiffness: 400, damping: 40 });
    setIsOpen(open);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const shouldOpen = info.offset.x < -OPEN_THRESHOLD || info.velocity.x < -500;
    snapTo(shouldOpen ? -PANEL_WIDTH : 0, shouldOpen);
  }

  function handleEdit() {
    snapTo(0, false);
    onEdit();
  }

  function handleDelete() {
    snapTo(0, false);
    onDelete();
  }

  return (
    <div data-swipeable-card className="relative overflow-hidden rounded-3xl">
      {/* Action panel, revealed behind the card as it slides open */}
      <div className="absolute inset-y-0 right-0 flex" style={{ width: PANEL_WIDTH }}>
        <button
          onClick={handleEdit}
          className="flex flex-1 flex-col items-center justify-center gap-1 bg-gray-400 text-white"
        >
          <Pencil className="h-4 w-4" />
          <span className="text-[11px] font-medium">Edit</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-r-3xl bg-red-500 text-white"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-[11px] font-medium">Delete</span>
        </button>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -PANEL_WIDTH, right: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        onClickCapture={(e) => {
          // While open, the first tap anywhere on the card just closes the
          // panel — it must NOT also trigger the card's own expand/collapse
          // click underneath it, so this intercepts before it can bubble.
          if (isOpen) {
            e.stopPropagation();
            snapTo(0, false);
          }
        }}
        className="relative bg-inherit"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default SwipeActions;