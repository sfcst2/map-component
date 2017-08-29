import { ViewEncapsulation, Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList, Input } from '@angular/core';
import * as ol from 'openlayers';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {

  @ViewChild('map')
  map: ElementRef;

  @ViewChildren('map')
  viewChildren: QueryList<ElementRef>;

  // List of draw features to add
  @Input('drawFeatuers')
  drawFeatures: ol.geom.GeometryType[] = ['Polygon', 'Point', 'Circle', 'LineString'];
  // Map containing the draw features we are using
  drawFeaturesMap: { [key: string]: ol.interaction.Draw; } = {};

  olMap: ol.Map;

  // Layer where shapes will be drawn
  featureOverlay: ol.layer.Vector;

  deleteFeatureMode = false;

  ngOnInit(): void {
    this.initalizeMap();
  }

  initalizeMap(): void {
    // Setup additional layer
    //   const tileLayer: ol.layer.Tile = new ol.layer.Tile({
    //   extent: [-13884991, 2870341, -7455066, 6338219],
    //   source: new ol.source.TileWMS(({
    //     url: 'http://demo.boundlessgeo.com/geoserver/wms',
    //     params: {'LAYERS': 'topp:states', 'TILED': true},
    //     serverType: 'geoserver',
    //     projection: null
    //   }))
    // });

    const raster: ol.layer.Tile = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    // Setup the WMS layer
    this.olMap = new ol.Map({
      layers: [raster],
      controls: ol.control.defaults({
        attributionOptions: ({
          collapsible: false
        })
      }),
      view: new ol.View({
        center: [0, 0],
        zoom: 2
      })
    });

    // Add the draw features
    this.addDrawFeatures(this.olMap);

    this.olMap.setTarget(this.map.nativeElement);
  }

  addDrawFeatures(map: ol.Map): void {
    const features: ol.Collection<ol.Feature> = new ol.Collection<ol.Feature>();
    // Add a layer for the features
    this.featureOverlay = new ol.layer.Vector({
      source: new ol.source.Vector({ features: features }),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      })
    });
    this.featureOverlay.setMap(map);

    this.featureOverlay.getSource().getFeatures();

    // Loop through the features that we are using for the map.  We want
    // to create a ol.interaction.Draw object for each one
    if (this.drawFeatures) {
      this.drawFeatures.forEach(drawFeature => {
        const olDrawFeat: ol.interaction.Draw = this.createDrawInteraction(features, drawFeature);
        map.addInteraction(olDrawFeat);

        // Add the listener to detect when we are done drawing
        const scope: any = this;
        olDrawFeat.on('drawend', function (evt) {
          console.log('Draw ended');
          olDrawFeat.finishDrawing();
          // Switch back to the pointer once we have drawn. To do that, we want
          // to call the drawFeatureClicked with null
          //scope.drawFeatureClicked(null);
        });

        this.drawFeaturesMap[drawFeature] = olDrawFeat;
      });
    }

    // Add the select feature
    this.addSelectInteraction();

    // // Call the draw features clicked with null so that the cursor
    // // is used by default
    // this.drawFeatureClicked(null);
  }

  createDrawInteraction(features: ol.Collection<ol.Feature>, type: ol.geom.GeometryType): ol.interaction.Draw {
    return new ol.interaction.Draw({
      features: features,
      type: type
      // finishCondition: ol.events.condition.primaryAction
    });
  }

  /**
   * Function that will allow us the ability to select a
   * feature on the map
   */
  addSelectInteraction(): void {
    const selectInteraction = new ol.interaction.Select({
      condition: ol.events.condition.click
    });
    this.olMap.addInteraction(selectInteraction);

    // Add a listener for when we add a item to the Selected
    // features array.
    const scope: any = this;
    selectInteraction.on('select', function (event) {
      console.log('Selected a feature');
      if (scope.deleteFeatureMode) {
        console.log('Removing feature');
        // Remove any selected features
        if (event.selected) {
          for (const selected of event.selected) {
            scope.featureOverlay.getSource().removeFeature(selected);
          }
        }
        // Remove any deselected features
        if (event.deselected) {
          for (const deselected of event.deselected) {
            scope.featureOverlay.getSource().removeFeature(deselected);
          }
        }
        // Reset the delete mode so we won't delete the next
        // feature
        scope.deleteFeatureMode = false;
      }
    });

  }

  drawFeatureClicked(drawFeature: ol.geom.GeometryType): void {
    this.disableAllDrawFeatures();
    if (drawFeature) {
      this.enableDrawFeature(drawFeature);
    }
  }

  drawCircleClicked(): void {
    this.disableAllDrawFeatures();
    this.enableDrawFeature('Circle');
  }

  enableDrawFeature(type: ol.geom.GeometryType): void {
    this.drawFeaturesMap[type].setActive(true);
  }

  disableAllDrawFeatures(): void {
    if (this.drawFeatures) {
      for (let key in this.drawFeaturesMap) {
        this.drawFeaturesMap[key].setActive(false);
      }
    }
  }

  /**
   * Function that will take in a collection of features and write out the
   * geoJSON
   */
  writeFeatures(features: ol.Collection<ol.Feature>): void {

    const featsArr: ol.Feature[] = this.featureOverlay.getSource().getFeatures();
    if (featsArr) {
      const geoJSON: ol.format.GeoJSON = new ol.format.GeoJSON();
      console.log(geoJSON.writeFeatures(featsArr));
    }
  }

  /**
   * This function will create a base64 encoded string of the map.
   */
  captureScreenshot(): void {
    const canvasRef: ElementRef = this.viewChildren.find((elemRef: ElementRef) => {
      return elemRef.nativeElement.querySelector('canvas');
    });

    console.log(canvasRef.nativeElement.querySelector('canvas').toDataURL());
  }

  /**
   * Function we will get into when we select the delete feature button.
   * This starts the process of removing a feature.
   */
  deleteFeatureActivated(): void {
    this.deleteFeatureMode = true;
  }
}
