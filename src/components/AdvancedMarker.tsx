import { useEffect, useRef } from 'react';
import { useGoogleMap } from '@react-google-maps/api';

interface AdvancedMarkerProps {
  position: google.maps.LatLngLiteral;
  title?: string;
  label?: { text: string; color?: string; fontSize?: string; fontWeight?: string };
}

/**
 * Wrapper around google.maps.marker.AdvancedMarkerElement.
 * Must be rendered inside a <GoogleMap> with mapId set.
 */
export function AdvancedMarker({ position, title, label }: AdvancedMarkerProps) {
  const map = useGoogleMap();
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  useEffect(() => {
    if (!map || !google.maps.marker?.AdvancedMarkerElement) return;

    let content: HTMLElement | undefined;
    if (label) {
      const el = document.createElement('div');
      el.style.cssText =
        'background:#c60b1e;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
      const span = document.createElement('span');
      span.style.cssText = `color:${label.color || 'white'};font-size:${label.fontSize || '11px'};font-weight:${label.fontWeight || 'bold'}`;
      span.textContent = label.text;
      el.appendChild(span);
      content = el;
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title,
      content,
    });
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, position.lat, position.lng, title, label?.text]);

  return null;
}
