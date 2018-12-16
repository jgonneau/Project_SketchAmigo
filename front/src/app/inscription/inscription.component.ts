import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})

export class InscriptionComponent implements OnInit {

  usrn:string = ""
  psswd:string = ""
  imessage:string = ""

  constructor(private data: DataService) { }

  ngOnInit() {
  }

  //method appelé à la validation formulaire
  registering() {

    //Appel de la method pour s'enregistrer sur le serveur
    this.imessage = this.data.registerToServer(this.usrn, this.psswd);

  }
}
