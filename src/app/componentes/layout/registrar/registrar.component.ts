import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatosUsuariosService } from '../../../servicios/usuario/datos-usuarios.service';

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './registrar.component.html',
  styleUrl: './registrar.component.css'
})
export class RegistrarComponent implements OnInit {
  matriculado: any;
  nombresCursos: any;
  cursos: any[] = [];  // Cursos que el alumno ya tiene matriculados
  cursosFiltrados: any[] = [];
  platformId = inject(PLATFORM_ID);
  servicio = inject(DatosUsuariosService);
  codigo: string = '';
  idMatricula: string = '';
  expediente: string = '';
  
  // Propiedad para almacenar los datos del nuevo curso
  nuevoCurso: any = {
    codigoCurso:'',
    nombreCurso: '',
    seccion1: '',
    seccion2: ''
  };

  // Lista de cursos nuevos que el alumno quiere agregar
  cursosNuevos: any[] = [];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      let dato = sessionStorage.getItem("usuario");
      if (dato) {
        this.matriculado = JSON.parse(dato);
        this.codigo = JSON.parse(dato).codigoAlumno;
      }
      let datos = { "codigo": this.codigo };
      this.servicio.cursos(datos).subscribe(
        (data) => {
          let respuesta = data;
          this.idMatricula = respuesta.idMatricula;
          this.cursos = respuesta.objetos.map((curso: any) => ({
            ...curso, rectificacion: false
          }));
          this.servicio.nombresCurso().subscribe(
            (data2) => {
              let respuesta = data2;
              if(respuesta.resultado){
                this.nombresCursos = respuesta.objetos;
                console.log(this.nombresCursos)
              }else{
                console.log("Error al obtener el nombre de los cursos.");
              }
              
            }
          )
        }
      );
    }
  }

  actualizarFiltrados() {
    // Filtramos solo los cursos que tienen la opción de rectificación activada
    this.cursosFiltrados = this.cursos.filter(curso => curso.rectificacion)
                                      .map(curso => ({
                                        codigo: curso.codigoCurso,
                                        nombre: curso.nombreCurso,
                                        seccion: curso.seccion,
                                        cambio: false,
                                        nuevaSeccion: '',
                                        nuevaSeccion2: '',
                                        retiro: false,
                                        motivo: ''
                                      }));
  }

  actualizarRectificacion() {
    this.actualizarFiltrados();
  }

  llenarCurso(data:any){
    this.nuevoCurso.codigoCurso = this.nombresCursos.find((nombres:any)=>nombres.nombre == data)?.codigo || ''
  }

  // Función para agregar un nuevo curso
  agregarNuevoCurso() {
    if (this.nuevoCurso.codigoCurso && this.nuevoCurso.nombreCurso && this.nuevoCurso.seccion1 && this.nuevoCurso.seccion2) {
      // Solo agregamos el nuevo curso si todos los campos están completos
      this.cursosNuevos.push({
        codigo: this.nuevoCurso.codigoCurso,
        nombreCurso: this.nuevoCurso.nombreCurso,
        seccion:0,
        cambio:true,
        nuevaSeccion: this.nuevoCurso.seccion1,
        nuevaSeccion2: this.nuevoCurso.seccion2,
        retiro:false,
        motivo: ''
      });
      // Limpiar los campos después de agregar el curso
      this.nuevoCurso = {
        codigoCurso:'',
        nombreCurso: '',
        seccion1: '',
        seccion2: ''
      };
      alert('Nuevo curso agregado con éxito.');
    } else {
      alert('Por favor, complete todos los campos para el nuevo curso.');
    }
  }

  // Función para eliminar un curso de la lista
  eliminarCurso(index: number) {
    this.cursosNuevos.splice(index, 1);
  }

  // Función para enviar los datos al backend
  enviarRectificacion() {
    if (this.expediente !== '') {
      let datos = {
        expediente: this.expediente,
        codigoAlumno: this.codigo,
        idMatricula: this.idMatricula,
        rectificar: this.cursosFiltrados,  // Cursos que el alumno quiere rectificar
        cursosNuevos: this.cursosNuevos  // Cursos nuevos que el alumno quiere agregar
      };
      
      console.log(datos);  // Aquí puedes ver lo que se enviará al backend

      // Llamada al servicio para registrar la rectificación y los cursos nuevos
      this.servicio.rectificar(datos).subscribe(
        (data) => {
          let respuesta = data;
          if (respuesta.resultado) {
            alert('Se registró la rectificación de forma exitosa.');
          } else {
            alert('Error al registrar la rectificación.');
          }
        }
      );
    } else {
      alert('Por favor, llene el campo de expediente.');
    }
  }
}
