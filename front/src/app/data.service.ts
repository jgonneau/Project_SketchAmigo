import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  //Variable de session
  sessionID:string = ""

  constructor(private http: HttpClient) { }

    //method permettant de s'enregistrer au serveur
    registerToServer (username, password):string {

      //let message;

      this.http.post("http://localhost:3000/registering", {"username": username, "password": password})
      .subscribe((response) => {

        //message = response.message;

      },
      (error) => {
        console.log(error)
      });

      return message;
    }

    //method permettant de se connecter au serveur
    loginToServer (username, password):string {

      this.http.post("http://localhost:3000/authentification", {"username": username, "password": password})
      .subscribe((response) => {

        //Creation de la session
        //this.sessionID = response.sessionid.toString();

      },
      (error) => {
        console.log(error)
      });

      return "";
    }

}
