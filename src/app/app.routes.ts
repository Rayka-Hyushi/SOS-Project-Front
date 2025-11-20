import {Routes} from '@angular/router';
import {homeGuard} from '../core/security/home-guard';

export const routes: Routes = [
  {path: '', loadChildren: () => import('../modules/root/root-module').then(m => m.RootModule)},
  {path: 'home', canActivate: [homeGuard], loadChildren: () => import('../modules/home/home-module').then(m => m.HomeModule)}
];
