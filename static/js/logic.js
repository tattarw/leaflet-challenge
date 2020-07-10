// API queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

d3.json(queryUrl, function(data) {

  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Circle radius
  function radiusSize(magnitude) {
    return magnitude * 25000;
  }

  // Circle color
  function circleColor(magnitude) {
    if (magnitude > 5) {
        return 'darkred'
    } else if (magnitude > 4) {
        return 'red'
    } else if (magnitude > 3) {
        return 'darkorange'
    } else if (magnitude > 2) {
        return 'yellow'
    } else if (magnitude > 1) {
        return 'lightyellow'
    } else {
        return 'green'
    }
}

  // GeoJSON layer

  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1
      });
    },
    onEachFeature: onEachFeature
  });


  createMap(earthquakes);
}

function createMap(earthquakes) {

  var smap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var gmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });


  var FL = new L.LayerGroup();
  
  var BM = {
    "Grayscale": gmap,
    "Satellite": smap
  };

  var OM = {
    "Fault Lines": FL,
    "Earthquakes": earthquakes,
    
};

  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [earthquakes, FL]
  });


  L.control.layers(BM, OM, {
    collapsed: false
  }).addTo(myMap);

  var flquery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  d3.json(flquery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "red", fillOpacity: 0}
      }
    }).addTo(FL)
  })

  function Color1(d) {
    return d > 5 ? 'darkred' :
           d > 4  ? 'red' :
           d > 3  ? 'darkorange' :
           d > 2  ? 'yellow' :
           d > 1  ? 'lightyellow' :
                    'green';
  }


  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];
  
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + Color1(mags[i] + 1) + '"></i> ' +
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}