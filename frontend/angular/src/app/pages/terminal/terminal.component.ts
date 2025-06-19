import { Component } from '@angular/core';
import { EditorComponent } from '../../shared/editor/editor.component';

@Component({
  selector: 'app-terminal',
  imports: [EditorComponent],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.scss',
})
export class TerminalComponent {}

