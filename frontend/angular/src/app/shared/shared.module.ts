import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <<--- Agrega esto
import { EditorComponent } from './editor/editor.component';
import { NgxParticlesModule } from '@tsparticles/angular';

@NgModule({
  declarations: [EditorComponent],
  imports: [CommonModule, FormsModule, NgxParticlesModule],
  exports: [EditorComponent],
})
export class SharedModule {}
