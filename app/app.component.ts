import { Component } from '@angular/core';

@Component({
    selector: 'main-app',
    template: `
        <h1>{{ title }}</h1>
        <nav>
            <a routerLink="/dashboard">Dashboard</a>
            <a routerLink="/heroes">Heroes</a>
        </nav>
        <div class="wrapper">
            <router-outlet></router-outlet>
        </div>
    `
})

export class AppComponent {
    title = 'Angular 2 Skeleton App';
}
