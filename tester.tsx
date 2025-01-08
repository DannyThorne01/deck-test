// First make a venv so the install don't affect your computer
// Then run npm install within the venv, make sure you have the provided package.json file
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Map, NavigationControl } from 'react-map-gl/maplibre';
import { PolygonLayer } from 'deck.gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import * as d3Geo from 'd3-geo';  // D3 for geographical projections
import 'maplibre-gl/dist/maplibre-gl.css';
import * as d3 from "d3";


// Set the intial view state
const INITIAL_VIEW_STATE = {
  latitude: 37.8,  
  longitude: -96,
  zoom: 4,
  bearing: 0,
  pitch: 0,
};

// declare the mao from maplibre
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

function Root() {

  const [hexagons, setHexagons] = useState([]);
  // use this useEffect to import the data and then 
  useEffect(() => {
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/us_states_hexgrid.geojson.json").then((geojsonData)=>{

      // decalare a d3 projection to project these points world coords onto a 2d plane
      const projection = d3.geoMercator() // Look up other d3-geo projections see which one works 

      // Now we apply the project to each hexagon and then invert the project so that deck.gl can use it 
      // .map() : is a function that loops through every element and applies a function to each element. So it's like a hidden loop

      // SETUP: 
      // <list_to_loop_over>.map((<element_of_list>) => {code to apply to each element})
      // NOTE: (<element_of_list>) => {code to apply to each element} this the function that we pass to Map, it's just an anonymous function 
      const deckHexProj = geojsonData.features.map((feature)=>{
        // print out the feature so you can see what it looks like and how to manipulate it
        console.log(feature);
        // print out other attributes of the feature
        console.log(feature.geometry.coordinates);

        // apply projection from above to each coordinate of hexagon
        // Remember each feature is a hexagon and the feature has 7 coordinates representing the
        // points of the hexagon (1 coord is repeated so that's why its 7 instead of 6)
        // so we'll need to loop over each coord in the feature and then apply the projection function  ... use map again to do this
        // do the same for 

        const projectedPolygon = feature.geometry.coordinates[0].map(...) //complete code
        const invertedPolygon = projectedPolygon.map(...) //complete code

        return {
          vertices: invertedPolygon
        }
      });
      setHexagons(deckHexProj) // set the state variable now that we have processed the data
    }); // end of d3.json data fetch 
  },[] );// end of useEffect

  // Define a DeckGL PolygonLayer to render the hexagons
  const hexagonLayer = new PolygonLayer({
    id: 'd3-hexagon-layer',
    data: hexagons, // pass the data
    getPolygon: d => d.vertices,  // Each hexagon's vertices
    stroked: true,
    filled: true,
    getLineColor: [0, 0, 0],  
    getFillColor: [0, 150, 136, 180],  
    lineWidthMinPixels: 1,
    autoHighlight: true,
  });

  const handleMapLoad = (event) => {
    const map = event.target;  // Map object becomes available when the map is loaded
    const overlay = new MapboxOverlay({ layers: [hexagonLayer] });  // Create the DeckGL overlay with hexagonLayer
    map.addControl(overlay);  // Add the overlay to the map
  };

  return (
    <Map
      id="map"
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      style={{ width: '100vw', height: '100vh' }}
      onLoad={handleMapLoad}  // Add the onLoad event to ensure map is ready
    >
    </Map>
  );

};
/* global document */
const container = document.body.appendChild(document.createElement('div'));
createRoot(container).render(<Root />);