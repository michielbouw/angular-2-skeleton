import { NgModule }             from '@angular/core';
import { FormsModule }          from '@angular/forms';
import { BrowserModule }        from '@angular/platform-browser';

import { AppComponent }         from './app.component';
import { DashboardComponent }   from './dashboard/dashboard.component';
import { HeroDetailComponent }  from './heroes/hero-detail.component';
import { HeroesComponent }      from './heroes/heroes.component';
import { HeroService }          from './heroes/model/hero.service';

import { AppRoutingModule }     from './app-routing.module';

@NgModule({
    imports:      [
        BrowserModule,
        FormsModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        DashboardComponent,
        HeroDetailComponent,
        HeroesComponent
    ],
    providers:    [
        HeroService
    ],
    bootstrap: [ AppComponent ]
})

export class AppModule { }
