// RECEIVE VARIABLES FROM EJS TO JS.
// EJS variables in ejs tags <%- %> are not available here.
// mapToken is defined in show.ejs at the top of the code.
// We use it to store MAPBOX_TOKEN from process.env and pass here.
mapboxgl.accessToken = mapToken;
// Convert from JSON string back to object.
cg = JSON.parse(campground)
// console.log(cg)

// If campground has geometry data.
// if (campground.geometry) {
const coordinates = cg.geometry.coordinates


// Create map if CG has coordinates.
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: coordinates.length ? coordinates : [0, 0], // starting position [lng, lat]
  zoom: 4, // starting zoom
});


// Set marker with options.
const marker = new mapboxgl.Marker()
  .setLngLat(coordinates.length ? coordinates : [0, 0])
  .setPopup(
    new mapboxgl.Popup({ offset: 25})
      .setHTML(
        `<h4>${cg.title}</h4><p>${cg.location}</p>`
      )
  )
  .addTo(map);
// }

