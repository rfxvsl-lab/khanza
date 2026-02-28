import { motion } from 'motion/react';

export default function FloatingBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute top-[-15%] left-[-15%] w-[35vw] h-[35vw] rounded-full bg-red-950/15 blur-[150px]"
        animate={{
          x: [0, 40, 0],
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-[-15%] right-[-15%] w-[40vw] h-[40vw] rounded-full bg-red-950/10 blur-[150px]"
        animate={{
          x: [0, -30, 0],
          y: [0, -35, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
      />
      <motion.div
        className="absolute top-[40%] left-[50%] w-[25vw] h-[25vw] rounded-full bg-red-950/5 blur-[120px]"
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -20, 15, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
      />
    </div>
  );
}
