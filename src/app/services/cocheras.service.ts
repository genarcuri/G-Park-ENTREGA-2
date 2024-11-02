import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CocherasService {
  getCocherasId(id: number) {
    throw new Error('Method not implemented.');
  }
  auth=inject(AuthService);
  cocheras(){
    return fetch("http://localhost:9000/cocheras",{
    method:"GET",
    headers:{
      Authorization:'Bearer'+ (this.auth.getToken()??''),
    },
    }).then(r=>r.json());
  }
}
