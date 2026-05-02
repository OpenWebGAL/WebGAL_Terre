import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger } from '@nestjs/common';
import { ManageGameService } from './manage-game.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

describe('ManageGameService', () => {
  let service: ManageGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageGameService,
        { provide: ConsoleLogger, useValue: { log: jest.fn(), error: jest.fn() } },
        { provide: WebgalFsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ManageGameService>(ManageGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
