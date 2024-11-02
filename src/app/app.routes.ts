import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { EstadoCocherasComponent } from './pages/estado-cocheras/estado-cocheras.component';
import { ReporteComponent } from './pages/reporte/reporte.component';
import { PreciosComponent } from './pages/precios/precios.component';
import { UsuarioComponent } from './pages/usuario/usuario.component';

export const routes: Routes = [
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "estado-cocheras",
        component: EstadoCocherasComponent
    },
    {
        path: "reportes",
        component: ReporteComponent
    },
    {
        path: "precios",
        component: PreciosComponent
    },
    {
        path: "usuario",
        component: UsuarioComponent
    },
    {
        path: "",
        redirectTo: "login",
        pathMatch: "full"
    },
    
];
