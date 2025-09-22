"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Info } from "lucide-react";

export function DemoWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the warning
    const dismissed = localStorage.getItem('demo-warning-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('demo-warning-dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Demo Mode - Limited Usage
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                This is a public demo with restricted features. You can create up to 2 recipes per minute.
                Data may be periodically reset. For full features, please set up your own instance.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoInfoBanner() {
  return (
    <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Demo Limitations
          </h3>
          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1 space-y-1">
            <p>• Rate limited: 2 recipes per minute</p>
            <p>• Data may be reset periodically</p>
            <p>• Image uploads limited to 1 per minute</p>
            <p>• Comments limited to 3 per 30 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}
