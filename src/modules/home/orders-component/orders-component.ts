import {AfterViewInit, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
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
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
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
  serviceToAddUuid: string | null = null;
  selectedServices: Service[] = [];
  clientNames: Record<string, string> = {};
  calculatedTotal: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private orderService: OrderService,
    private servicoService: ServicesService,
    private clientService: ClientService,
    private cdr: ChangeDetectorRef
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
    this.loadClients();
    this.loadServices();
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadClients() {
    this.clientService.getClients('', 0, 100).subscribe({
      next: (page) => {
        this.availableClients = page.content ?? [];
        this.availableClients.forEach(c => {
          if (c?.uuid) {
            this.clientNames[String(c.uuid)] = c.name;
          }
        })
        this.dataSource.data = [...this.dataSource.data];
        this.cdr.detectChanges();
        console.log('loadClients: clientNames', this.clientNames);
      },
      error: (error) => console.error('Erro ao carregar clientes: ', error)
    });
  }

  loadServices(): void {
    this.servicoService.getServices('', 0, 100).subscribe({
      next: (page) => {
        this.availableServices = page.content ?? [];
        this.reconcileSelectedServices();
      },
      error: (error) => console.error('Erro ao carregar serviços: ', error)
    });
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

          console.log('loadOrders: orders', this.dataSource.data);
          (this.dataSource.data || []).forEach(order => {
            const clientUuid = (order as any).clientUUID;
            if (clientUuid && !this.clientNames[clientUuid]) {
              this.clientService.getClientByUUID(clientUuid).subscribe({
                next: client => {
                  if (client?.name) {
                    this.clientNames[clientUuid] = client.name;
                    this.dataSource.data = [...this.dataSource.data];
                    this.cdr.detectChanges();
                    console.log('clientNames updated:', this.clientNames);
                  }
                },
                error: (err) => console.error('Erro ao buscar cliente por UUID:', err)
              });
            }
          });
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

  private reconcileSelectedServices(): void {
    if (!this.selectedServices || this.selectedServices.length === 0) return;
    if (!this.availableServices || this.availableServices.length === 0) return;

    let replaced = false;
    this.selectedServices = this.selectedServices.map(s => {
      const found = this.availableServices.find(a => a.uuid === s.uuid);
      if (found) {
        replaced = true;
        return found;
      }
      return s;
    });

    if (replaced) {
      // atualiza control e UI
      this.orderForm.patchValue({
        serviceUUIDs: this.selectedServices.map(s => s.uuid)
      });
      this.cdr.detectChanges();
    }
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

  openOrderDialog(template: TemplateRef<unknown>, order?: Order): void {
    this.orderForm.reset({
      status: 'ABERTA',
      extras: 0,
      discount: 0,
      serviceUUIDs: []
    });
    this.serviceToAddUuid = null;
    this.selectedServices = [];

    if (order) {
      console.log('openOrderDialog - received order:', order);

      // se API fornece objetos em `servicos`, extrai os UUIDs; caso contrário usa serviceUUIDs
      const servicosArray = (order as any).servicos && Array.isArray((order as any).servicos)
        ? (order as any).servicos as any[]
        : [];

      const serviceUUIDsFromOrder: string[] = Array.isArray(order.serviceUUIDs) && order.serviceUUIDs.length
        ? order.serviceUUIDs
        : (servicosArray.length ? servicosArray.map(s => s.uuid) : []);

      console.log('openOrderDialog - resolved serviceUUIDs:', serviceUUIDsFromOrder);

      // popular selectedServices: prefer objetos já carregados em availableServices,
      // depois tentar reaproveitar o objeto vindo em order.servicos, por fim placeholder.
      this.selectedServices = serviceUUIDsFromOrder.map(uuid => {
        const svc = this.availableServices.find(s => s.uuid === uuid);
        if (svc) return svc;

        const fromOrder = servicosArray.find(s => s.uuid === uuid);
        if (fromOrder) {
          // normaliza o objeto vindo do servidor para o tipo Service esperado
          return {
            uuid: fromOrder.uuid,
            service: fromOrder.service ?? fromOrder.name ?? 'Serviço',
            value: Number(fromOrder.value ?? fromOrder.preco ?? 0)
          } as Service;
        }

        return { uuid, service: 'Carregando...', value: 0 } as Service;
      });

      // tenta reconciliar imediatamente caso availableServices já tenha sido carregado
      this.reconcileSelectedServices();

      // atualiza o form com os uuids e demais campos
      this.orderForm.patchValue({
        ...order,
        serviceUUIDs: serviceUUIDsFromOrder,
        extras: order.extras ?? 0,
        discount: order.discount ?? 0
      });

      this.calculateTotal(this.orderForm.value);
      this.cdr.detectChanges();
    } else {
      this.calculatedTotal = 0;
    }

    // passar uma cópia do order ao diálogo para evitar efeitos colaterais
    const dialogData = order ? JSON.parse(JSON.stringify(order)) : null;

    this.dialog.open(template, {
      width: '520px',
      data: dialogData,
      autoFocus: false,
    });

    console.log('openOrderDialog - selectedServices after setup:', this.selectedServices);
  }

  addSelectedService(): void {
    if (!this.serviceToAddUuid) return;
    const exists = this.selectedServices.some(s => s.uuid === this.serviceToAddUuid);
    if (exists) {
      this.serviceToAddUuid = null;
      return;
    }
    const svc = this.availableServices.find(s => s.uuid === this.serviceToAddUuid);
    const toPush = svc ?? ({ uuid: this.serviceToAddUuid, service: 'Carregando...', value: 0 } as Service);
    this.selectedServices.push(toPush);
    // atualizar o form control com os uuids
    this.orderForm.patchValue({
      serviceUUIDs: this.selectedServices.map(s => s.uuid)
    });
    this.serviceToAddUuid = null;
    this.calculateTotal(this.orderForm.value);
    // forçar detecção se necessário
    this.cdr.detectChanges();
  }

  removeSelectedService(uuid: string): void {
    this.selectedServices = this.selectedServices.filter(s => s.uuid !== uuid);
    this.orderForm.patchValue({
      serviceUUIDs: this.selectedServices.map(s => s.uuid)
    });
    this.calculateTotal(this.orderForm.value);
    this.cdr.detectChanges();
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

  getClientName(uuid: string): string {
    return this.clientNames[uuid];
  }
}
