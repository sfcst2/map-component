import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent } from './map.component';
import { MdButtonModule, MdMenuModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as ol from 'openlayers';


describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [
        BrowserAnimationsModule,
        MdButtonModule,
        MdMenuModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('afterViewInit should call initializeMap', () => {
    spyOn(component, 'initalizeMap');
    component.ngAfterViewInit();
    expect(component.initalizeMap).toHaveBeenCalled();
  });

  it('initializeMap creates map with default draw features', () => {
    component.initalizeMap();
    expect(component.olMap).toBeDefined();
    expect(component.olMap.getLayers()).toBeDefined();
    expect(component.olMap.getLayers().getLength()).toBeGreaterThan(0);
    expect(component.drawFeaturesMap).toBeDefined();
    // Verify the four default features are added 'Polygon', 'Point', 'Circle', 'LineString'
    expect(component.drawFeaturesMap.size).toEqual(4);
    expect(component.drawFeaturesMap.get('Point')).toBeDefined();
    expect(component.drawFeaturesMap.get('Polygon')).toBeDefined();
    expect(component.drawFeaturesMap.get('Circle')).toBeDefined();
    expect(component.drawFeaturesMap.get('LineString')).toBeDefined();
    // Verify that the selection interaction is also added
    expect(component.selectInteraction).toBeDefined();
    expect(component.selectInteraction.getActive()).toBeFalsy();
  });

  it('initializeMap creates map with custom draw features', () => {
    // We only want to show the Point draw feature
    component.drawFeatures = ['Point'];
    component.initalizeMap();
    expect(component.olMap).toBeDefined();
    expect(component.olMap.getLayers()).toBeDefined();
    expect(component.olMap.getLayers().getLength()).toBeGreaterThan(0);
    expect(component.drawFeaturesMap).toBeDefined();
    expect(component.drawFeaturesMap.size).toEqual(1);
    expect(component.drawFeaturesMap.get('Point')).toBeDefined();
    // Verify that the selection interaction is also added
    expect(component.selectInteraction).toBeDefined();
    expect(component.selectInteraction.getActive()).toBeFalsy();
  });

  it('clicking draw feature disables all other draw features', () => {
    component.initalizeMap();
    expect(component.drawFeaturesMap.get('Point').getActive()).toBeFalsy();
    expect(component.drawFeaturesMap.get('Polygon').getActive()).toBeFalsy();
    expect(component.drawFeaturesMap.get('Circle').getActive()).toBeFalsy();
    expect(component.drawFeaturesMap.get('LineString').getActive()).toBeFalsy();
    component.drawFeatureClicked('Point');
    expect(component.drawFeaturesMap.get('Point').getActive()).toBeTruthy();
    expect(component.drawFeaturesMap.get('Polygon').getActive()).toBeFalsy();
    expect(component.drawFeaturesMap.get('Circle').getActive()).toBeFalsy();
    expect(component.drawFeaturesMap.get('LineString').getActive()).toBeFalsy();
  });

  it('disable all draw features', () => {
      component.initalizeMap();
      component.drawFeatureClicked('Point');
      expect(component.drawFeaturesMap.get('Point').getActive()).toBeTruthy();
      component.disableAllDrawFeatures();
      expect(component.drawFeaturesMap.get('Point').getActive()).toBeFalsy();
      expect(component.drawFeaturesMap.get('Polygon').getActive()).toBeFalsy();
      expect(component.drawFeaturesMap.get('Circle').getActive()).toBeFalsy();
      expect(component.drawFeaturesMap.get('LineString').getActive()).toBeFalsy();
  });

  it('writeFeaturesToGeoJSON writes json', () =>{
    component.initalizeMap();
    const p: ol.geom.Point = new ol.geom.Point([10, 10]);
    const f: ol.Feature = new ol.Feature(p);
    component.source.addFeature(f);
    let result:string = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[10,10]},"properties":null}]}';
    expect(component.writeFeaturesToGeoJSON()).toEqual(result);
  });

  it('delete feature clicked', () =>{
    component.initalizeMap();
    component.deleteFeatureActivated();
    expect(component.deleteFeatureMode).toBeTruthy();
    expect(component.selectInteraction.getActive()).toBeTruthy();
  })

});
