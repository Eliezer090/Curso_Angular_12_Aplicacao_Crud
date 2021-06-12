import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { Department } from './department';
import { DepartmentService } from './department.service';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  readonly url: string = "http://localhost:3000/products";
  private products: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>(null);
  private loaded: boolean = false;
  constructor(
    private http: HttpClient,
    private department: DepartmentService) {

  }

  get(): Observable<Product[]> {
    if (!this.loaded) {
      combineLatest(
        this.http.get<Product[]>(this.url),
        this.department.get()
      ).pipe(
        //com esse filter evita que tente ser dado o map abaixo nos departments se ainda nao chegarem, só vai seguir depois que os 2 chegarem.
        filter(([products, departments]) => products != null && departments != null),
        map(([products, departments]) => {
          for (let p of products) {
            let ids = (p.departments as string[]);
            p.departments = ids.map((id) => departments.find(dep => dep._id == id));
          }
          return products;
        })

      ).subscribe(this.products);
      this.loaded = true;
    }

    return this.products.asObservable();
  }

  add(prod: Product): Observable<Product> {
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http.post<Product>(this.url, { ...prod, departments }).pipe(tap((p) => {
      this.products.getValue().push({ ...prod, _id: p._id })
    }));
  }

  del(prod: Product): Observable<any> {
    return this.http.delete(`${this.url}/${prod._id}`).pipe(tap(() => {
      let produc = this.products.getValue();
      let i = produc.findIndex(p => p._id === prod._id);
      if (i >= 0) {
        produc.splice(i, 1);
      }
    }))
  }

  update(prod: Product): Observable<Product> {
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http.patch<Product>(`${this.url}/${prod._id}`, { ...prod, departments }).pipe(tap(() => {
      let produc = this.products.getValue();
      let i = produc.findIndex(p => p._id === prod._id);
      if (i >= 0) {
        produc[i] = prod;
      }
    }))
  }

}
