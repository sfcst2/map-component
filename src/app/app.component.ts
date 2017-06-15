import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MapComponent } from './map-component/map.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  ngOnInit(): void {
  }
}
