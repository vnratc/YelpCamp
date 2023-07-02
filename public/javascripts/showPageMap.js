// RECEIVE VARIABLES FROM EJS TO JS.
// EJS variables in ejs tags <%- %> are not available here.
// mapToken is defined in show.ejs at the top of the code.
// We use it to store MAPBOX_TOKEN from process.env and pass here.
mapboxgl.accessToken = mapToken;
const coordinates = campground.geometry.coordinates


// Create map if CG has coordinates.
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v11', // style URL
  center: coordinates.length ? coordinates : [0, 0], // starting position [lng, lat]
  zoom: 4, // starting zoom
});


// Set marker with options.
const marker = new mapboxgl.Marker()
  .setLngLat(coordinates.length ? coordinates : [0, 0])
  .setPopup(
    new mapboxgl.Popup({ offset: 25})
      .setHTML(
        `<h4>${campground.title}</h4><p>${campground.location}</p>`
      )
  )
  .addTo(map);

// Add navigation control
const nav = new mapboxgl.NavigationControl({
  showCompas: true,
  showZoom: true,
  visualizePitch: true
})
map.addControl(nav, "top-right")