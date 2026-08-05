import { motion } from "motion/react"
import { cn } from "../../utils"
import { useState } from "react"

interface IImageRevealProps {
  alt?: string
  src: string
  className?: string
  duration?: number
  imageClassName?: string
  delay?: number
}

const ImageReveal: React.FC<IImageRevealProps> = ({ alt, src, className, duration = 0.8, imageClassName, delay = 0.85 }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className={cn("relative overflow-hidden h-[max-content]", className)}
    >
      <motion.div
        className="absolute inset-x-0 top-0 bg-neutral-200 z-0"
        initial={{ height: "0%" }}
        animate={{ height: "100%" }}
        transition={{
          duration,
          delay,
          ease: [0.76, 0, 0.24, 1],
        }}
        onAnimationComplete={() => setVisible(true)}
      />
      <motion.div
        initial={{ opacity: 0, transform: "skew(-5deg) scale(1.3)" }}
        animate={{ opacity: 1, transform: "skew(0) scale(1)" }}
        transition={{
          duration: 0.8,
          delay: duration + delay + 0.3,
          ease: [0.22, 1, 0.36, 1],
          transform: {
            duration: 0.85,
            delay: duration + 0.4
          }
        }}
        className="relative z-10 overflow-hidden"
      >
        <img
          src={src}
          alt={alt}
          className={cn("block w-full object-cover", imageClassName)}
        />
      </motion.div>


      <motion.div
        className={cn("absolute inset-x-0 bottom-0 z-10", visible ? "bg-neutral-200" : "bg-transparent")}
        initial={{ height: "100%", }}
        animate={{ height: "0%", }}
        transition={{
          duration,
          delay: duration + delay + 0.3,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
    </div>
  )
}

export default ImageReveal
