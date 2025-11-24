import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {Order} from '../../../core/models/ordens';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {OrderService} from '../../../core/services/order-service';

@Component({
  selector: 'app-orders-component',
  imports: [],
  templateUrl: './orders-component.html',
  styleUrl: './orders-component.css',
})
export class OrdersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['clientName', 'status', 'createdAt', 'totalValue', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  orderForm: FormGroup;

  filters = {
    clienteFiltro: '',
    statusFiltro: '',
    dataInicio: null as Date | null,
    dataFim: null as Date | null,
    filtrarDataCriacao: true,
  };

  statusOptions = [
    {value: 'ABERTA', viewValue: 'Aberta'},
    {value: 'EM_ANDAMENTO', viewValue: 'Em Andamento'},
    {value: 'CONCLUIDA', viewValue: 'Concluída'},
    {value: 'FINALIZADA', viewValue: 'Finalizada'}
  ];

  totalOrders = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private dialog: MatDialog, private orderService: OrderService) {
    this.orderForm = this.fb.group({
      uuid: [],
      clienteUuid: ['', Validators.required],
      device: ['', Validators.required],
      description: ['', Validators.required],
      serviceUUIDs: ['', Validators.required],
      status: ['', Validators.required],
      extra: ['', Validators.required],
      discount: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  private loadOrders(): void {
    this.loading = true;
    const dataInicioStr = this.filters.dataInicio ? this.filters.dataInicio.toISOString().split('T')[0] : undefined;
    const dataFimStr = this.filters.dataFim ? this.filters.dataFim.toISOString().split('T')[0] : undefined;

    this.orderService
      .getOrders(
        this.filters.clienteFiltro,
        this.filters.statusFiltro,
        dataInicioStr,
        dataFimStr,
        this.filters.filtrarDataCriacao,
        this.pageIndex,
        this.pageSize
      )
      .subscribe({
        next: page => {
          this.dataSource.data = page.content ?? [];
          this.totalOrders = page.totalElements ?? 0;
          this.loading = false;
          if (this.paginator && this.paginator.pageIndex !== this.pageIndex) {
            this.paginator.pageIndex = this.pageIndex;
          }
        },
        error: () => {
          this.dataSource.data = [];
          this.totalOrders = 0;
          this.loading = false;
        }
      })
  }

  openOrderDialog(template: TemplateRef<unknown>, order?: Order): void {
    this.orderForm.reset(order ?? {});
    this.dialog.open(template, {
      width: '600px',
      data: order ?? null,
      autoFocus: false,
    });
  }

  saveOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.getRawValue() as Order;

    const request$ = formValue.uuid
      ? this.orderService.updateOrder(String(formValue.uuid), formValue)
      : this.orderService.createOrder(formValue);

    request$.subscribe({
      next: () => {
        this.dialog.closeAll();
        this.loadOrders();
      }
    });
  }

  deleteOrder(order: Order): void {
    this.orderService.deleteOrder(String(order.uuid)).subscribe({
      next: () => {
        if (this.dataSource.data.length === 1 && this.pageIndex > 0) {
          this.pageIndex = this.pageIndex - 1;
          this.paginator.pageIndex = this.pageIndex;
        }
        this.loadOrders();
      },
    });
  }

  applySearch(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadOrders();
  }

  clearSearch(): void {
    this.filters.clienteFiltro = '';
    this.filters.statusFiltro = '';
    this.filters.dataInicio = null;
    this.filters.dataFim = null;
    this.applySearch();
  }

  changePage(event: PageEvent): void {
    const sizeChanged = event.pageSize !== this.pageSize;
    this.pageSize = event.pageSize;
    this.pageIndex = sizeChanged ? 0 : event.pageIndex;
    if (this.paginator && sizeChanged) {
      this.paginator.pageIndex = 0;
    }
    this.loadOrders();
  }
}
