import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  here:string = "hello";
  appTitle = 'myapp';
  constructor(private data: DataService) { }

  ngOnInit() {

  }
  firstClick() {
    console.log(this.data.getTest());
    return this.data.getTest();
  }

  affiche(){
    return this.here;
  }
}
