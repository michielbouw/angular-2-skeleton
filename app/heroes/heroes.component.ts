import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Hero } from './model/hero';
import { HeroService } from './model/hero.service';

@Component({
    selector: 'main-heroes',
    template: `
        <div class="heroes-content">
            <h2>My Heroes</h2>
            <ul class="heroes">
                <li *ngFor="let hero of heroes"
                        [class.selected]="hero === selectedHero"
                        (click)="onSelect(hero)">
                    <span class="badge">{{ hero.id }}</span> {{ hero.name }}
                </li>
            </ul>
            <br />
            <div *ngIf="selectedHero">
                <h2>
                    {{ selectedHero.name | uppercase }} is my hero
                </h2>
                <button (click)="gotoDetail()">View Details</button>
            </div>
        </div>
    `
})

export class HeroesComponent implements OnInit {
    heroes: Hero[];
    selectedHero: Hero;

    constructor(
        private router: Router,
        private heroService: HeroService
    ) {}

    ngOnInit(): void {
        this.heroService.getHeroes()
            .then(heroes => this.heroes = heroes);
    }

    onSelect(hero: Hero): void {
        this.selectedHero = hero;
    }

    gotoDetail(): void {
        let link = ['/detail', this.selectedHero.id];
        this.router.navigate(link);
    }
}
