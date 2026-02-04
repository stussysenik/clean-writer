import { useRef, useEffect, useCallback, useState } from 'react';
import { SyntaxAnalysis } from '../types';

interface WorkerMessage {
  result: SyntaxAnalysis;
  id: number;
}

export function useSyntaxWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const pendingRequestsRef = useRef<Map<number, (result: SyntaxAnalysis) => void>>(new Map());
  const idCounterRef = useRef(0);

  useEffect(() => {
    // Create the worker
    workerRef.current = new Worker(
      new URL('../workers/syntaxWorker.ts', import.meta.url),
      { type: 'module' }
    );

    // Set up message handler
    workerRef.current.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { result, id } = e.data;
      const resolver = pendingRequestsRef.current.get(id);
      if (resolver) {
        resolver(result);
        pendingRequestsRef.current.delete(id);
      }
    };

    workerRef.current.onerror = (error) => {
      console.error('Syntax worker error:', error);
    };

    setIsReady(true);

    // Cleanup on unmount
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      pendingRequestsRef.current.clear();
    };
  }, []);

  const analyze = useCallback((text: string): Promise<SyntaxAnalysis> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        // Fallback: return empty result if worker not ready
        resolve({
          nouns: [],
          pronouns: [],
          verbs: [],
          adjectives: [],
          adverbs: [],
          prepositions: [],
          conjunctions: [],
          articles: [],
          interjections: [],
        });
        return;
      }

      const id = ++idCounterRef.current;
      pendingRequestsRef.current.set(id, resolve);

      // Send message to worker
      workerRef.current.postMessage({ text, id });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (pendingRequestsRef.current.has(id)) {
          pendingRequestsRef.current.delete(id);
          reject(new Error('Syntax analysis timeout'));
        }
      }, 5000);
    });
  }, []);

  return { analyze, isReady };
}
