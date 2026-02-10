import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import '../../utils/leafletSetup';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';

// Child component that handles map click events
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Child component that flies to a position
const FlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1 });
    }
  }, [position, map]);
  return null;
};

const LocationPicker = ({ label, value, onChange, className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [flyTarget, setFlyTarget] = useState(null);
  const debounceRef = useRef(null);

  // value is [lng, lat] (GeoJSON), convert to [lat, lng] for Leaflet
  const markerPosition = value && value[0] !== '' && value[1] !== ''
    ? [Number(value[1]), Number(value[0])]
    : null;

  const handleMapClick = (latLng) => {
    // Convert [lat, lng] back to [lng, lat] for GeoJSON
    onChange([latLng[1], latLng[0]]);
    setSuggestions([]);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search as user types
  const handleQueryChange = (val) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    onChange([lng, lat]); // GeoJSON [lng, lat]
    setFlyTarget([lat, lng]);
    setSearchQuery(item.display_name.split(',').slice(0, 2).join(','));
    setSuggestions([]);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      {/* Search bar */}
      <div className="relative mb-2">
        <form onSubmit={handleSearch} className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search location..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </form>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute z-[1000] mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {suggestions.map((item) => (
              <li key={item.place_id}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(item)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {item.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={markerPosition || DEFAULT_MAP_CENTER}
          zoom={markerPosition ? 15 : DEFAULT_MAP_ZOOM}
          scrollWheelZoom={true}
          className="h-[300px] w-full cursor-crosshair"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {flyTarget && <FlyTo position={flyTarget} />}
          {markerPosition && <Marker position={markerPosition} />}
        </MapContainer>
      </div>

      {/* Coordinates display */}
      {markerPosition && (
        <p className="mt-1 text-xs text-gray-400">
          {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
