//import './style.css';
import Map from "./libs/Map.js";
import OSM from "./libs/source/OSM.js";
import TileLayer from "./libs/layer/Tile.js";
import View from "./libs/View.js";
import "./libs/dist/ol.js";

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [3925316, 4731513],
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
    console.log(clickedCoordinate[0] + "-" + clickedCoordinate[1]);

    let buildingName = "";
    // using a few options
    const panel = jsPanel.create({
      // Panelin içeriği (HTML içeriği)

      content: `
          <div class="form">
            <div class="input-container">
              <label>X Koordinat Değeri </label>
              <input type="text" id="input1" placeholder="Input 1" readonly>
            </div>
            <div class="input-container">
            <label>Y Koordinat Değeri </label>
              <input type="text" id="input2" placeholder="Input 2" readonly>
            </div>
            <div class="input-container">
              <label>Bina İsmi Gir</label>
              <input type="text" id="buildingNameInput" >
            </div>
            <div  id="finishButton" class="b">Bitir<div>
          </div>
      `,
      contentSize: "700 550",
      // Panelin özellikleri
      headerTitle: "Veri Gir",
      position: "center",
      // Diğer isteğe bağlı özellikleri buraya ekleyebilirsiniz
      // Örn: size, theme, dragit, resizeit vb.
      callback: function () {
        // clickedCoordinate verisini inputların içine yazın
        document.getElementById("input1").value = clickedCoordinate[0];
        document.getElementById("input2").value = clickedCoordinate[1];

        document
          .getElementById("finishButton")
          .addEventListener("click", function () {
            // buildingName'i alın
            buildingName = document.getElementById("buildingNameInput").value;
            // Verileri console.log ile gösterin
            console.log("clickedCoordinate:", clickedCoordinate);
            console.log("buildingName:", buildingName);
          });
      },
    });
  });
});

//nav
var nav = document.querySelector(".nav");
var icon = document.querySelector("#icon");
var iconid = document.querySelector("#iconid");

icon.addEventListener("click", function () {
  if (nav.style.transform == "translateY(-100px)") {
    nav.style.transform = "translateY(0px)";
    iconid.className = "fa fa-arrow-up";
  } else {
    nav.style.transform = "translateY(-100px)";
    iconid.className = "fa fa-arrow-down";
  }
});

// button.addEventListener('mouseout', function() {
//   div.style.transform = 'translateY(-70px)';
// });

// Modal

var settings = document.querySelector(".settings");
var modal = document.querySelector(".modal");
var modalContainer = document.querySelector(".modal-container");
var close = document.querySelector("#closeButton");

settings.addEventListener("click", function () {
  modal.style.visibility = "visible";
  modalContainer.style.top = "50%";
  modalContainer.style.opacity = "1";
});
close.addEventListener("click", function () {
  modal.style.visibility = "hidden";
  modalContainer.style.top = "40%";
  modalContainer.style.opacity = "0";
});
