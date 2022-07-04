/* eslint-disable*/
console.log('hello from the client side');
// Since locations data are stored in MongoDB, so cannot import to this file directly, so export location data to HTML and retrieve from HTML
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoibXJsaW9uOTEiLCJhIjoiY2w1NWVzaW1yMTQwYzNpbjU2ejVoNW8wMCJ9.FCdfywynoFEVQU3KwzXoZg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
