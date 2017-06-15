import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, ViewChildren, QueryList } from '@angular/core';
import { Button } from 'primeng/primeng';

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

  olMap: ol.Map;

  drawPolygon: ol.interaction.Draw;
  drawPoint: ol.interaction.Draw;
  drawCircle: ol.interaction.Draw;
  drawLine: ol.interaction.Draw;

  // Layer where shapes will be drawn
  featureOverlay: ol.layer.Vector;

  ngOnInit(): void {
    this.initalizeMap();
  }

  initalizeMap(): void {
    this.olMap = new ol.Map({
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
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

  private addDrawFeatures(map: ol.Map): void {
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

    this.drawPolygon = this.createDrawInteraction(features, 'Polygon');
    this.drawPoint = this.createDrawInteraction(features, 'Point');
    this.drawCircle = this.createDrawInteraction(features, 'Circle');
    this.drawLine = this.createDrawInteraction(features, 'LineString');

    map.addInteraction(this.drawPolygon);
    map.addInteraction(this.drawPoint);
    map.addInteraction(this.drawCircle);
    map.addInteraction(this.drawLine);

    // Call the show pointer clicked so we are not in draw mode.
    this.showPointerClicked(features);
  }

  private createDrawInteraction(features: ol.Collection<ol.Feature>, type: ol.geom.GeometryType): ol.interaction.Draw {
    return new ol.interaction.Draw({
      features: features,
      type: type
    });
  }

  drawPolygonClicked(): void {
    this.drawPoint.setActive(false);
    this.drawCircle.setActive(false);
    this.drawPolygon.setActive(true);
    this.drawLine.setActive(false)
  }

  drawCircleClicked(): void {
    this.drawPoint.setActive(false);
    this.drawCircle.setActive(true);
    this.drawPolygon.setActive(false);
    this.drawLine.setActive(false);
  }

  drawPointClicked(): void {
    this.drawPoint.setActive(true);
    this.drawCircle.setActive(false);
    this.drawPolygon.setActive(false);
    this.drawLine.setActive(false)
  }

  drawLineClicked(): void {
    this.drawPoint.setActive(false);
    this.drawCircle.setActive(false);
    this.drawPolygon.setActive(false);
    this.drawLine.setActive(true)
  }

  showPointerClicked(features: ol.Collection<ol.Feature>): void {
    this.drawPoint.setActive(false);
    this.drawCircle.setActive(false);
    this.drawPolygon.setActive(false);
    this.drawLine.setActive(false);

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
}
