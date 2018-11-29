/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BoardService } from './board.service';

describe('BoardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardService]
    });
  });

  it('should ...', inject([BoardService], (service: BoardService) => {
    expect(service).toBeTruthy();
  }));
});
