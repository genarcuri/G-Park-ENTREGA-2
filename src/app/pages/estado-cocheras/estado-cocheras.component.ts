import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Cochera } from '../../interfaces/cochera';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { Estacionamiento } from '../../interfaces/estacionamiento';
import Swal from 'sweetalert2';
import { EstacionamientosService } from '../../services/estacionamientos.service';
import { CocherasService } from '../../services/cocheras.service';

@Component({
  selector: 'app-estado-cocheras',
  standalone: true,
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './estado-cocheras.component.html',
  styleUrls: ['./estado-cocheras.component.scss']
})
export class EstadoCocherasComponent {
  titulo: string = 'Estado de la cochera';

  header: { nro: string, disponibilidad: string, ingreso: string, acciones: string } = {
    nro: 'Nro',
    disponibilidad: 'Disponibilidad',
    ingreso: 'Ingreso',
    acciones: 'Acciones',
  };

  filas: (Cochera & { activo: Estacionamiento | null, horaDeshabilitacion: string | null })[] = [];
  siguienteNumero: number = 1;

  auth = inject(AuthService);
  cocheras = inject(CocherasService);
  estacionamientos = inject(EstacionamientosService);

  ngOnInit() {
    this.reload().catch(error => {
      console.error('Error al cargar las cocheras:', error);
    });
  }

  reload() {
    return fetch('http://localhost:4000/cocheras', {
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + this.auth.getToken(),
      },
    })
      .then((r) => r.json())
      .then((filas) => {
        this.filas = filas.map((fila: Cochera) => {
          const patenteStorage = localStorage.getItem(`cochera_${fila.id}_patente`);
          const horaIngresoStorage = localStorage.getItem(`cochera_${fila.id}_horaIngreso`);
          const horaDeshabilitacionStorage = localStorage.getItem(`cochera_${fila.id}_horaDeshabilitacion`);

          return {
            ...fila,
            activo: patenteStorage && horaIngresoStorage ? { id: -1, patente: patenteStorage, horaIngreso: horaIngresoStorage } : null,
            horaDeshabilitacion: horaDeshabilitacionStorage || (fila.deshabilitada ? new Date().toISOString() : null),
          };
        });
      })
      .catch(error => {
        console.error('Error al cargar las cocheras:', error);
      });
  }

  agregarFila() {
    fetch('http://localhost:4000/cocheras/', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.auth.getToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ descripcion: "" })
    }).then(() => {
      this.reload();
    }).catch(error => {
      console.error('Error en la solicitud:', error);
    });
    this.siguienteNumero += 1;
  }

  async eliminarCochera(cocheraId: number) {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar cochera?',
      text: 'Esta acción eliminará la cochera de la plataforma permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await fetch(`http://localhost:4000/cocheras/${cocheraId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + this.auth.getToken(),
          },
        });
        this.filas = this.filas.filter(fila => fila.id !== cocheraId);
        Swal.fire('Cochera Eliminada', 'La cochera ha sido eliminada de la plataforma.', 'success');
      } catch (error) {
        console.error('Error al eliminar la cochera:', error);
        Swal.fire('Error', 'No se pudo eliminar la cochera. Inténtalo de nuevo.', 'error');
      }
    }
  }

  async cambiarDisponibilidadCochera(cocheraId: number, estadoActual: number) {
    const nuevoEstado = estadoActual === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? 'disable' : 'enable';
    const url = `http://localhost:4000/cocheras/${cocheraId}/${accion}`;
    const mensaje = nuevoEstado === 1 ? 'deshabilitar' : 'habilitar';

    const confirmacion = await Swal.fire({
      title: `¿${mensaje.charAt(0).toUpperCase() + mensaje.slice(1)} cochera?`,
      text: `Esta acción cambiará la disponibilidad a "${mensaje === 'habilitar' ? 'Disponible' : 'No disponible'}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${mensaje}`,
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + this.auth.getToken(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            horaDeshabilitacion: nuevoEstado === 1 ? new Date().toISOString() : null
          })
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const horaDeshabilitacion = nuevoEstado === 1 ? new Date().toISOString() : null;

        if (nuevoEstado === 1) {
          // Almacena la hora de deshabilitación en localStorage solo si no es null
          const horaDeshabilitacionStr = horaDeshabilitacion ?? ""; 
          localStorage.setItem(`cochera_${cocheraId}_horaDeshabilitacion`, horaDeshabilitacionStr);
        } else {
          // Remueve la hora de deshabilitación si está habilitada nuevamente
          localStorage.removeItem(`cochera_${cocheraId}_horaDeshabilitacion`);
        }

        this.filas = this.filas.map(fila => 
          fila.id === cocheraId 
            ? { ...fila, deshabilitada: nuevoEstado, horaDeshabilitacion, activo: nuevoEstado ? null : fila.activo } 
            : fila
        );

        Swal.fire('Disponibilidad Actualizada', `La cochera ha sido marcada como "${nuevoEstado === 1 ? 'No disponible' : 'Disponible'}".`, 'success');
      } catch (error) {
        console.error(`Error al ${mensaje} la cochera:`, error);
        Swal.fire('Error', `No se pudo ${mensaje} la cochera. Verifica la conexión y la URL.`, 'error');
      }
    }
  }

  async abrirModalNuevoEstacionamiento(idCochera: number) {
    await Swal.fire({
      title: "Ingrese la patente del vehículo",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Ingrese una patente válida";
        }
        return null;
      }
    }).then(async (res) => {
      if (res.isConfirmed) {
        const patente = res.value;
        const horaIngreso = new Date().toISOString();

        localStorage.setItem(`cochera_${idCochera}_patente`, patente);
        localStorage.setItem(`cochera_${idCochera}_horaIngreso`, horaIngreso);

        this.filas = this.filas.map(fila => 
          fila.id === idCochera 
            ? { ...fila, activo: { id: -1, patente, horaIngreso } as Estacionamiento, horaDeshabilitacion: null } 
            : fila
        );
        
        Swal.fire('Estacionamiento Abierto', `La cochera fue marcada como ocupada con la patente: ${patente}.`, 'success');
      }
    });
  }

  async abrirModalCerrarEstacionamiento(idCochera: number, estacionamientoId: number) {
    const confirmacion = await Swal.fire({
      title: '¿Cerrar estacionamiento?',
      text: 'Esta acción liberará la cochera y la marcará como disponible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      localStorage.removeItem(`cochera_${idCochera}_patente`);
      localStorage.removeItem(`cochera_${idCochera}_horaIngreso`);

      this.filas = this.filas.map(fila => 
        fila.id === idCochera 
          ? { ...fila, activo: null, horaDeshabilitacion: null } 
          : fila
      );

      Swal.fire('Estacionamiento Cerrado', 'La cochera ha sido liberada y está disponible.', 'success');
    }
  }
}