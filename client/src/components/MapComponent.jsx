import  { useEffect, useRef, useState } from 'react';
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

const MapComponent = ({ onLocationSelect, defaultLocation }) => {
    const mapRef = useRef(null);
    const [location, setLocation] = useState(defaultLocation || { lat: 28.209630467376773, lng: 83.98559757010933 });

    useEffect(() => {
        // Initialize the map
        const map = L.map(mapRef.current).setView([location.lat, location.lng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add marker at default location
        const marker = L.marker([location.lat, location.lng], { icon: markerIcon }).addTo(map)
            .bindPopup(`Latitude: ${location.lat}, Longitude: ${location.lng}`)
            .openPopup();

        // Handle map clicks
        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setLocation({ lat, lng });
            onLocationSelect({ lat, lng });

            map.setView([lat, lng], 15);

            // Move marker to the new location
            marker.setLatLng([lat, lng])
                .bindPopup(`Latitude: ${lat}, Longitude: ${lng}`)
                .openPopup();
        });

        // Cleanup on unmount
        return () => {
            map.off();
            map.remove();
        };
    }, [onLocationSelect, location.lat, location.lng]);

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
                value={`${location.lat}, ${location.lng}`}
            />
            <span className='block text-sm font-medium text-gray-600 mb-1'>Click on the map to select your location</span>
            <div ref={mapRef} className="w-full h-64 border-2 border-gray-300 rounded-md"></div>
        </div>
    );
};

export default MapComponent;
