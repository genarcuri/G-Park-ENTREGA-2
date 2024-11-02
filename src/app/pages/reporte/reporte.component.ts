

import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, NgFor } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { CocherasService } from '../../services/cocheras.service';
import { EstacionamientosService } from '../../services/estacionamientos.service';
import { Reporte } from '../../interfaces/reportes';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent, NgFor],
  templateUrl: './reporte.component.html', // Verifica la ruta del HTML
  styleUrls: ['./reporte.component.scss']
})
export class ReporteComponent {
  headerR = {
    numero: "N°",
    mes: "Mes",
    usos: "Usos",
    cobrado: "Cobrado",
  };

  reportes: Reporte[] = [];

  cochera = inject(CocherasService);
  estacionamientos = inject(EstacionamientosService);

  async ngOnInit(): Promise<void> {
    this.reportes = await this.traerEstacionamientos();
  }

  async traerEstacionamientos(): Promise<Reporte[]> {
    try {
      const estacionamientos = await this.estacionamientos.getEstacionamiento();
      const reportes: Reporte[] = [];

      for (const estacionamiento of estacionamientos) {
        if (estacionamiento.horaEgreso != null) {
          const fecha = new Date(estacionamiento.horaEgreso);
          const mes = fecha.toLocaleDateString("es-CL", {
            month: "numeric",
            year: "numeric",
          });

          const indiceMes = reportes.findIndex(res => res.mes === mes);

          if (indiceMes === -1) {
            reportes.push({
              mes: mes,
              usos: 1,
              cobrados: estacionamiento.costo,
            });
          } else {
            reportes[indiceMes].usos += 1;
            reportes[indiceMes].cobrados += estacionamiento.costo;
          }
        }
      }
      return reportes;
    } catch (error) {
      console.error('Error al traer estacionamientos:', error);
      return []; // Manejo de errores
    }
  }
}