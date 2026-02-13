import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import '../../utils/leafletSetup';
import { startIcon, endIcon } from '../../utils/leafletSetup';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../utils/constants';

const RouteMap = ({ route, className = '' }) => {
  // Model stores { lat, lng } objects
  const startLatLng = route?.startPoint ? [route.startPoint.lat, route.startPoint.lng] : null;
  const endLatLng = route?.endPoint ? [route.endPoint.lat, route.endPoint.lng] : null;

  const center = startLatLng || DEFAULT_MAP_CENTER;

  // Build polyline from waypoints or start/end
  const polylinePositions = [];
  if (startLatLng) polylinePositions.push(startLatLng);
  if (route?.waypoints?.length) {
    route.waypoints.forEach((wp) => {
      if (wp.lat != null && wp.lng != null) {
        polylinePositions.push([wp.lat, wp.lng]);
      }
    });
  }
  if (endLatLng) polylinePositions.push(endLatLng);

  // Decode ORS polyline if available
  if (route?.polyline) {
    try {
      const decoded = decodePolyline(route.polyline);
      if (decoded.length > 0) {
        polylinePositions.length = 0;
        polylinePositions.push(...decoded);
      }
    } catch {
      // Fall back to waypoints
    }
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 ${className}`}>
      <MapContainer
        center={center}
        zoom={startLatLng ? 14 : DEFAULT_MAP_ZOOM}
        scrollWheelZoom={false}
        className="h-[300px] w-full sm:h-[400px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
          <Polyline
            positions={polylinePositions}
            color="#059669"
            weight={4}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

// Decode Google-encoded polyline string
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
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

export default RouteMap;
