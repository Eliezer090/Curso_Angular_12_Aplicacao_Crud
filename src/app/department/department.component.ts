import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Department } from '../department';
import { DepartmentService } from '../department.service';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {

  depName: string = '';
  department: Department[] = [];
  depEdit: Department = null;
  private unsubscribe$:Subject<any> = new Subject();
  constructor(private departService: DepartmentService,
    private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.departService.get()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((deps) => {
      this.department = deps;
    })
  }

  save() {
    if (this.depEdit) {
      this.departService.update({ name: this.depName, _id: this.depEdit._id }).subscribe((dep) => {
        this.clearFields();
        this.notify("Updated");
      }, (err) => {
        this.notify("Error");
        console.error(err);
      })
    } else {
      this.departService.add({ name: this.depName }).subscribe((dep) => {
        this.clearFields();
        this.notify("Inserted");
      }, (err) => {
        this.notify("Error");
        console.error(err)
      })
    }
  }

  cancel() {
    this.clearFields();
  }

  delete(dep: Department) {
    this.departService.del(dep).subscribe(()=>{
      this.notify("Removido");
    },(err)=>{
      this.notify(err.error.msg);
    })
  }
  edit(dep: Department) {
    this.depName = dep.name;
    this.depEdit = dep;
  }
  clearFields() {
    this.depName = '';
    this.depEdit = null;
  }

  notify(msg:string){
    this.snackBar.open(msg,"ok",{duration:3000});
  }

  ngOnDestroy(){
    this.unsubscribe$.next();
  }
}
