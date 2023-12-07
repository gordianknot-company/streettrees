import React from "react";
import request from "superagent";
import Intro from "./Intro";

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      query: "",
      firstLoad: true,
    };
    this.onChange = this.onChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleHover = this.handleHover.bind(this);
  }

  fetchResults() {
    request.get("/search?q=" + this.state.query).end((err, res) => {
      if (err) {
        alert("error in fetching response");
      } else {
        this.setState({
          results: res.body,
          firstLoad: false,
        });
        this.plotOnMap();
      }
    });
  }

  generateGeoJSON(markers) {
    return {
      type: "FeatureCollection",
      features: markers.map((p) => ({
        type: "Feature",
        properties: {
          spp: p.spp,
          pittype: p.pittype,
          address: p.address,
          onstr: p.onstr,
          "point-color": "59,120,23,1",
        },
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(p.location.longitude),
            parseFloat(p.location.latitude),
          ],
        },
      })),
    };
  }

  plotOnMap(vendor) {
    console.log(vendor)
    const map = this.props.map;
    const results = this.state.results;
    const markers = [].concat.apply(
      [],
      results.trees.map((t) =>({
        location: t.location,
        spp: t.spp,
        address: t.address,
        onstr: t.onstr,
        pittype: t.pittype
      })
      )
    );
    var highlightMarkers, usualMarkers, usualgeoJSON, highlightgeoJSON;

    highlightMarkers = markers;
    usualMarkers = markers;

    usualgeoJSON = this.generateGeoJSON(usualMarkers);
    if (highlightMarkers) {
      highlightgeoJSON = this.generateGeoJSON(highlightMarkers);
    }
    // clearing layers
    if (map.getLayer("trees")) {
      map.removeLayer("trees");
    }
    if (map.getSource("trees")) {
      map.removeSource("trees");
    }
    if (map.getLayer("trees-highlight")) {
      map.removeLayer("trees-highlight");
    }
    if (map.getSource("trees-highlight")) {
      map.removeSource("trees-highlight");
    }

    map
      .addSource("trees", {
        type: "geojson",
        data: usualgeoJSON,
      })
      .addLayer({
        id: "trees",
        type: "circle",
        interactive: true,
        source: "trees",
        paint: {
          "circle-radius": 3,
          "circle-color": "rgba(59,120,23,1)",
        },
      });

    if (highlightMarkers) {
      map
        .addSource("trees-highlight", {
          type: "geojson",
          data: highlightgeoJSON,
        })
        .addLayer({
          id: "trees-highlight",
          type: "circle",
          interactive: true,
          source: "trees-highlight",
          paint: {
            "circle-radius": 3,
            "circle-color": "rgba(59,120,23,1)",
          },
        });
    }
  }

  handleSearch(e) {
    e.preventDefault();
    this.fetchResults();
  }

  onChange(e) {
    this.setState({ query: e.target.value });
  }

  handleHover(vendorName) {
    console.log(vendorName)
    this.plotOnMap(vendorName);
  }

  render() {
    if (this.state.firstLoad) {
      return (
        <div>
          <div id="search-area">
            <form onSubmit={this.handleSearch}>
              <input
                type="text"
                value={this.state.query}
                onChange={this.onChange}
                placeholder="Enter a tree species name"
              />
              <button>Search!</button>
            </form>
          </div>
          <Intro />
        </div>
      );
    }

    const query = this.state.query;
    const resultsCount = this.state.results.hits || 0;
    const locationsCount = this.state.results.locations || 0;
    const results = this.state.results.trucks || [];
    const renderedResults = results.map((r, i) => (
      <Vendor key={i} data={r} handleHover={this.handleHover} />
    ));

    return (
      <div>
        <div id="search-area">
          <form onSubmit={this.handleSearch}>
            <input
              type="text"
              value={query}
              onChange={this.onChange}
              placeholder="Enter a species name"
            />
            <button>Search!</button>
          </form>
        </div>
        {resultsCount > 0 ? (
          <div id="results-area">
            <h5>
              Found <span className="highlight">{resultsCount}</span> trees
            </h5>
            <ul> {renderedResults} </ul>
          </div>
        ) : null}
      </div>
    );
  }
}

export default Sidebar;
