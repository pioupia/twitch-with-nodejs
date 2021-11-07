import { Component, OnInit } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'ng-sidenav',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})

export class SideBarComponent implements OnInit {

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if(document.location.pathname.startsWith("/channels")) this.visible = !0;
        else this.visible = !1;
      }
    });
  }

  visible = !1;
  ngOnInit(): void {
    if(document.location.pathname.startsWith("/channels")) this.visible = !0;
    else this.visible = !1;
  }

}
