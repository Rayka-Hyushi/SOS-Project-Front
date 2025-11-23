import { Component } from '@angular/core';
import {MatCell, MatHeaderCell, MatHeaderRow, MatRow, MatTable} from '@angular/material/table';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatCard, MatCardContent, MatCardHeader} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-client-component',
  standalone: true,
  imports: [
    MatLabel,
    MatHeaderCell,
    MatButton,
    MatIcon,
    MatCard,
    MatCardHeader,
    MatFormField,
    MatCardContent,
    MatTable,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatPaginator
  ],
  templateUrl: './client-component.html',
  styleUrl: './client-component.css',
})
export class ClientComponent {

}
