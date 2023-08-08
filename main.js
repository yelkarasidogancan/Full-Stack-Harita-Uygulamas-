import "https://code.jquery.com/jquery-3.6.0.min.js";
import "https://cdn.datatables.net/1.11.4/js/jquery.dataTables.min.js";

const markerCoordinates = [32.85427, 39.91987];
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

let modify = new ol.interaction.Modify({ source: source });

addPointButton.addEventListener("click", function () {
  form.style.display = "block";
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
      console.log(feature);
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
                <label>Longitude Value </label>
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
              addFeatureToBackend(
                clickedLonLat[0],
                clickedLonLat[1],
                buildingName
              );
              function addFeatureToBackend(x, y, title) {
                var apiEndpoint = "http://localhost:5280/api/Door";
                // Sending Data
                var data = {
                  Title: title,
                  x: x,
                  y: y,
                };

                fetch(apiEndpoint, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(data),
                })
                  .then(function (response) {
                    if (!response.ok) {
                      throw new Error("Network response was not ok");
                    }
                    return response.json();
                  })
                  .then(function (data) {
                    console.log("Feature successfully added to the backend.");
                  })
                  .catch(function (error) {
                    console.error(
                      "Error while adding the feature to the backend:",
                      error
                    );
                  });
              }

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
    console.log(typeof data);
  })
  .catch((error) => {
    console.error("Hata:", error);
  });

// Show Marker on Map
function addMarkersFromDatabase(dataArray) {
  dataArray.forEach(function (data) {
    var coordinates = [data.x, data.y];
    var feature = new ol.Feature(
      new ol.geom.Point(ol.proj.fromLonLat(coordinates))
    );
    feature.setProperties({ id: data.id });
    source.addFeature(feature);
  });
}

// Show Marker on Map Function
addMarkersFromDatabase(_incomingData);

