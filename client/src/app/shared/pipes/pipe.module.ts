import { NgModule } from '@angular/core';
import { ArrayPipe } from './array.pipe';
import { HidePipe } from './hide.pipe';
import { SortPipe } from './sort.pipe';

const PIPES = [ArrayPipe, HidePipe, SortPipe];

@NgModule({ declarations: [...PIPES], exports: [...PIPES] })
export class PipeModule {}
