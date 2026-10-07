import { Component } from '@angular/core';
import { VehicleSearchComponent } from './vehicle-search/vehicle-search.component';

@Component({
  selector: 'app-root',
  imports: [VehicleSearchComponent],
  template: '<app-vehicle-search />',
})
export class App {}
