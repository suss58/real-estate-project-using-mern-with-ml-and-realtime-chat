
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet Marker Icon (Make sure the icon URL is correct or use a local icon)
const markerIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
});

const MapComponent = () => {
    const mapRef = useRef(null);
    const [location, setLocation] = useState({ lat: null, lng: null });

    useEffect(() => {
        // Initialize the map
        const map = L.map(mapRef.current).setView([27.7172, 85.3240], 13); // Center on Kathmandu, for example

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Handle map clicks
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setLocation({ lat, lng });
            map.setView([lat, lng], 15); // Center and zoom the map to the selected location

            // Clear previous marker
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Add a new marker
            L.marker([lat, lng], { icon: markerIcon }).addTo(map)
                .bindPopup(`Latitude: ${lat}, Longitude: ${lng}`)
                .openPopup();
        });

        // Cleanup on unmount
        return () => {
            map.off();
            map.remove();
        };
    }, []);

    return (
        <div>
            <label htmlFor="location" className='block text-sm font-medium text-gray-700'>Select Your Location</label>
            <input
                className='border-2 border-gray-300 focus:border-brand-blue rounded-md py-2 px-3 bg-white w-full mb-2'
                type="text"
                name="location"
                id="location"
                placeholder="Latitude, Longitude"
                readOnly
                value={`${location.lat || ''}, ${location.lng || ''}`}
            />
            <span className='block text-sm font-medium text-gray-600 mb-1'>Click on the map to select your location</span>
            <div ref={mapRef} className="w-full h-64 border-2 border-gray-300 rounded-md"></div>
        </div>
    );
};

export default MapComponent;
