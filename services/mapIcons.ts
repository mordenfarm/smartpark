import L from 'leaflet';

const iconBase = {
  iconSize: [30, 42] as [number, number],
  iconAnchor: [15, 42] as [number, number],
  popupAnchor: [0, -42] as [number, number],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [41, 41] as [number, number],
  shadowAnchor: [12, 41] as [number, number],
};

const smallIconBase = {
  iconSize: [22, 31] as [number, number],
  iconAnchor: [11, 31] as [number, number],
  popupAnchor: [0, -31] as [number, number],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  shadowSize: [30, 30] as [number, number],
  shadowAnchor: [9, 30] as [number, number],
};

export const greenIcon = new L.Icon({
  ...iconBase,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
});

export const redIcon = new L.Icon({
  ...iconBase,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
});

export const blueIcon = new L.Icon({
    ...iconBase,
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
});

// New icons for slots
export const greenSlotIcon = new L.Icon({
  ...smallIconBase,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
});

export const redSlotIcon = new L.Icon({
  ...smallIconBase,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
});