// Show Data on Table
const query = document.querySelector("#queryPointBtn");
query.addEventListener("click", function () {
  const panel = jsPanel.create({
    headerTitle: "demo panel",
    theme: "dark",
    contentSize: "800 550",
    content: `<table id="myTable" class="display">
  <thead>
      <tr>
          <th>Title</th>
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
        const title = document.createElement("td");
        const x = document.createElement("td");
        const y = document.createElement("td");

        title.textContent = item.title;
        x.textContent = item.x;
        y.textContent = item.y;

        row.appendChild(title);
        row.appendChild(x);
        row.appendChild(y);

        const updateCell = document.createElement("td");
        const updateButton = document.createElement("div");

        updateButton.id = "updateButtonId";
        updateButton.innerHTML =
          '<i class="fa fa-pencil" aria-hidden="true"></i>';
        updateButton.setAttribute("data-row-id", item.id);
        updateCell.appendChild(updateButton);
        row.appendChild(updateCell);

        const deleteCell = document.createElement("td");
        const deleteButton = document.createElement("div");
        deleteButton.id = "deleteButtonId";
        deleteButton.innerHTML =
          '<i class="fa fa-trash" aria-hidden="true"></i>';
        deleteButton.setAttribute("data-row-id", item.id);
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);

        updateButton.addEventListener("click", (event) => {
          const rowId = event.target.getAttribute("data-row-id");
          updateOptions(rowId);
          panel.close();
          console.log("update clicked for row:", rowId);
        });
        deleteButton.addEventListener("click", (event) => {
          const rowId = event.target.getAttribute("data-row-id");
          deleteFeatureFromDatabase(rowId);
          location.reload();
          console.log("Delete clicked for row:", rowId);
        });
      });
      let table = new DataTable("#myTable");
    },
  });
});

var selectedFeature = null;

// Catch Marker
map.on("click", function (event) {
  var clickedFeature = map.forEachFeatureAtPixel(
    event.pixel,
    function (feature, layer) {
      return feature;
    }
  );
  try {
    let a = clickedFeature.get("id");
    if (a > 0) {
      if (clickedFeature) {
        var featureId = clickedFeature.get("id");
        console.log(featureId);

        selectedFeature = clickedFeature;
        const panel = jsPanel.create({
          headerTitle: "demo panel",
          theme: "dark",
          position: "center",
          borderRadius: "1rem",
          boxShadow: 5,
          contentSize: "600 350",
          content: `
            <div class="form">
              <div class="input-container">
                <label>Building Name </label>
                <input type="text" id="test" placeholder="Input 1" readonly>
              </div>
              
               <div class="buttonss">
                 <div id="updateBuilding" class="b">Update</div>
                 <div id="deleteBuilding" class="b r">Delete</div>
               </div>
            </div>
        `,
          callback: function () {
            let id = parseInt(featureId);
            const targetIndex = _incomingData.findIndex(
              (item) => item.id == featureId
            );
            document.getElementById("test").value =
              _incomingData[targetIndex].title;

            deleteBuilding.addEventListener("click", function () {
              panel.close();
              deleteFeatureFromDatabase(featureId);
              selectedFeature = null;
              location.reload();
            });
            updateBuilding.addEventListener("click", function () {
              panel.close();
              updateOptions(id);
            });
          },
        });
      }
    }
  } catch {
    console.log("sıkıntı yok");
  }
});
// Delete From Database
function deleteFeatureFromDatabase(featureId) {
  var apiEndpoint = "http://localhost:5280/api/Door/" + featureId;
  fetch(apiEndpoint, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (data) {
      console.log("Feature successfully deleted from the database.");
      if (selectedFeature) {
        selectedFeature = null;
      }
    })
    .catch(function (error) {
      console.error("Error while deleting the feature:", error);
    });
}
// Update Options (Map or Panel)
function updateOptions(id) {
  const panel = jsPanel.create({
    headerTitle: "demo panel",
    theme: "dark",
    position: "center",
    borderRadius: "1rem",
    boxShadow: 5,
    contentSize: "600 350",
    content: `
      <div class="form">        
         <div class="title-container">
          <h2>Update Option</h2
         </div>
         <div class="buttonss">
           <div id="updateOnMap" class="b">Map</div>
           <div id="updateOnPanel" class="b">Panel</div>
         </div>
      </div>
  `,
    callback: function () {
      var updateOnMapButton = document.querySelector("#updateOnMap");
      var updateOnPanelButton = document.querySelector("#updateOnPanel");
      updateOnMapButton.addEventListener("click", function () {
        console.log(id);
        panel.close();
        enableModifyForId(id);
        modify.on("modifyend", function (event) {
          console.log("=== Modify end ===");
          var modifiedFeature = event.features.getArray()[0];
          if (modifiedFeature) {
            var geometry = modifiedFeature.getGeometry();
            var coordinates = geometry.getCoordinates();
            var [longitude, latitude] = ol.proj.toLonLat(coordinates);

            console.log("Güncellenmiş Latitude:", latitude);
            console.log("Güncellenmiş Longitude:", longitude);
          }
          updateOnMapPanel(id, longitude, latitude);
        });
      });
      updateOnPanelButton.addEventListener("click", function () {
        panel.close();
        updateOnPanel(id);
        console.log(id);
      });
    },
  });
}
// Modify Selected Marker
function enableModifyForId(id) {
  map.removeInteraction(modify);

  var selectedFeature = source.getFeatures().find(function (feature) {
    return feature.getProperties().id == id;
  });

  if (selectedFeature) {
    modify = new ol.interaction.Modify({
      features: new ol.Collection([selectedFeature]),
    });

    map.addInteraction(modify);
  }
}
// Update On Map after Panel
function updateOnMapPanel(id, longitude, latitude) {
  const panel = jsPanel.create({
    headerTitle: "demo panel",
    theme: "dark",
    position: "center",
    borderRadius: "1rem",
    boxShadow: 5,
    contentSize: "600 600",
    content: `
    <div class="form">
      <div class="input-container">
        <label>Longitude Value </label>
        <input type="text" id="x" placeholder="Input 1" >
      </div>
      <div class="input-container">
      <label>Latitude Value </label>
        <input type="text" id="y" placeholder="Input 2" >
      </div>
      <div class="input-container">
        <label>Door Name </label>
        <input type="text" id="title" >
      </div>
       <div class="buttonss">
         <div id="updateOnPanelButton" class="b">Update</div>
         <div id="exitOnPanelButton" class="b r">Exit</div>
       </div>

    </div>
`,
    callback: function () {
      const targetIndex = _incomingData.findIndex((item) => item.id == id);
      var x = document.getElementById("x");
      var y = document.getElementById("y");
      var title = document.getElementById("title");

      x.value = longitude;
      y.value = latitude;
      title.value = _incomingData[targetIndex].title;

      let exitOnPanelButton = document.querySelector("#exitOnPanelButton");
      let updateOnPanelButton = document.querySelector("#updateOnPanelButton");
      exitOnPanelButton.addEventListener("click", function () {
        panel.close();
      });
      updateOnPanelButton.addEventListener("click", function () {
        panel.close();
        updateDatabase(id, x.value, y.value, title.value);
        location.reload();
      });
    },
  });
}
//Update on Panel
function updateOnPanel(id) {
  const panel = jsPanel.create({
    headerTitle: "demo panel",
    theme: "dark",
    position: "center",
    borderRadius: "1rem",
    boxShadow: 5,
    contentSize: "600 600",
    content: `
    <div class="form">
      <div class="input-container">
        <label>Longitude Value </label>
        <input type="text" id="x" placeholder="Input 1" >
      </div>
      <div class="input-container">
      <label>Latitude Value </label>
        <input type="text" id="y" placeholder="Input 2" >
      </div>
      <div class="input-container">
        <label>Door Name </label>
        <input type="text" id="title" >
      </div>
       <div class="buttonss">
         <div id="updateOnPanelButton" class="b">Update</div>
         <div id="exitOnPanelButton" class="b r">Exit</div>
       </div>

    </div>
`,
    callback: function () {
      const targetIndex = _incomingData.findIndex((item) => item.id == id);
      var x = document.getElementById("x");
      var y = document.getElementById("y");
      var title = document.getElementById("title");

      x.value = _incomingData[targetIndex].x;
      y.value = _incomingData[targetIndex].y;
      title.value = _incomingData[targetIndex].title;

      var exitOnPanelButton = document.querySelector("#exitOnPanelButton");
      var updateOnPanelButton = document.querySelector("#updateOnPanelButton");
      exitOnPanelButton.addEventListener("click", function () {
        panel.close();
      });
      updateOnPanelButton.addEventListener("click", function () {
        panel.close();
        updateDatabase(id, x.value, y.value, title.value);
        location.reload();
      });
    },
  });
}
// Update from Database
function updateDatabase(id, x, y, title) {
  const apiUrl = "http://localhost:5280/api/Door/coordinate";

  const dataToUpdate = {
    id: parseInt(id),
    title: title,
    x: parseFloat(x),
    y: parseFloat(y),
  };

  fetch(apiUrl, {
    method: "PUT",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToUpdate),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((updatedData) => {
      console.log("Güncellenmiş veri:", updatedData);
    })
    .catch((error) => {
      console.error("Güncelleme hatası:", error);
    });
}
