
// src/components/VehicleMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import AnimatedMarker from './AnimatedMarker';

const INITIAL_CENTER = [17.385044, 78.486671];

// We'll use an SVG for the icon so we can easily rotate it
const vehicleIcon = L.divIcon({
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-blue-600 drop-shadow-lg">
            <path d="M5.503 4.627 6.13 2.422a1.43 1.43 0 0 1 2.768 0l.628 2.205 5.28-.002c1.783 0 2.532 2.147 1.39 3.355l-4.108 4.412.002 5.28a1.43 1.43 0 0 1-2.86 0l-.002-5.28-4.108-4.412C3.51 6.774 4.25 4.627 6.032 4.627l-.53-.002Z" />
        </svg>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 16] // Anchor in the center
});

// Define our two map tile URLs
const mapTiles = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};
const satelliteAttribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

function VehicleMap() {
    const [routeData, setRouteData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [mapStyle, setMapStyle] = useState('street'); // State for the map style
    const intervalRef = useRef(null);
    const SIMULATION_SPEED = 1000; // 1 second per step

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/route');
                const formattedData = response.data.map(p => ({ lat: p.latitude, lng: p.longitude, timestamp: p.timestamp }));
                setRouteData(formattedData);
            } catch (error) {
                console.error("Error loading route data:", error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (isPlaying && currentIndex < routeData.length - 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prev => prev + 1);
            }, SIMULATION_SPEED);
        } else if (currentIndex >= routeData.length - 1) {
            setIsPlaying(false); // Stop at the end of the route
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, currentIndex, routeData]);

    const handlePlayPause = () => {
        if (currentIndex >= routeData.length - 1) {
            // If at the end, reset to the beginning
            setCurrentIndex(0);
        }
        setIsPlaying(!isPlaying);
    };

    const handleSliderChange = (e) => {
        setIsPlaying(false); // Pause when scrubbing
        setCurrentIndex(Number(e.target.value));
    };

    if (routeData.length === 0) {
        return <div className="flex h-screen w-full items-center justify-center">Loading map data...</div>;
    }

    const currentPosition = routeData[currentIndex];
    const previousPosition = routeData[currentIndex - 1]; // Needed for bearing
    const fullRouteCoords = routeData.map(p => [p.lat, p.lng]);
    const traveledRouteCoords = routeData.slice(0, currentIndex + 1).map(p => [p.lat, p.lng]);

    return (
        <div className="h-screen w-full relative">
            <MapContainer center={INITIAL_CENTER} zoom={15} className="h-full w-full z-0">
                {/* The TileLayer component will now re-render when mapStyle changes */}
                <TileLayer
                    key={mapStyle} // Adding a key ensures React replaces the layer
                    url={mapTiles[mapStyle]}
                    attribution={mapStyle === 'street' ? '&copy; OpenStreetMap' : satelliteAttribution}
                />
                
                {/* Full route (gray) */}
                <Polyline pathOptions={{ color: 'gray', weight: 4, opacity: 0.6 }} positions={fullRouteCoords} />
                
                {/* Traveled route (blue) */}
                <Polyline pathOptions={{ color: '#0ea5e9', weight: 5, opacity: 1 }} positions={traveledRouteCoords} />
                
                {/* Our new AnimatedMarker */}
                <AnimatedMarker 
                    currentPosition={currentPosition}
                    previousPosition={previousPosition}
                    icon={vehicleIcon}
                    info={currentPosition}
                />
            </MapContainer>

            {/* --- Control Panel --- */}
            <div className="absolute top-4 right-4 z-[1000] p-4 bg-white/90 backdrop-blur-sm shadow-xl rounded-lg w-full max-w-sm">
                <h2 className="text-xl font-bold mb-3">Trip Controls</h2>
                
                {/* Map Style Switcher */}
                <div className="mb-4">
                    <span className="text-sm font-bold text-gray-600">Map Style</span>
                    <div className="flex gap-2 mt-1">
                        <button 
                            onClick={() => setMapStyle('street')} 
                            className={`flex-1 text-sm py-1 rounded transition-colors ${mapStyle === 'street' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                            Street
                        </button>
                        <button 
                            onClick={() => setMapStyle('satellite')} 
                            className={`flex-1 text-sm py-1 rounded transition-colors ${mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                            Satellite
                        </button>
                    </div>
                </div>

                {/* Playback Slider */}
                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max={routeData.length - 1}
                        value={currentIndex}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb-blue"
                    />
                    <div className="flex justify-between text-xs font-mono text-gray-500">
                        <span>{new Date(routeData[0].timestamp).toLocaleTimeString()}</span>
                        <span>{new Date(routeData[routeData.length - 1].timestamp).toLocaleTimeString()}</span>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="mt-4 flex items-center justify-center">
                    <button 
                        onClick={handlePlayPause} 
                        className="px-6 py-2 text-white font-semibold rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 w-full"
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Custom style for the slider thumb
const styles = document.createElement('style');
styles.innerHTML = `
.range-thumb-blue::-webkit-slider-thumb {
    background-color: #2563eb;
}
.range-thumb-blue::-moz-range-thumb {
    background-color: #2563eb;
}
`;
document.head.appendChild(styles);


export default VehicleMap;