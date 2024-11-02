import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { tarifas } from '../../interfaces/tarifas';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-precios',
  standalone: true,
  imports: [RouterModule, HeaderComponent, CommonModule],
  templateUrl: './precios.component.html',
  styleUrls: ['./precios.component.scss'],  // Corrige el nombre de la propiedad a styleUrls
})
export class PreciosComponent {
  auth = inject(AuthService);
  tarifas: tarifas[] = [];  // Usa 'tarifas' como tipo y no como nombre de la variable

  getTarifas() {
    return fetch('http://localhost:9000/tarifas/', {
      method: 'GET',
      headers: {
        Authorization: "Bearer " + this.auth.getToken(),
      },
    })
      .then(response => response.json())
      .then((tarifas) => this.tarifas = tarifas)
      .catch(error => console.error("Error al obtener tarifas:", error));
  }

  ngOnInit() {
    this.getTarifas();
  }

  async updateTarifas(tarifasId: string) {
    const { value } = await Swal.fire({
      title: "Ingrese el monto al que quiere actualizar",
      input: "number", 
      inputLabel: "Monto", 
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Tienes que escribir algo";  
        }
        return null; 
      },
    });
  
    if (value) { 
      fetch(`http://localhost:9000/tarifas/${tarifasId}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + this.auth.getToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          tarifasId: tarifasId,
          valor: Number(value), 
        }),
      })
        .then((response) => {
          if (response.ok) {
            Swal.fire("Actualizado!", "El monto ha sido actualizado.", "success");
          } else {
            Swal.fire("Error!", "No se pudo actualizar el monto.", "error");
          }
        })
        .then(() => this.getTarifas());
    }
  }
  
}