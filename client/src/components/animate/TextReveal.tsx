import { motion } from "motion/react";
import { cn } from "../../utils";

interface ITextRevealProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  delayUnit?: number
  staggerChildren?: number
  y?: number
  marginRight?: string
}

const TextReveal: React.FC<ITextRevealProps> = ({ text, className, staggerChildren = 0.1, delayUnit = 0.04, delay = 0, duration = 0.8, y = 20, marginRight = "20px" }) => {
  const words = text.match(/[\p{L}\p{N}]+[^\s\p{L}\p{N}]?|[^\s]/gu) || [];

  // Variants for the container to orchestrate the animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren, delayChildren: delayUnit * i + delay,
      },
    }),
  };

  // Variants for each word to create a smoother smoke effect
  const childVariants = {
    hidden: {
      opacity: 0,
      y,
      filter: "blur(10px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
  };

  return (
    <div className="flex items-center justify-center font-sans">
      <motion.div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: 'center' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("text-2xl font-sans text-center mask-r-from-0.5", className)}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={childVariants}
            transition={{
              duration,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ marginRight }} // Adjust spacing for paragraph
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

export default TextReveal
