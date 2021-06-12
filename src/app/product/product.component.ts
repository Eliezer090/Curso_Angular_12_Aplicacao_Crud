import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Department } from '../department';
import { DepartmentService } from '../department.service';
import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  productForm: FormGroup = this.fb.group({
    _id: [null],
    name: ['', [Validators.required,]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    departments: [[], [Validators.required]]
  });

  @ViewChild('form') form:NgForm;

  products: Product[] = []
  department: Department[] = []
  unsubs: Subject<any> = new Subject<any>();

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private departmentService: DepartmentService
  ) {
    this.productService.get()
      .pipe(takeUntil(this.unsubs))
      .subscribe((prods) => this.products = prods);
    this.departmentService.get()
      .pipe(takeUntil(this.unsubs))
      .subscribe((deps) => this.department = deps);
  }

  ngOnInit(): void {
  }

  save() {
    let data = this.productForm.value;
    if (data._id != null) {
      this.productService.update(data).subscribe();
    } else {
      this.productService.add(data).subscribe();
    }
    this.limpaCampos();
  }

  delete(prod: Product) {
    this.productService.del(prod).subscribe();
  }

  edit(prod: Product) {
    this.productForm.setValue(prod);
  }

  limpaCampos(){
    //seria o certo mas nao funciona
    //this.productForm.reset();
    this.form.resetForm();
  }

  ngOnDestroy() {
    this.unsubs.next();
  }



}
