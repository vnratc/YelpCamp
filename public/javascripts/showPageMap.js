// RECEIVE VARIABLES FROM EJS TO JS.
// EJS variables in ejs tags <%- %> are not available here.
// mapToken is defined in show.ejs at the top of the code.
// We use it to store MAPBOX_TOKEN from process.env and pass here.
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 4, // starting zoom
});