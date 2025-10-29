
import React, { useEffect, useRef } from 'react';
import { Marker, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';

// This function calculates the bearing (angle) between two points
const calculateBearing = (start, end) => {
    const startLat = L.CRS.EPSG3857.project(start).y;
    const startLng = L.CRS.EPSG3857.project(start).x;
    const endLat = L.CRS.EPSG3857.project(end).y;
    const endLng = L.CRS.EPSG3857.project(end).x;
    const angle = Math.atan2(endLng - startLng, endLat - startLat);
    return angle * (180 / Math.PI);
};

function AnimatedMarker({ currentPosition, previousPosition, icon, info }) {
    const markerRef = useRef(null);
    const map = useMap();
    const DURATION = 1000; // 1 second animation

    useEffect(() => {
        const marker = markerRef.current;
        if (marker && currentPosition) {
            const startLatLng = marker.getLatLng();
            const endLatLng = L.latLng([currentPosition.lat, currentPosition.lng]);

            // Calculate bearing for rotation
            let bearing = 0;
            if (previousPosition) {
                const prevLatLng = L.latLng([previousPosition.lat, previousPosition.lng]);
                bearing = calculateBearing(prevLatLng, endLatLng);
            }

            // Apply rotation to the icon element
            if (marker.getElement()) {
                marker.getElement().style.transform += ` rotate(${bearing}deg)`;
            }

            // Animate the position smoothly
            const startTime = performance.now();
            const animate = (currentTime) => {
                const progress = Math.min(1, (currentTime - startTime) / DURATION);
                const lat = startLatLng.lat + (endLatLng.lat - startLatLng.lat) * progress;
                const lng = startLatLng.lng + (endLatLng.lng - startLatLng.lng) * progress;
                marker.setLatLng([lat, lng]);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    marker.setLatLng(endLatLng);
                }
            };
            requestAnimationFrame(animate);

            // Pan the map to follow the vehicle
            map.panTo(endLatLng, { animate: true, duration: DURATION / 1000 });
        }
    }, [currentPosition, previousPosition, map]);

    if (!currentPosition) return null;

    // Use [0,0] as initial position before first real position is set
    const initialPos = currentPosition ? [currentPosition.lat, currentPosition.lng] : [0, 0];

    return (
        <Marker ref={markerRef} position={initialPos} icon={icon}>
            <Popup>
                <strong>Time:</strong> {new Date(info.timestamp).toLocaleTimeString()} <br />
                <strong>Coords:</strong> {info.lat.toFixed(4)}, {info.lng.toFixed(4)}
            </Popup>
        </Marker>
    );
}

export default AnimatedMarker;