"use client";
import { useState } from 'react';
import Image from 'next/image';

const MobileShortcutGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Add to Home Screen - iOS",
      description: "Tap the share icon at the bottom of your browser",
      image: "/mobile-guide/ios-step1.png"
    },
    {
      title: "Add to Home Screen - iOS",
      description: "Scroll down and tap 'Add to Home Screen'",
      image: "/mobile-guide/ios-step2.png"
    },
    {
      title: "Add to Home Screen - iOS",
      description: "Tap 'Add' in the top right corner",
      image: "/mobile-guide/ios-step3.png"
    },
    {
      title: "Add to Home Screen - Android",
      description: "Tap the menu icon (three dots) in Chrome",
      image: "/mobile-guide/android-step1.png"
    },
    {
      title: "Add to Home Screen - Android",
      description: "Tap 'Add to Home screen'",
      image: "/mobile-guide/android-step2.png"
    },
    {
      title: "Add to Home Screen - Android",
      description: "Tap 'Add' to confirm",
      image: "/mobile-guide/android-step3.png"
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
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-[var(--text-on-accent)] rounded-md shadow-md transition-colors font-medium"
      >
        <span className="text-xl">📱</span>
        <span>Add to Home Screen</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-primary)] rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
              {steps[currentStep].title}
            </h3>
            
            <p className="mb-4 text-[var(--text-secondary)]">
              {steps[currentStep].description}
            </p>
            
            <div className="flex justify-center mb-4 bg-gray-100 rounded-lg p-2">
              <div className="relative h-64 w-full">
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded">
                  {/* Placeholder for actual images */}
                  <div className="text-gray-500 text-center p-4">
                    <p className="text-lg font-medium">Step {currentStep + 1}</p>
                    <p>{steps[currentStep].description}</p>
                    <p className="text-xs mt-2 text-gray-400">(Example image would appear here)</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-md ${
                  currentStep === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[var(--accent-color)] text-[var(--text-on-accent)]"
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-[var(--accent-color)] text-[var(--text-on-accent)] rounded-md"
              >
                {currentStep < steps.length - 1 ? "Next" : "Close"}
              </button>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileShortcutGuide;
