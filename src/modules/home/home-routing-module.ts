import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home-component';
import {homeGuard} from '../../core/security/home-guard';
import {DashboardComponent} from './dashboard-component/dashboard-component';
import {ClientComponent} from './client-component/client-component';
import {ServiceComponent} from './service-component/service-component';

const routes: Routes = [
  {
    path: '', component: HomeComponent, canActivateChild: [homeGuard], children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent},
      {path: 'clients', component: ClientComponent},
      {path: 'services', component: ServiceComponent}
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {
}
