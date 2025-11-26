import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {Order} from '../../../core/models/ordens';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {OrderService} from '../../../core/services/order-service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatError, MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import {MatTooltip} from '@angular/material/tooltip';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {provideNativeDateAdapter} from '@angular/material/core';
import {Service} from '../../../core/models/service';
import {ServicesService} from '../../../core/services/services-service';
import {Cliente} from '../../../core/models/cliente';
import {ClientService} from '../../../core/services/client-service';

@Component({
  selector: 'app-orders-component',
  imports: [
    MatButton,
    MatCard,
    MatFormField,
    MatIcon,
    FormsModule,
    MatInput,
    MatSelect,
    MatOption,
    NgForOf,
    MatDateRangeInput,
    MatDatepickerModule,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatTooltip,
    MatCardContent,
    MatTable,
    MatLabel,
    MatHint,
    MatError,
    MatSort,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    DatePipe,
    CurrencyPipe,
    MatIconButton,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatNoDataRow,
    NgIf,
    MatProgressSpinner,
    MatCardActions,
    MatPaginator,
    MatDialogTitle,
    MatDialogContent,
    ReactiveFormsModule,
    MatDialogActions,
    MatDialogClose
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './orders-component.html',
  styleUrl: './orders-component.css',
})
export class OrdersComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['clientName', 'device', 'openDate', 'closeDate', 'totalValue', 'status', 'actions'];
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

  availableServices: Service[] = [];
  availableClients: Cliente[] = [];
  calculatedTotal: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private orderService: OrderService,
    private servicoService: ServicesService,
    private clientService: ClientService
  ) {
    this.orderForm = this.fb.group({
      uuid: [],
      clienteUuid: ['', Validators.required],
      device: ['', Validators.required],
      description: ['', Validators.required],
      serviceUUIDs: [[], Validators.required],
      status: ['', Validators.required],
      extras: ['', Validators.required],
      discount: ['', Validators.required]
    });
    this.setupTotalCalculation();
  }

  ngOnInit() {
    this.loadOrders();
    this.loadServices();
    this.loadClients();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadClients() {
    this.clientService.getClients('', 0, 100).subscribe({
      next: (page) => {
        this.availableClients = page.content ?? [];
      },
      error: (error) => console.error('Erro ao carregar clientes: ', error)
    });
  }

  loadServices(): void {
    this.servicoService.getServices('', 0, 100).subscribe({
      next: (page) => {
        this.availableServices = page.content ?? [];
      },
      error: (error) => console.error('Erro ao carregar serviços: ', error)
    });
  }

  setupTotalCalculation(): void {
    this.orderForm.valueChanges.subscribe(values => {
      this.calculateTotal(values);
    });
  }

  calculateTotal(formValues: any): void {
    const selectedServiceUUIDs: string[] = formValues.serviceUUIDs || [];
    const extras = Number(formValues.extras) || 0;
    const discount = Number(formValues.discount) || 0;
    let servicesTotal = 0;

    if (this.availableServices.length > 0) {
      selectedServiceUUIDs.forEach(uuid => {
        const service = this.availableServices.find(s => s.uuid === uuid);
        if (service) {
          servicesTotal += Number(service.value);
        }
      });
    }
    this.calculatedTotal = servicesTotal + extras - discount;
    if (this.calculatedTotal < 0) this.calculatedTotal = 0;
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
    this.orderForm.reset({
      status: 'ABERTA',
      extras: 0,
      discount: 0,
      serviceUUIDs: []
    });
    this.dialog.open(template, {
      width: '520px',
      data: order ?? null,
      autoFocus: false,
    });
    if (order) {
      const serviceUUIDs = Array.isArray(order.serviceUUIDs) ? order.serviceUUIDs.map((s: any) => s.uuid) : [];

      this.orderForm.patchValue({
        ...order,
        serviceUUIDs: serviceUUIDs,
        extras: order.extras ?? 0,
        discount: order.discount ?? 0
      });
      this.calculateTotal(this.orderForm.value);
    } else {
      this.calculatedTotal = 0;
    }
  }

  saveOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.getRawValue();
    const payload = {
      ...formValue,
      extras: Number(formValue.extras ?? 0),
      discount: Number(formValue.discount ?? 0),
      servicosUuids: formValue.serviceUUIDs ?? []
    };
    delete (payload as any).serviceUUIDs;

    const request$ = payload.uuid
      ? this.orderService.updateOrder(String(payload.uuid), payload)
      : this.orderService.createOrder(payload);

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
