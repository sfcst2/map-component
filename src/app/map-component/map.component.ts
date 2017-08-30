import { AfterViewInit, ViewEncapsulation, Component, ViewChild, ElementRef,
  ViewChildren, QueryList, Input } from '@angular/core';
import * as ol from 'openlayers';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements AfterViewInit {

  @ViewChild('map')
  map: ElementRef;

  @ViewChildren('map')
  viewChildren: QueryList<ElementRef>;

  @Input('height')
  height: string;

  @Input('width')
  width: string;

  // List of draw features to add
  @Input('drawFeatuers')
  drawFeatures: ol.geom.GeometryType[] = ['Polygon', 'Point', 'Circle', 'LineString'];
  // Map containing the draw features we are using
  drawFeaturesMap: Map<string, ol.interaction.Draw> = new Map<string, ol.interaction.Draw>();

  olMap: ol.Map;

  source: ol.source.Vector;
  vector: ol.layer.Vector;

  // Select interaction for the map
  selectInteraction: ol.interaction.Select;
  // Boolean indicating that we want to delete a feature
  deleteFeatureMode = false;

  ngAfterViewInit(): void {
    // This needs to be in the after view init because the canvas has to be drawn
    // one time.  We need to do this once we have passed in the height/width and it
    // has rendered
    this.initalizeMap();
  }

  initalizeMap(): void {
    this.source = new ol.source.Vector({ wrapX: false });

    this.vector = new ol.layer.Vector({
      source: this.source
    });

    const raster: ol.layer.Tile = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    // Setup the WMS layer
    this.olMap = new ol.Map({
      layers: [raster, this.vector],
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

    // Loop through the features that we are using for the map.  We want
    // to create a ol.interaction.Draw object for each one
    if (this.drawFeatures) {
      this.drawFeatures.forEach(drawFeature => {
        const olDrawFeat: ol.interaction.Draw = this.createDrawInteraction(drawFeature);
        map.addInteraction(olDrawFeat);

        // Add the listener to detect when we are done drawing
        const scope: any = this;

        olDrawFeat.on('drawstart', function (evt) {
          // When we start drawing, we want to disable the select interaction
          scope.selectInteraction.setActive(false);
        });

        olDrawFeat.on('drawend', function (evt) {
          // Switch back to the pointer once we have drawn. To do that, we want
          // to call the drawFeatureClicked with null
          scope.drawFeatureClicked(null);
        });

        // By default we want to draw feature to be disabled
        olDrawFeat.setActive(false);

        this.drawFeaturesMap.set(drawFeature, olDrawFeat);
      });
    }

    // Add the select feature
    this.addSelectInteraction();
  }

  createDrawInteraction(type: ol.geom.GeometryType): ol.interaction.Draw {
    return new ol.interaction.Draw({
      source: this.source,
      type: type
    });
  }

  /**
   * Function that will allow us the ability to select a
   * feature on the map
   */
  addSelectInteraction(): void {
    this.selectInteraction = new ol.interaction.Select({
      condition: ol.events.condition.click
    });

    this.olMap.addInteraction(this.selectInteraction);

    // By default we want to turn off selection until the user
    // presses the delete button
    this.selectInteraction.setActive(false);

    // Add a listener for when we add a item to the Selected
    // features array.
    const scope: any = this;

    this.selectInteraction.on('select', function (event) {

      if (scope.deleteFeatureMode) {
        // We need to deselect the features before we remove them.  Openlayers
        // won't let you delete selected features in this manner
        scope.selectInteraction.getFeatures().clear();

        // Remove any selected features
        if (event.selected) {

          for (const selected of event.selected) {
            scope.source.removeFeature(selected);
          }

          // Force the Vector layer to refresh once we have deleted any features
          scope.source.refresh();
          // Reset the delete mode so we won't delete the next
          // feature
          scope.deleteFeatureMode = false;
          // Turn off the interaction
          scope.selectInteraction.setActive(false);
        }
      }
    });
  }

  drawFeatureClicked(drawFeature: ol.geom.GeometryType): void {
    this.disableAllDrawFeatures();
    if (drawFeature) {
      this.enableDrawFeature(drawFeature);
    }
  }

  enableDrawFeature(type: ol.geom.GeometryType): void {
    const drawFeat: ol.interaction.Draw = this.drawFeaturesMap.get(type);
    if (drawFeat) {
      drawFeat.setActive(true);
    }
  }

  disableAllDrawFeatures(): void {
    if (this.drawFeatures) {
      this.drawFeaturesMap.forEach( (val: ol.interaction.Draw) => {
        val.setActive(false);
      });
    }
  }

  /**
   * Function that will take in a collection of features and will return the
   * geoJSON.
   */
  writeFeaturesToGeoJSON(): string {

    const featsArr: ol.Feature[] = this.source.getFeatures();
    if (featsArr) {
      const geoJSON: ol.format.GeoJSON = new ol.format.GeoJSON();
      console.log(geoJSON.writeFeatures(featsArr));
      return geoJSON.writeFeatures(featsArr);
    }

    return null;
  }

  /**
   * This function will create a base64 encoded string of the map and return it.
   */
  captureScreenshot(): string {
    const canvasRef: ElementRef = this.viewChildren.find((elemRef: ElementRef) => {
      return elemRef.nativeElement.querySelector('canvas');
    });

    console.log(canvasRef.nativeElement.querySelector('canvas').toDataURL());
    return canvasRef.nativeElement.querySelector('canvas').toDataURL();
  }

  /**
   * Function we will get into when we select the delete feature button.
   * This starts the process of removing a feature.
   */
  deleteFeatureActivated(): void {
    this.deleteFeatureMode = true;
    this.selectInteraction.setActive(true);
  }
}
