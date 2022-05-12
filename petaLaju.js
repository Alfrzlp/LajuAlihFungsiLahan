var map = L.map('mapid').setView([-6.89848, 107.41204], 10);
var esri =  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom:15
});
var hybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
    maxZoom: 15,
    subdomains:['mt0','mt1','mt2','mt3']
})
var satelite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
    maxZoom: 15,
    subdomains:['mt0','mt1','mt2','mt3']
})
var street = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 15,
    subdomains:['mt0','mt1','mt2','mt3']
})
var graycanvas = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

var baseMaps = {
    'Esri Satelite': esri,
    'Stadia Maps ': graycanvas,
    'Google Street': street,
    'Google Satelite': satelite,
    'Google Hybrid': hybrid
}


function set_view(e){
    var layer = control.getOverlays();

    if (layer == 'all') {
        map.setView([-6.7582, 107.4410], 9)
    } else if (layer == 'Bandung Barat') {
        map.setView([-6.89848, 107.41204], 10)
    } else if (layer == 'Purwakarta'){
        // map.fitBounds(pwk_geojson.getBounds())
        map.setView([-6.60139, 107.44292], 10)
    }
}

var homeBtn = L.easyButton('<i class="bi bi-house-door-fill"></i>', set_view).addTo(map);

var bb_geojson = L.geoJSON("",{
    style: myStyle,
    onEachFeature: onEachFeature
}).addTo(map);

var pwk_geojson = L.geoJSON("",{
    style: myStyle,
    onEachFeature: onEachFeature
});


function highlightFeature(e) {
    var layer = e.target;
    
    layer.setStyle({
        weight: 5,
        color: 'white'
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    bb_geojson.setStyle({weight: 1});
    pwk_geojson.setStyle({weight: 1});
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

function getColor(d, kab) {
    if (kab == 'all') {
        return d > 52.8 ? '#ACD1AF' :
        d > 41.7 ? '#74C476' :
        d > 30.6 ? '#31A354' :
        d > 19.8 ? '#006D2C' :
        '#043f1b';
    } else if (kab == 'BANDUNG BARAT') {
        return d > 66.4  ? '#ACD1AF' :
        d > 52.8 ? '#74C476' :
        d > 46.3  ? '#31A354' :
        d > 38.7  ? '#006D2C' :
        '#043f1b';
    } else if (kab == 'PURWAKARTA'){
        return d > 44.7 ? '#ACD1AF' :
        d > 30.6 ? '#74C476' :
        d > 21.4 ? '#31A354' :
        d > 19.9 ? '#006D2C' :
        '#043f1b';
    } 
}

function myStyle(feature) {
    return {
        fillColor: getColor(feature.properties.laju, feature.properties.nmkab),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    }
};

function styleAll(feature){
    return {
        fillColor: getColor(feature.properties.laju, 'all'),
        weight: 1,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.7
    }
}

function fetchJSON(url) {
    return fetch(url)
    .then(function(response) {
        return response.json();
    });
};


fetchJSON('assets/bb_LajuAlihFungsi.geojson')
.then(function(data) { 
    bb_geojson.addData(data);
});

fetchJSON('assets/pwk_LajuAlihFungsi.geojson')
.then(function(data) { 
    pwk_geojson.addData(data);
});


var Petakab = {
    'Bandung Barat': bb_geojson,
    'Purwakarta': pwk_geojson
}


function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};

info.update = function (dat) {
    this._div.innerHTML = 
    '<h4>Laju Alih Fungsi Lahan</h4>' +  (dat ?
    '<b>Kab : ' + toTitleCase(dat.nmkab) + '</b><br/>' +
    '<b>Kec : ' + toTitleCase(dat.nmkec) + '</b><br/>' +
    dat.laju.toFixed(3) + ' %'
    : 'Hover over a district');
};

info.addTo(map);



var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info legend')
    this._color = ['#0A5446', '#20AC4B', '#7AC27F', '#A4D29F','#CFE6CA']
    grades = [0, 38.7, 46.3, 52.8, 66.4, 76.3]
    
    for (var i = 0; i < grades.length - 1; i++) {
        this._div.innerHTML +=
        '<i style="background:' + this._color[i] + '"></i> ' +
        grades[i] + ' &ndash; ' + grades[i + 1] + '<br>';
    }
    return this._div;
};

legend.addTo(map);

legend.update = function() {
    var layer = control.getOverlays();

    if (layer == 'all') {
        grades = [0, 19.8, 30.6, 41.7, 52.8, 76.3]
        bb_geojson.setStyle(styleAll);
        pwk_geojson.setStyle(styleAll);
    } else if (layer == 'Bandung Barat') {
        grades = [0, 38.7, 46.3, 52.8, 66.4, 76.3]
        bb_geojson.resetStyle();
    } else if (layer == 'Purwakarta'){
        grades = [0, 19.8, 21.4, 30.6, 44.7, 63.4]
        pwk_geojson.resetStyle();
    }
    

    this._div.innerHTML = "";
    for (var i = 0; i < grades.length - 1; i++) {
        this._div.innerHTML +=
            '<i style="background:' + this._color[i] + '"></i> ' +
            grades[i] + ' &ndash; ' + grades[i + 1] + '<br>';
    }
    return this._div;
}


L.Control.Layers.include({
    getOverlays: function() {
      // create hash to hold all layers
      var control, layers;
      layers = {};
      control = this;
  
      // loop thru all layers in control
      control._layers.forEach(function(obj) {
        var layerName;
  
        // check if layer is an overlay
        if (obj.overlay) {
          // get name of overlay
          layerName = obj.name;
          // store whether it's present on the map or not
          return layers[layerName] = control._map.hasLayer(obj.layer);
        }
      });
      
      if(Object.values(layers).every(element => element === true)) {
        layer = 'all'
      } else {
        layer = Object.keys(layers).find(key => layers[key] === true)
      }
      return layer;
    }
  });


var control = new L.control.layers(baseMaps, Petakab, {position: 'topright'}).addTo(map);

map.on('overlayremove overlayadd', set_map);
function set_map(e){
    set_view();
    legend.update();
}