/* eslint-disable*/

// Since locations data are stored in MongoDB, so cannot import to this file directly, so export location data to HTML and retrieve from HTML
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoibXJsaW9uOTEiLCJhIjoiY2w1NWVzaW1yMTQwYzNpbjU2ejVoNW8wMCJ9.FCdfywynoFEVQU3KwzXoZg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mrlion91/cl561w442000014o69o3vz9sv',
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';
  // Add marker
  new mapboxgl.Marker({
    elment: el,
    ancor: 'bottom', //set ancor at the bottom of the marker image
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add Popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 200,
  },
});
