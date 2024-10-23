import { NgModule } from '@angular/core';
import { ArrayPipe } from './array.pipe';
import { HidePipe } from './hide.pipe';

const PIPES = [ArrayPipe, HidePipe];

@NgModule({ declarations: [...PIPES], exports: [...PIPES] })
export class PipeModule {}
