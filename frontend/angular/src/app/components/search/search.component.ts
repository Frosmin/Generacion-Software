import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import {
  MatAutocompleteActivatedEvent,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface User {
  name: string;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  private _resetTrigger = 0;

  @Input() courses: string[] = [];
  @Input()
  set resetTrigger(value: number) {
    if (value !== 0) {
      this.reset();
    }
  }
  @Output() selectedIndex = new EventEmitter<number>();
  myControl = new FormControl<string>('');
  // options: string[] = ['Mary', 'Shelley', 'Igor'];
  filteredOptions!: Observable<string[]>;

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        return this._filter(value as string);
      })
    );
  }

  displayFn(name: string): string {
    return name ? name : '';
  }

  private _filter(name: string): string[] {
    const filterValue = name.toLowerCase();

    return this.courses.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  onOptionSelected(event: MatAutocompleteActivatedEvent) {
    const selectedValue = event.option?.value;
    const index = this.courses.indexOf(selectedValue);
    if (index !== -1) {
      this.selectedIndex.emit(index);
    }
  }

  reset() {
    this.myControl.setValue('');
  }
}
