import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleteFormModalComponent } from './athlete-form-modal.component';

describe('AthleteFormModalComponent', () => {
  let component: AthleteFormModalComponent;
  let fixture: ComponentFixture<AthleteFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AthleteFormModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AthleteFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
