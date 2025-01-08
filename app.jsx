// \ ************* EXAMPLE CODE ******************* \
// First make a venv so the install don't affect your computer
// Then run npm install within the venv, make sure you have the provided package.json file
// Then run npm start
// Required Docs: from Notion: app.tsx , package.json, converted_to_wgs84_geojson.geojson
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map, NavigationControl } from 'react-map-gl/maplibre';
import { PolygonLayer } from 'deck.gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import * as d3Geo from 'd3-geo'; // D3 for geographical projections
import 'maplibre-gl/dist/maplibre-gl.css';
import proj4 from "proj4";

const INITIAL_VIEW_STATE = {
  latitude: 46.8625,
  longitude: 103.8467,
  zoom: 5.5,
  bearing: 0,
  pitch: 0,
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// Define the projection transformation from EPSG:32646 (UTM Zone 46N) to WGS84
proj4.defs("EPSG:32646", "+proj=utm +zone=46 +datum=WGS84 +units=m +no_defs");
function Root() {
  const [hexagons, setHexagons] = useState([]);

   // use this useEffect to import the data and then 
  useEffect(() => {
    // Fetch the GeoJSON data
    fetch('converted_to_wgs84_geojson.geojson')
      .then((response) => response.json())
      .then((geojsonData) => {
       

        // decalare a d3 projection to project these points world coords onto a 2d plane
        const projection = d3Geo.geoMercator(); // Look up other d3-geo projections see which one works 

        const hexagonsForDeckGL = geojsonData.features.map((feature, index) => {
          const projectedPolygon = feature.geometry.coordinates[0].map(projection);
          const invertedPolygon = projectedPolygon.map(projection.invert);
          return {
            vertices: invertedPolygon, // Polygon vertices
          };
        });
        setHexagons(hexagonsForDeckGL);
      });
  }, []);

  // Will render filled or stroked polygons on the map.
  // docs : https://deck.gl/docs/api-reference/layers/polygon-layer
  const hexagonLayer = new PolygonLayer({
    id: 'd3-hexagon-layer',
    data: hexagons,
    getPolygon: (d) => d.vertices,
    // stroked: true,
    filled: true,
    getLineColor: [0,0,0],
    getFillColor: [0, 0, 0, 0], 
    lineWidthMinPixels: 1, 
    pickable: true, 
    autoHighlight: true, 
    highlightColor: [20, 20, 20, 20], 
    onHover: (d) => {console.log(d)}
  });

  // This bridges Deck.gl and MapLibre. It integrates Deck.gl layers into the MapLibre map
  // docs : https://deck.gl/docs/api-reference/mapbox/mapbox-overlay
  const handleMapLoad = (event) => {
    const map = event.target;
    const overlay = new MapboxOverlay({ layers: [hexagonLayer] }); 
    map.addControl(overlay);
  };

  // Map will be loaded when handleMapLoad is called
  return (
    <Map
      id="map"
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      style={{ width: '100vw', height: '100vh' }}
      onLoad={handleMapLoad}
    >
      <NavigationControl position="top-left" />
    </Map>
  );
}

/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);
// \ ************* EXAMPLE CODE ******************* \