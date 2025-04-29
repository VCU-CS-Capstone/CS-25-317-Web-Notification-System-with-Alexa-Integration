'use client';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
  const pathname = usePathname();
  const [isFirstRender, setIsFirstRender] = useState(true);
  
  useEffect(() => {
    // Skip animation on first render to prevent initial animation
    setIsFirstRender(false);
  }, []);
  
  const variants = {
    hidden: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  return (
    <motion.div
      key={pathname}
      initial={isFirstRender ? "enter" : "hidden"}
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ 
        type: "tween", 
        ease: "easeInOut", 
        duration: 0.3 
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
