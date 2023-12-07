import React from "react";
import ReactDOM from "react-dom";
import Sidebar from "./components/Sidebar";

// setting up mapbox
mapboxgl.accessToken =
  "pk.eyJ1IjoiZ29yZGlhbmtub3QiLCJhIjoiY2xwc2lpcG44MDNldjJsbjRyM3A4MzRhcCJ9.T2nM6_liTVQLFoY7tODmsA";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/gordianknot/clpsinpul00rn01qmhypo9ylx",
  center: [-71.4133874025074, 41.829073165077446],
  pitch: 0,
  zoom: 12,
});

ReactDOM.render(<Sidebar map={map} />, document.getElementById("sidebar"));

function formatHTMLforMarker(props) {
  var { spp, pittype, address, onstr } = props;
  console.log(props);
  var html =
    '<div class="marker-title">' +
    spp +
    "</div>" +
    "<h4>Pit Type</h4>" +
    "<span>" +
    pittype +
    "</span>" +
    "<h4>Address</h4>" +
    "<span>" +
    address + ' ' + onstr
    "</span>";
  return html;
}

// setup popup display on the marker
map.on("click", function (e) {
  var features = map.queryRenderedFeatures(
    e.point, 
    { layers: ['trees', 'trees-highlight'], radius: 8, includeGeometry: true }
  );

  if (!features.length) return;

  var feature = features[0];
  console.log(feature)
  new mapboxgl.Popup()
    .setLngLat(feature.geometry.coordinates)
    .setHTML(formatHTMLforMarker(feature.properties))
    .addTo(map);
});
