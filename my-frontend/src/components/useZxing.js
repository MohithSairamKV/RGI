import { BrowserMultiFormatReader } from '@zxing/library';
import { useEffect, useMemo, useRef } from 'react';

const useZxing = ({
  constraints = {
    audio: false,
    video: {
      facingMode: 'environment', // Use rear camera by default
    },
  },
  hints,
  timeBetweenDecodingAttempts = 300,
  onResult = () => {},
  onError = () => {},
} = {}) => {
  const ref = useRef(null);

  const reader = useMemo(() => {
    const instance = new BrowserMultiFormatReader(hints);
    instance.timeBetweenDecodingAttempts = timeBetweenDecodingAttempts;
    return instance;
  }, [hints, timeBetweenDecodingAttempts]);

  useEffect(() => {
    if (!ref.current) {
      console.error('Video element not found or ref not attached properly');
      return;
    }

    console.log('Starting barcode scanner with constraints:', constraints);

    reader.decodeFromConstraints(constraints, ref.current, (result, error) => {
      if (result) {
        console.log('Barcode scan successful:', result);
        onResult(result);
      } else if (error) {
        console.error('Barcode scan error:', error);
        onError(error);
      }
    }).catch((err) => {
      console.error('Failed to initialize barcode scanner:', err);
      onError(err);
    });

    return () => {
      console.log('Resetting barcode reader');
      reader.reset();
    };
  }, [ref, reader]);

  return { ref };
};

export default useZxing;
