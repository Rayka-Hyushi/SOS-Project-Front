import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Cliente, ClienteRequestDTO} from '../../../core/models/cliente';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {ClientService} from '../../../core/services/client-service';
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-client-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon,
    MatCard,
    MatFormField,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatCardActions,
    MatPaginator,
    MatDialogContent,
    MatDialogActions,
    MatTable,
    FormsModule,
    MatLabel,
    MatButton,
    MatInput,
    MatIconButton,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatNoDataRow,
    MatDialogTitle,
    MatDialogClose,
    MatProgressSpinner,
    MatSuffix
  ],
  templateUrl: './client-component.html',
  styleUrl: './client-component.css',
})
export class ClientComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'phone', 'email', 'address', 'actions'];
  dataSource = new MatTableDataSource<Cliente>();
  clientForm: FormGroup;

  filters = {search: ''};
  totalClients = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private dialog: MatDialog, private clientService: ClientService) {
    this.clientForm = this.fb.group({
      uuid: [],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  private loadClients(): void {
    this.loading = true;

    this.clientService
      .getClients(this.filters.search, this.pageIndex, this.pageSize)
      .subscribe({
        next: page => {
          this.dataSource.data = page.content ?? [];
          this.totalClients = page.totalElements ?? 0;
          this.loading = false;

          if (this.paginator && this.paginator.pageIndex !== this.pageIndex) {
            this.paginator.pageIndex = this.pageIndex;
          }
        },
        error: () => {
          this.dataSource.data = [];
          this.totalClients = 0;
          this.loading = false;
        }
      })
  }

  openClientDialog(template: TemplateRef<unknown>, client?: Cliente): void {
    this.clientForm.reset(client ?? {});
    this.dialog.open(template, {
      width: '520px',
      data: client ?? null,
      autoFocus: false,
    });
  }

  saveClient(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const formValue = this.clientForm.getRawValue() as ClienteRequestDTO;

    const request$ = formValue.uuid
      ? this.clientService.updateClient(String(formValue.uuid), formValue)
      : this.clientService.createClient(formValue);

    request$.subscribe({
      next: () => {
        this.dialog.closeAll();
        this.loadClients();
      }
    });
  }

  deleteClient(client: Cliente): void {
    this.clientService.deleteClient(String(client.uuid)).subscribe({
      next: () => {
        if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
          this.pageIndex = this.pageIndex - 1;
          this.paginator.pageIndex = this.pageIndex;
        }
        this.loadClients();
      },
    });
  }

  applySearch(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadClients();
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

    this.loadClients();
  }
}
