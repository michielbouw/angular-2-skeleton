import { Component } from '@angular/core';

export class Hero {
    id: number;
    name: string;
}

@Component({
    selector: 'main-app',
    template: `
        <h1>Angular 2 Skeleton App</h1><br>
        <h2>{{ title }}</h2>
        <p>{{ hero.name }} details!</p>
        <div><label>id: </label>{{ hero.id }}</div>
        <div>
            <label>name: </label>
            <input [(ngModel)]="hero.name" placeholder="name">
        </div>
        `
})

export class AppComponent {
    title = 'Tour of Heroes';
    hero: Hero = {
        id: 1,
        name: 'Windstorm'
    };
}
