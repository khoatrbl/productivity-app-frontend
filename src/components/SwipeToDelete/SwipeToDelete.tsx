import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: React.ReactNode;
  threshold?: number;
}

function SwipeToDelete({ onDelete, children, threshold = 96 }: SwipeToDeleteProps) {
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-threshold, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -threshold) onDelete();
  }

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-0 flex items-center justify-end rounded-3xl bg-red-500 pr-6"
      >
        <Trash2 className="h-5 w-5 text-white" />
      </motion.div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -threshold - 40, right: 0 }}
        dragElastic={0.15}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        className="relative bg-inherit"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default SwipeToDelete;