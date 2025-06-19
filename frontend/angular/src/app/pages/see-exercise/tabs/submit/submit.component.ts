import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorComponent } from '../../../../shared/editor/editor.component';

@Component({
  selector: 'app-submit',
  templateUrl: './submit.component.html',
  styleUrls: ['./submit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, EditorComponent],
})
export class SubmitComponent {
  @Output() solutionSubmitted = new EventEmitter<string>();

  solutionCode = '';

  submitSolution(): void {
    this.solutionSubmitted.emit(this.solutionCode);
  }
}