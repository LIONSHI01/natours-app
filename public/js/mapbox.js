/* eslint-disable*/
console.log('hello from the client side');
// Since locations data are stored in MongoDB, so cannot import to this file directly, so export location data to HTML and retrieve from HTML
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoibXJsaW9uOTEiLCJhIjoiY2w1NWVzaW1yMTQwYzNpbjU2ejVoNW8wMCJ9.FCdfywynoFEVQU3KwzXoZg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mrlion91/cl561w442000014o69o3vz9sv',
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

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 200,
    left: 100,
    right: 200,
  },
});
