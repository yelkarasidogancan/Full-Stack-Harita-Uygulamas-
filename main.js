import "https://code.jquery.com/jquery-3.6.0.min.js";
import "https://cdn.datatables.net/1.11.4/js/jquery.dataTables.min.js";

var markerCoordinates = [34.145435719887075, 39.40466275924388];

// new interaction
const raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
});

const source = new ol.source.Vector();
const vector = new ol.layer.Vector({
  source: source,
  style: {
    "fill-color": "rgba(255, 255, 255, 0.2)",
    "stroke-color": "#ffcc33",
    "stroke-width": 2,
    "circle-radius": 7,
    "circle-fill-color": "#ffcc33",
  },
});

const extent = ol.proj.get("EPSG:3857").getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];
const map = new ol.Map({
  layers: [raster, vector],
  target: "map",
  view: new ol.View({
    center: ol.proj.fromLonLat(markerCoordinates),
    zoom: 7,
    extent,
  }),
});
var sourceFeature = "";
let handler = function (event) {
  source.removeFeature(sourceFeature);
};
document.addEventListener("jspanelcloseduser", handler, false);
const addPointButton = document.getElementById("addPointBtn");
const form = document.getElementById("form");
addPointButton.addEventListener("click", function () {
  form.style.display = "block";
  const modify = new ol.interaction.Modify({ source: source });
  map.addInteraction(modify);

  let draw, snap;

  const typeSelect = document.getElementById("type");

  function addInteractions() {
    draw = new ol.interaction.Draw({
      source: source,
      type: typeSelect.value,
    });

    map.addInteraction(draw);
    snap = new ol.interaction.Snap({ source: source });
    map.addInteraction(snap);

    draw.on("drawend", function (event) {
      const feature = event.feature;
      sourceFeature = event.feature;
      const featureType = feature.getGeometry().getType();

      map.removeInteraction(draw);
      map.removeInteraction(snap);

      let buildingName = "";

      const geometry = feature.getGeometry();
      const coordinates = geometry.getCoordinates();
      const [x, y] = coordinates;
      var clickedLonLat = ol.proj.toLonLat(coordinates);

      const panel = jsPanel.create({
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

        headerTitle: featureType,
        position: "center",

        callback: function () {
          document.getElementById("input1").value = clickedLonLat[0];
          document.getElementById("input2").value = clickedLonLat[1];

          document
            .getElementById("closePanelButton")
            .addEventListener("click", function () {
              source.removeFeature(sourceFeature);
              panel.close();
            });

          document
            .getElementById("finishButton")
            .addEventListener("click", function () {
              buildingName = document.getElementById("buildingNameInput").value;
              console.log("clickedCoordinate:", clickedLonLat);
              console.log("buildingName:", buildingName);
              panel.close();
            });
        },
      });
    });
  }

  typeSelect.onchange = function () {
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions();
  };

  addInteractions();
});

// Data Fetch

const apiUrl = "http://localhost:5280/api/Door";
var _incomingData = null;

await fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    _incomingData = data;
  })
  .catch((error) => {
    console.error("Hata:", error);
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
      
  </tbody>
</table> `,
    callback: function () {
      const tableBody = document.querySelector("#myTable tbody");

      _incomingData.map((item) => {
        const row = document.createElement("tr");
        const id = document.createElement("td");
        const x = document.createElement("td");
        const y = document.createElement("td");

        id.textContent = item.id;
        x.textContent = item.x;
        y.textContent = item.y;

        row.appendChild(id);
        row.appendChild(x);
        row.appendChild(y);

        const updateCell = document.createElement("td");
        const updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.classList.add("button", "update");
        updateCell.appendChild(updateButton);
        row.appendChild(updateCell);

        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("button", "delete");
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
      });
      let table = new DataTable("#myTable");
    },
  });
});
