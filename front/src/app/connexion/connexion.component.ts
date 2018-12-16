import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})

export class ConnexionComponent implements OnInit {

  usrn:string = ""
  psswd:string = ""
  imessage:string = ""

  constructor(private data: DataService) { }

  ngOnInit() {
  }

  //method appelé lors de validation formulaire
  login() {
    //Appel de la method pour se connecter au serveur
    this.imessage = this.data.loginToServer(this.usrn, this.psswd);
  }
}
