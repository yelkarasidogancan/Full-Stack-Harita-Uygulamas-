//import './style.css';
import Map from "./libs/Map.js";
import OSM from "./libs/source/OSM.js";
import TileLayer from "./libs/layer/Tile.js";
import View from "./libs/View.js";
import Feature from "/libs/Feature.js";
import "https://code.jquery.com/jquery-3.6.0.min.js";
import "https://cdn.datatables.net/1.11.4/js/jquery.dataTables.min.js";

var markerCoordinates = [34.145435719887075, 39.40466275924388]; // Longitude, Latitude

var map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat(markerCoordinates),
    zoom: 7,
  }),
});

// Add Point
const addPointButton = document.getElementById("addPointBtn");
addPointButton.addEventListener("click", function () {
  const mapElement = map.getTargetElement();
  mapElement.style.cursor = "crosshair";

  // Tıklama olayını dinleme
  map.once("click", function (event) {
    mapElement.style.cursor = "auto";
    const clickedCoordinate = event.coordinate;
    var clickedLonLat = ol.proj.toLonLat(clickedCoordinate);
    console.log(clickedLonLat[0] + "-" + clickedLonLat[1]);

    let buildingName = "";
    // using a few options
    const panel = jsPanel.create({
      // Panelin içeriği (HTML içeriği)
      theme: "primary",
      borderRadius: "1rem",
      boxShadow: 5,

      content: `
          <div class="form">
            <div class="input-container">
              <label>Langitude Value </label>
              <input type="text" id="input1" placeholder="Input 1" readonly>
            </div>
            <div class="input-container">
            <label>Latitude Value </label>
              <input type="text" id="input2" placeholder="Input 2" readonly>
            </div>
            <div class="input-container">
              <label>Enter Door Name</label>
              <input type="text" id="buildingNameInput" >
            </div>
             <div class="buttonss">
               <div id="finishButton" class="b">Done</div>
               <div id="closePanelButton" class="b r">Exit</div>
             </div>
            
          </div>
      `,
      contentSize: "700 550",
      // Panelin özellikleri
      headerTitle: "Add Point",
      position: "center",
      // Diğer isteğe bağlı özellikleri buraya ekleyebilirsiniz
      // Örn: size, theme, dragit, resizeit vb.
      callback: function () {
        // clickedCoordinate verisini inputların içine yazın
        document.getElementById("input1").value = clickedLonLat[0];
        document.getElementById("input2").value = clickedLonLat[1];

        document
          .getElementById("closePanelButton")
          .addEventListener("click", function () {
            console.log("sa");
            panel.close();
          });

        document
          .getElementById("finishButton")
          .addEventListener("click", function () {
            // buildingName'i alın
            buildingName = document.getElementById("buildingNameInput").value;
            // Verileri console.log ile gösterin
            console.log("clickedCoordinate:", clickedCoordinate);
            console.log("buildingName:", buildingName);

            //Add Marker
            var marker = new ol.Feature({
              geometry: new ol.geom.Point(ol.proj.fromLonLat(clickedLonLat)),
            });

            var markerStyle = new ol.style.Style({
              image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v6.4.3/examples/data/icon.png",
              }),
            });

            marker.setStyle(markerStyle);

            var vectorSource = new ol.source.Vector({
              features: [marker],
            });

            var vectorLayer = new ol.layer.Vector({
              source: vectorSource,
            });

            map.addLayer(vectorLayer);
            panel.close();
          });
      },
    });
  });
});

// Data Fetch

const apiUrl = "http://localhost:5280/api/Door"; // API'nin URL'sini buraya girin
var _incomingData = null;

await fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    _incomingData = data;
  })
  .catch((error) => {
    console.error("Hata:", error);
  });

console.log(_incomingData);
_incomingData.forEach((element) => {
  console.log(element.x);
});

const query = document.querySelector("#queryPointBtn");
query.addEventListener("click", function () {
  jsPanel.create({
    headerTitle: "demo panel",
    theme: "dark",
    contentSize: "800 550",
    content: `<table id="myTable" class="display">
  <thead>

      <tr>
          <th>ID</th>
          <th>X</th>
          <th>Y</th>
          <th></th>
          <th></th>
      </tr>
  </thead>
  <tbody>
  
      ${_incomingData.map(
        (item) => `<tr>
          <td>${item.id}</td>
          <td>${item.x}</td>
          <td>${item.y}</td>
          <td><button>Güncelle</button></td>
          <td><button>Sil</button></td>
       </tr>`
      )}
  
      
      
  </tbody>
</table> `,
  });
  let table = new DataTable("#myTable");
});
