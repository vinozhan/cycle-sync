import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import { HiMagnifyingGlass, HiViewfinderCircle, HiExclamationTriangle } from 'react-icons/hi2';
import '../../utils/leafletSetup';
import { startIcon, endIcon, hazardIcon } from '../../utils/leafletSetup';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';
import api from '../../services/api';

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const FlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1 });
    }
  }, [position, map]);
  return null;
};

const FitBounds = ({ start, end }) => {
  const map = useMap();
  const prevKey = useRef('');
  useEffect(() => {
    if (start && end) {
      const key = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
      if (key !== prevKey.current) {
        prevKey.current = key;
        map.fitBounds(
          [[start.lat, start.lng], [end.lat, end.lng]],
          { padding: [50, 50], maxZoom: 15 }
        );
      }
    }
  }, [start, end, map]);
  return null;
};

function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

const RouteBuilder = ({ onRouteData, className = '' }) => {
  const [mode, setMode] = useState('start');
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routePreview, setRoutePreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);

  const [showHazards, setShowHazards] = useState(false);
  const [hazards, setHazards] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!showHazards) return;
    const fetchHazards = async () => {
      try {
        const { data } = await api.get('/reports', {
          params: { status: 'open', limit: 100 },
        });
        setHazards(data.data.items);
      } catch {
        setHazards([]);
      }
    };
    fetchHazards();
  }, [showHazards]);

  const notify = (sp, ep, preview) => {
    onRouteData({
      startPoint: sp,
      endPoint: ep,
      distance: preview?.distance || null,
      duration: preview?.duration || null,
      elevationGain: preview?.elevationGain || null,
      polyline: preview?.polyline || '',
    });
  };

  const fetchPreview = async (start, end) => {
    setLoadingPreview(true);
    try {
      const { data } = await api.post('/routes/preview', { start, end });
      setRoutePreview(data.data);
      notify(start, end, data.data);
    } catch {
      const fallback = haversineFallback(start, end);
      setRoutePreview(fallback);
      notify(start, end, fallback);
    } finally {
      setLoadingPreview(false);
    }
  };

  const haversineFallback = (start, end) => {
    const R = 6371;
    const dLat = ((end.lat - start.lat) * Math.PI) / 180;
    const dLng = ((end.lng - start.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((start.lat * Math.PI) / 180) *
        Math.cos((end.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = parseFloat((R * c).toFixed(2));
    return {
      distance,
      duration: parseFloat(((distance / 15) * 60).toFixed(1)),
      elevationGain: 0,
      polyline: '',
    };
  };

  const handleMapClick = (coords) => {
    let newStart = startPoint;
    let newEnd = endPoint;

    if (mode === 'start') {
      newStart = coords;
      setStartPoint(coords);
      setRoutePreview(null);
      setMode('end');
    } else {
      newEnd = coords;
      setEndPoint(coords);
    }

    setSuggestions([]);
    notify(newStart, newEnd, null);

    if (newStart && newEnd) {
      fetchPreview(newStart, newEnd);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=lk&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  };

  const handleQueryChange = (val) => {
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 3) {
      debounceRef.current = setTimeout(() => handleSearch(), 500);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const coords = { lat, lng };

    let newStart = startPoint;
    let newEnd = endPoint;

    if (mode === 'start') {
      newStart = coords;
      setStartPoint(coords);
      setRoutePreview(null);
      setMode('end');
    } else {
      newEnd = coords;
      setEndPoint(coords);
    }

    setFlyTarget([lat, lng]);
    setSearchQuery('');
    setSuggestions([]);

    notify(newStart, newEnd, null);

    if (newStart && newEnd) {
      fetchPreview(newStart, newEnd);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = { lat: latitude, lng: longitude };

        let newStart = startPoint;
        let newEnd = endPoint;

        if (mode === 'start') {
          newStart = coords;
          setStartPoint(coords);
          setRoutePreview(null);
          setMode('end');
        } else {
          newEnd = coords;
          setEndPoint(coords);
        }

        setFlyTarget([latitude, longitude]);
        setSuggestions([]);
        notify(newStart, newEnd, null);

        if (newStart && newEnd) {
          fetchPreview(newStart, newEnd);
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleReset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoutePreview(null);
    setMode('start');
    setSearchQuery('');
    setSuggestions([]);
    notify(null, null, null);
  };

  // Build polyline positions
  const polylinePositions = [];
  if (routePreview?.polyline) {
    try {
      const decoded = decodePolyline(routePreview.polyline);
      if (decoded.length > 0) polylinePositions.push(...decoded);
    } catch { /* fall back to straight line */ }
  }
  if (polylinePositions.length === 0 && startPoint && endPoint) {
    polylinePositions.push([startPoint.lat, startPoint.lng], [endPoint.lat, endPoint.lng]);
  }

  const startLatLng = startPoint ? [startPoint.lat, startPoint.lng] : null;
  const endLatLng = endPoint ? [endPoint.lat, endPoint.lng] : null;

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Route Points
      </label>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('start')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'start'
              ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 mr-1.5" />
          Start {startPoint ? '(set)' : ''}
        </button>
        <button
          type="button"
          onClick={() => setMode('end')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'end'
              ? 'bg-red-100 text-red-800 ring-2 ring-red-500'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5" />
          End {endPoint ? '(set)' : ''}
        </button>
        {(startPoint || endPoint) && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Search bar + locate */}
      <div className="relative mb-2">
        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="relative flex-1">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={`Search ${mode} location...`}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </form>
          <button
            type="button"
            onClick={handleLocate}
            disabled={locating}
            title="Use my location"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <HiViewfinderCircle className={`h-4 w-4 ${locating ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{locating ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>

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

      {/* Hazard overlay toggle */}
      <label className="mb-2 flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={showHazards}
          onChange={(e) => setShowHazards(e.target.checked)}
          className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
        />
        <HiExclamationTriangle className="h-4 w-4 text-amber-500" />
        Show hazard reports
      </label>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <MapContainer
          center={DEFAULT_MAP_CENTER}
          zoom={DEFAULT_MAP_ZOOM}
          scrollWheelZoom={true}
          className="h-[300px] w-full cursor-crosshair sm:h-[400px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          {flyTarget && <FlyTo position={flyTarget} />}
          {startPoint && endPoint && <FitBounds start={startPoint} end={endPoint} />}

          {startLatLng && (
            <Marker position={startLatLng} icon={startIcon}>
              <Popup>Start Point</Popup>
            </Marker>
          )}
          {endLatLng && (
            <Marker position={endLatLng} icon={endIcon}>
              <Popup>End Point</Popup>
            </Marker>
          )}

          {polylinePositions.length >= 2 && (
            <Polyline positions={polylinePositions} color="#059669" weight={4} opacity={0.8} />
          )}

          {showHazards && hazards.map((h) => (
            h.location?.lat && h.location?.lng && (
              <Marker key={h._id} position={[h.location.lat, h.location.lng]} icon={hazardIcon}>
                <Popup>
                  <span className="font-medium">{h.title}</span><br />
                  <span className="text-xs capitalize text-gray-500">
                    {h.severity} · {h.category?.replace('_', ' ')}
                  </span>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Route info */}
      {loadingPreview && (
        <p className="mt-2 text-sm text-gray-500 animate-pulse">Calculating route...</p>
      )}
      {routePreview && !loadingPreview && (
        <div className="mt-2 flex flex-wrap gap-4 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          <span className="font-medium">{routePreview.distance} km</span>
          <span>{routePreview.duration} min</span>
          {routePreview.elevationGain > 0 && (
            <span>{routePreview.elevationGain} m elevation</span>
          )}
        </div>
      )}

      {/* Coordinate display */}
      <div className="mt-1 flex gap-4 text-xs text-gray-400">
        {startPoint && (
          <span>Start: {startPoint.lat.toFixed(5)}, {startPoint.lng.toFixed(5)}</span>
        )}
        {endPoint && (
          <span>End: {endPoint.lat.toFixed(5)}, {endPoint.lng.toFixed(5)}</span>
        )}
      </div>
    </div>
  );
};

export default RouteBuilder;
