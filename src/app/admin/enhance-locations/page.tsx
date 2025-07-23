'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { batchEnhanceBusinessLocations } from '@/utils/businessLocationEnhancer';
import { useAuth } from '@/hooks/useAuth';

export default function EnhanceLocationsPage() {
  const { isAdmin } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleEnhanceLocations = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Starting business location enhancement...');

    // Override console.log to capture logs
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      addLog(args.join(' '));
      originalConsoleLog(...args);
    };

    console.warn = (...args) => {
      addLog('⚠️ ' + args.join(' '));
      originalConsoleWarn(...args);
    };

    console.error = (...args) => {
      addLog('❌ ' + args.join(' '));
      originalConsoleError(...args);
    };

    try {
      await batchEnhanceBusinessLocations();
      addLog('✅ Enhancement completed successfully!');
    } catch (error) {
      addLog(`❌ Enhancement failed: ${error}`);
    } finally {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Enhance Business Locations
        </h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What this does:</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Geocodes Waze URLs to get exact coordinates</li>
            <li>• Maps service areas to approximate center points</li>
            <li>• Adds location data to business metadata</li>
            <li>• Enables distance-based search and map view</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Important notes:</h3>
          <ul className="text-yellow-800 space-y-1 text-sm">
            <li>• This process may take several minutes</li>
            <li>• Rate limited to respect free geocoding service</li>
            <li>• Safe to run multiple times (won't duplicate data)</li>
            <li>• Keep this tab open during the process</li>
          </ul>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleEnhanceLocations}
            disabled={isRunning}
            variant="primary"
            size="lg"
          >
            {isRunning ? 'Enhancing...' : 'Start Enhancement'}
          </Button>
          
          {logs.length > 0 && (
            <Button
              onClick={() => setLogs([])}
              disabled={isRunning}
              variant="outline"
            >
              Clear Logs
            </Button>
          )}
        </div>

        {logs.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="font-semibold text-gray-900 mb-3">
              Enhancement Log {isRunning && '(Running...)'}
            </h3>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
              {isRunning && (
                <div className="animate-pulse">
                  <span className="bg-green-400 text-black px-1">█</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}