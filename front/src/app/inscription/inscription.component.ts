import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent implements OnInit {
  InscriptionForm: FormGroup;
  submitted = false;
  success = false;
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.InscriptionForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
  });
  }
  
  onSubmit() {
    this.submitted = true;

    if (this.InscriptionForm.invalid) {
        return;
    }

    this.success = true;
  }
}
