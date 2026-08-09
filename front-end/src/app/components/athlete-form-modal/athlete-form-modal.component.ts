import { Component, EventEmitter, Input, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core'; // <-- Cambiar TranslateModule por TranslatePipe

@Component({
  selector: 'app-athlete-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe], // <-- Usar TranslatePipe aquí
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './athlete-form-modal.component.html',
  styleUrl: './athlete-form-modal.component.css'
})
export class AthleteFormModalComponent {
  @Input() open = false;
  @Input() isEditMode = false;
  @Input() form!: FormGroup;
  @Input() hommesCategories: string[] = [];
  @Input() femmesCategories: string[] = [];
  @Input() niveaux: string[] = [];

  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
