import { NgModule } from '@angular/core';
import { ArrayPipe } from './array.pipe';
import { HidePipe } from './hide.pipe';
import { SortPipe } from './sort.pipe';
import { ScorePipe } from './score.pipe';

const PIPES = [ArrayPipe, HidePipe, SortPipe, ScorePipe];

@NgModule({ declarations: [...PIPES], exports: [...PIPES] })
export class PipeModule {}
