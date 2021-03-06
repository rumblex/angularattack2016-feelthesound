import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { VoiceService } from '../services/voice/voice.service';
import { VoiceRecognitionService } from '../services/voice/voicerecognition.service';
import { MobileService } from '../services/mobile/mobile.service';


@Component({
  providers: [VoiceService, VoiceRecognitionService, MobileService],
  directives: [ROUTER_DIRECTIVES],
  styles: [`
    #canvas {
        width: 400px;
        height: 200px;
        background-color: #e0e0e0;
    }
  `],
  template: `
    <div class="uk-grid" data-uk-scrollspy="{cls:'uk-animation-fade'}">
        <div class="uk-width-large-1-1">
            <form class="uk-form">
                <div class="uk-form-row">
                    <h3 class="uk-panel-title uk-text-primary">Use with a single device</h3>
                    Upon clicking 'Start listening' the device will start indicating sound around you. If your child starts crying - the device will vibrate. You may first try adjusting sensitivity - the bigger sensitivity is - the more sensitively it will vibrate.
                </div>
                <div class="uk-form-row">
                    <button class="uk-button" [ngClass]="{'uk-button-danger': voiceService.isListening()}" (click)="toggleFeeling()">
                        <i *ngIf="toggleInProgress" class="uk-icon-spinner uk-icon-spin"></i>
                        <i *ngIf="!toggleInProgress && voiceService.isListening()" class="uk-icon-stop-circle-o"></i> 
                        <i *ngIf="!toggleInProgress && !voiceService.isListening()" class="uk-icon-play-circle-o"></i> 
                        &nbsp;{{feelingButtonText}}
                    </button>
                </div>
                <div class="uk-form-row">
                    <select [(ngModel)]="sensitivity">
                        <option *ngFor="let o of sensitivityOptions" [value]="o">{{o*100}} %</option>
                    </select>
                    <label for="sensitivity">Detection sensitivity</label>
                </div>
                <div class="uk-form-row">
                    <div>
                        <canvas id="canvas"></canvas>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="uk-grid uk-align-center">
        <a class="uk-button-link" [routerLink]="['/modeselection']"><i class="uk-icon-arrow-left"></i> Back</a>
    </div>
    `
})
export class SingleDevice {
    
    private canvas;
    private sensitivity = 0.75;
    private sensitivityOptions = [0.00, 0.10, 0.25, 0.50, 0.75, 0.85, 0.95, 0.98, 1.0];
    private toggleInProgress: boolean = false;
    private feelingButtonText: string = 'Start listening';    
    
    constructor(
        private voiceService: VoiceService, 
        private voiceRecognitionService: VoiceRecognitionService,
        private mobileService: MobileService) {        
    }
    
    toggleFeeling() {
        this.toggleInProgress = true;
        
        if (this.voiceService.isListening()) {
            this.feelingButtonText = 'Start listening';
            this.shutdown();
        } else {
            this.feelingButtonText = 'Stop listening';
            this.listen();
        }
   }
    
    private listen() {
        var self = this;
        if (!this.voiceService.isListening()) {
            this.canvas = document.getElementById("canvas");
            self.toggleInProgress = false; // TODO: this should be called after callback
            this.voiceService.listen((data) => {
                var crying = this.voiceRecognitionService.isBabyCrying(data, this.sensitivity);
                self.visualiseVoice(data, 400, 200, crying);                
                if (crying) {
                    this.mobileService.vibratePhone([100]);
                }
                
            }, this.handleListenError, 200);
        }
    }

   private shutdown() {
        this.toggleInProgress = false;
        if (this.voiceService.isListening()) {
            this.voiceService.shutdown();
        }
    }
    
    private visualiseVoice(data, width, height, crying) {           
      let canvasCtx = this.canvas.getContext("2d");
      canvasCtx.fillStyle = crying ? 'rgb(255, 220, 220)' : 'rgb(220, 220, 220)';
      canvasCtx.fillRect(0, 0, width, height);

      canvasCtx.lineWidth = 1;
      canvasCtx.strokeStyle = crying ? 'rgb(200, 0, 0)' : 'rgb(0, 200, 0)';

      canvasCtx.beginPath();

      var sliceWidth = width * 1.0 / data.length;
      var x = 0;

      for(var i = 0; i < data.length; i++) {
        var v = data[i];
        var y = height / 2 + v * height / 2;
        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.lineTo(this.canvas.width, this.canvas.height/2);
      canvasCtx.stroke();
    }
    
    private handleListenError(error) {
        console.log('Failed to start listener');
        console.log(error);
    }
}