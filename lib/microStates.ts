// lib/microStates.ts
//
// États souverains trop petits pour apparaître (ou être cliquables) dans le
// jeu de données world-atlas 110m utilisé pour le tracé de la carte. Rendus
// séparément sous forme de points (Marker) plutôt que de polygones.
// Coordonnées calculées via le centroïde géographique (d3-geo) des mêmes
// entités dans le jeu de données world-atlas 50m.

export type MicroState = {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
};

export const MICRO_STATES: MicroState[] = [
  { name: "Vatican", coordinates: [12.4343, 41.9021] },
  { name: "Micronesia", coordinates: [153.2966, 7.5361] },
  { name: "Marshall Is.", coordinates: [170.3313, 7.015] },
  { name: "Tonga", coordinates: [-174.7998, -20.4161] },
  { name: "Singapore", coordinates: [103.817, 1.359] },
  { name: "Seychelles", coordinates: [55.476, -4.6601] },
  { name: "São Tomé and Principe", coordinates: [6.7235, 0.4434] },
  { name: "San Marino", coordinates: [12.4594, 43.9415] },
  { name: "Samoa", coordinates: [-172.1649, -13.7536] },
  { name: "St. Vin. and Gren.", coordinates: [-61.2008, 13.2251] },
  { name: "Saint Lucia", coordinates: [-60.9696, 13.8946] },
  { name: "St. Kitts and Nevis", coordinates: [-62.6873, 17.2647] },
  { name: "Palau", coordinates: [134.4056, 7.286] },
  { name: "Nauru", coordinates: [166.9326, -0.5189] },
  { name: "Monaco", coordinates: [7.4073, 43.7526] },
  { name: "Mauritius", coordinates: [57.5714, -20.2779] },
  { name: "Malta", coordinates: [14.405, 35.9215] },
  { name: "Maldives", coordinates: [73.4573, 3.7316] },
  { name: "Liechtenstein", coordinates: [9.5357, 47.1367] },
  { name: "Kiribati", coordinates: [-167.9217, 0.893] },
  { name: "Grenada", coordinates: [-61.6818, 12.1174] },
  { name: "Dominica", coordinates: [-61.3576, 15.4394] },
  { name: "Comoros", coordinates: [43.6844, -11.879] },
  { name: "Cabo Verde", coordinates: [-23.9576, 15.9551] },
  { name: "Barbados", coordinates: [-59.5602, 13.1811] },
  { name: "Bahrain", coordinates: [50.5425, 26.0417] },
  { name: "Antigua and Barb.", coordinates: [-61.7945, 17.2762] },
  { name: "Andorra", coordinates: [1.5606, 42.542] },
];
