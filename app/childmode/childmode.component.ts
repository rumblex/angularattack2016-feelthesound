import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES, Routes } from '@angular/router';
import { ChildStreamService, StreamerState } from '../services/stream/child-streamer.service';


@Component({
  directives: [ROUTER_DIRECTIVES],
  template: `
    <div class="uk-grid" data-uk-scrollspy="{cls:'uk-animation-fade'}">
        <div class="uk-width-large-1-1">
            <form class="uk-form">
                <div class="uk-form-row">
                    <h3 class="uk-panel-title uk-text-primary">Child's device</h3>
                    Enter some subscription id and start capturing sounds near your child. Use the same ID in another device where you will listen.
                </div>
                <div class="uk-form-row">
                    <input class="uk-form-width-medium" [ngClass]="{disabled: entryDisabled}"
                           type="text" placeholder="Enter Subscription ID" 
                           [disabled]="entryDisabled" [(ngModel)]="subscriptionId">
                </div>
                <div class="uk-form-row">
                    <button class="uk-button" [ngClass]="{'uk-button-danger': service.getIsStarted()}" (click)="toggleStreaming()"
                            [disabled]="!subscriptionId">
                        <i *ngIf="toggleInProgress" class="uk-icon-spinner uk-icon-spin"></i>
                        <i *ngIf="!toggleInProgress && service.getIsStarted()" class="uk-icon-stop-circle-o"></i>
                        <i *ngIf="!toggleInProgress && !service.getIsStarted()" class="uk-icon-play-circle-o"></i>
                        &nbsp;{{streamingButtonText}}
                    </button>
                </div>
                <div class="uk-form-row">

                </div>
            </form>
            <div *ngIf="service.getIsStarted() && service.streamerState">
                <div class="uk-width-medium-1-2 uk-width-large-1-3 uk-row-first">
                    <div class="uk-panel uk-panel-box uk-text-left">
                    Connected devices in parent mode: <code>{{service.streamerState.listenerCount}}</code>
                    </div>
                </div>
            <div>
        </div>

    </div>
    <div class="uk-grid uk-align-center">
        <a class="uk-button-link" [routerLink]="['/modeselectionmultipledevices']"><i class="uk-icon-arrow-left"></i> Back</a>
    </div>
    `
})
@Routes([
  {path: '/child', component: ChildMode},
])
export class ChildMode {
    private subscriptionId: string;
    private entryDisabled: boolean;
    private streamingButtonText: string;
    private toggleInProgress: boolean;

    constructor(private service: ChildStreamService) {
        // TODO: Auto toggle based on url
        this.subscriptionId = service.subscriptionId;
        this.setViewState();
    }

    toggleStreaming() {
        this.toggleInProgress = true;
        this.setViewState();

        if (this.service.getIsStarted()) {
            this.service.stop();
            this.toggleInProgress = false;
            this.setViewState();
        } else {
            var self = this;
            this.service.start(this.subscriptionId, () => {
                self.toggleInProgress = false;
                this.setViewState();
            });
        }
    }

    setViewState() {
        if (this.toggleInProgress) {
            this.streamingButtonText = 'Loading';
            this.entryDisabled = true;
        } else if (this.service.getIsStarted()) {
            this.streamingButtonText = 'Stop capturing sounds'
            this.entryDisabled = true;
        } else {
            this.streamingButtonText = 'Start capturing sounds';
            this.entryDisabled = false;
        }
    }
}
