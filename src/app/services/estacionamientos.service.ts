import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Estacionamiento } from '../interfaces/estacionamiento';

@Injectable({
  providedIn: 'root'
})
export class EstacionamientosService {
  auth=inject(AuthService);
  estacionamientos(): Promise<Estacionamiento[]>{
    return fetch("http://localhost:9000/estacionamientos",{
    method:"GET",
    headers:{
      Authorization:'Bearer'+ (this.auth.getToken()??''),
    },
    }).then(r=>r.json());
  }
  buscarEstacionamientoActivo(chocheraID:number){
    return  this.estacionamientos().then(estacionamientos=>{
      let buscado=null;
      for(let estacionamiento of estacionamientos){
        if (estacionamiento.idCochera===chocheraID &&
          estacionamiento.horaIngreso===null){
            buscado=estacionamiento;
          }
        }    
      return buscado;
    });
  }
  /**Abre un estacionamiento con una patente sobre una chochera en particular */
  estacionarAuto(patenteAuto:string, idCochera:number){
    return fetch("http://localhost:9000/estacionamientos/abrir",{
    method:"POST",
    headers:{
      Authorization:'Bearer'+ (this.auth.getToken()??''),
      "content-type": "application/json"
    },
    body:JSON.stringify({
      patente:patenteAuto,
      idCochera: idCochera,
      idUsuarioIngreso:"admin"
    })
    }).then(r=>r.json());
  }

  getEstacionamiento(): Promise<Estacionamiento[]> {
    return fetch("http://localhost:4000/estacionamientos", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + (this.auth.getToken() ?? "")
      },
    }).then(r => r.json());
  }
}




