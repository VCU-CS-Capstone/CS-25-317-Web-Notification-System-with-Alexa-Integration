"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const MobileShortcutGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [colorMode, setColorMode] = useState("");
  
  // Get color mode from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedColorMode = localStorage.getItem('colorMode');
      if (storedColorMode) {
        setColorMode(storedColorMode);
      }
    }
  }, []);
  
  const steps = [
    {
      title: "Add to Home Screen - Step 1",
      description: "Tap the share icon at the bottom of your browser",
      image: "/step1.png"
    },
    {
      title: "Add to Home Screen - Step 2",
      description: "Scroll down and tap 'Add to Home Screen'",
      image: "/step2.png"
    },
    {
      title: "Add to Home Screen - Step 3",
      description: "Tap 'Add' in the top right corner",
      image: "/step3.png"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-[var(--text-on-accent)] rounded-md shadow-md font-medium"
        whileHover={{ y: -3, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)' }}
        whileTap={{ y: 0, boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <motion.span 
          className="text-xl"
          animate={{ rotate: [0, 15, -15, 15, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
        >📱</motion.span>
        <span>Add to Home Screen</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-xl w-full p-6 relative"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
            <motion.button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
            
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
              {steps[currentStep].title}
            </h3>
            
            <p className="mb-4 text-[var(--text-secondary)]">
              {steps[currentStep].description}
            </p>
            
            <div className="flex justify-center mb-4 bg-gray-100 rounded-lg p-2 overflow-hidden">
              <div className="relative h-80 w-full max-w-md mx-auto">
                <Image
                  src={steps[currentStep].image}
                  alt={`Step ${currentStep + 1}: ${steps[currentStep].description}`}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  className="max-h-full max-w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <motion.button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                whileHover={currentStep !== 0 ? { scale: 1.05 } : {}}
                whileTap={currentStep !== 0 ? { scale: 0.95 } : {}}
                className={`px-4 py-2 rounded-md ${
                  currentStep === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[var(--accent-color)] text-[var(--text-on-accent)]"
                }`}
              >
                Previous
              </motion.button>
              
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[var(--accent-color)] text-[var(--text-on-accent)] rounded-md"
              >
                {currentStep < steps.length - 1 ? "Next" : "Close"}
              </motion.button>
            </div>
            
            <div className="mt-4 flex justify-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    index === currentStep
                      ? "bg-[var(--accent-color)]"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileShortcutGuide;
