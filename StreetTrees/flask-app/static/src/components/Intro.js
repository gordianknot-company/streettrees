import React from "react";

export default function Intro() {
  return (
    <div className="intro">
      <h3>About</h3>
      <p>
        This is the Providence Tree Mapper. 
      </p>
      <p>
        The app is built with Flask on the backend and Elasticsearch is the
        engine powering the search. Mapbox provides the map layer. 
      </p>
      <p>
        The data for the street tree locations is made available by the 
        {" "}
        <a href="https://data.providenceri.gov/Neighborhoods/Providence-Tree-Dataset/b77h-59tz">
          City of Providence Open Data Portal
        </a>.
      </p>
    </div>
  );
}
