import { Routes } from '@angular/router';

export const routes: Routes = [
  {path: '', loadChildren: () => import('../modules/root/root-module').then(m => m.RootModule)}
];
