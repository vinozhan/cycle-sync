import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icons broken by bundlers (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const pinSvg = (color) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="41">
  <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1.5"/>
  <circle cx="12" cy="12" r="5" fill="white"/>
</svg>`;

export const startIcon = L.divIcon({
  html: pinSvg('#10b981'),
  className: '',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -36],
});

export const endIcon = L.divIcon({
  html: pinSvg('#ef4444'),
  className: '',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -36],
});
