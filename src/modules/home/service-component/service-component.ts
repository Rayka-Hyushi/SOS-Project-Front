import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef, MatNoDataRow,
  MatRow, MatRowDef, MatTable, MatTableDataSource
} from "@angular/material/table";
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatFormField} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput, MatLabel} from "@angular/material/input";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Service} from '../../../core/models/service';
import {ServicesService} from '../../../core/services/services-service';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-service-component',
  imports: [
    MatButton,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSort,
    MatTable,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    MatHeaderCellDef,
    MatNoDataRow
  ],
  templateUrl: './service-component.html',
  styleUrl: './service-component.css',
})
export class ServiceComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['service', 'description', 'value', 'actions'];
  dataSource = new MatTableDataSource<Service>();
  serviceForm: FormGroup;

  filters = {search: ''};
  totalServices = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private dialog: MatDialog, private serviceService: ServicesService) {
    this.serviceForm = this.fb.group({
      uuid: [],
      service: ['', Validators.required],
      description: ['', [Validators.required]],
      value: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadServices();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  private loadServices(): void {
    this.loading = true;
    this.serviceService
      .getServices(this.filters.search, this.pageIndex, this.pageSize)
      .subscribe({
        next: page => {
          this.dataSource.data = page.content ?? [];
          this.totalServices = page.totalElements ?? 0;
          this.loading = false;
          if (this.paginator && this.paginator.pageIndex !== this.pageIndex) {
            this.paginator.pageIndex = this.pageIndex;
          }
        },
        error: () => {
          this.dataSource.data = [];
          this.totalServices = 0;
          this.loading = false;
        }
      })
  }

  openServiceDialog(template: TemplateRef<unknown>, service?: Service): void {
    this.serviceForm.reset(service ?? {});
    this.dialog.open(template, {
      width: '520px',
      data: service ?? null,
      autoFocus: false,
    });
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const formValue = this.serviceForm.getRawValue() as Service;

    const request$ = formValue.uuid
      ? this.serviceService.updateService(String(formValue.uuid), formValue)
      : this.serviceService.createService(formValue);
    request$.subscribe({
      next: () => {
        this.dialog.closeAll();
        this.loadServices();
      }
    });
  }

  deleteService(service: Service): void {
    this.serviceService.deleteService(String(service.uuid)).subscribe({
      next: () => {
        if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
          this.pageIndex = this.pageIndex - 1;
          this.paginator.pageIndex = this.pageIndex;
        }
        this.loadServices();
      },
    });
  }

  applySearch(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadServices();
  }

  clearSearch(): void {
    this.filters.search = '';
    this.applySearch();
  }

  changePage(event: PageEvent): void {
    const sizeChanged = event.pageSize !== this.pageSize;
    this.pageSize = event.pageSize;
    this.pageIndex = sizeChanged ? 0 : event.pageIndex;
    if (this.paginator && sizeChanged) {
      this.paginator.pageIndex = 0;
    }
    this.loadServices();
  }
}
