import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, map} from 'rxjs';

@Component({
  selector: 'app-root-component',
  imports: [
    RouterOutlet
  ],
  templateUrl: './root-component.html',
  styleUrl: './root-component.css',
})
export class RootComponent implements OnInit {
  title = "Bem-Vindo ao Service Order System!";

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute.root),
      map(route => this.traverseRouteData(route)),
      filter(data => data && data['title'])
    ).subscribe(data => {
      this.title = data['title'];
    });
    const initialData = this.traverseRouteData(this.activatedRoute.root);
    if (initialData && initialData['title']) {
      this.title = initialData['title'];
    }
  }

  private traverseRouteData(route: ActivatedRoute): any {
    let data = route.snapshot.data;
    if (route.firstChild) {
      data = this.traverseRouteData(route.firstChild);
    }
    return data;
  }
}
