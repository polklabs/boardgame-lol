import { Directive, HostListener, OnDestroy, OnInit } from '@angular/core';

@Directive()
export abstract class WakeLockWrapper implements OnInit, OnDestroy {
  wakeLock?: WakeLockSentinel;

  ngOnInit(): void {
    this.getWakeLock();
    this.onInitChild();
  }

  ngOnDestroy(): void {
    this.releaseWakeLock();
    this.onDestroyChild();
  }

  protected onInitChild(): void {}
  protected onDestroyChild(): void {}

  @HostListener('document:visibilitychange', [])
  appVisibility() {
    if (document.hidden) {
      this.releaseWakeLock();
    } else {
      this.getWakeLock();
    }
  }

  getWakeLock() {
    navigator.wakeLock
      .request()
      .then((lock) => {
        this.wakeLock = lock;
        console.log('Wake lock success');
      })
      .catch(() => console.warn('Wake lock failed'));
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release();
      console.log('Wake lock released');
    } else {
      // Continue
    }
  }
}
