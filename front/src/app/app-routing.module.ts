import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from "./main/main.component";
import {StreamComponent} from "./stream/stream.component";
import {PanelComponent} from "./panel/panel.component";

const routes: Routes = [{
  path: '', component: MainComponent
}, {
  path: 'channels/:test', component: StreamComponent
},
  {
    path: 'stream', component: PanelComponent
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
