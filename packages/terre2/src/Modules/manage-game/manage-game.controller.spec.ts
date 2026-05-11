import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger } from '@nestjs/common';
import { ManageGameController } from './manage-game.controller';
import { ManageGameService } from './manage-game.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

describe('ManageGameController', () => {
  let controller: ManageGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManageGameController],
      providers: [
        { provide: WebgalFsService, useValue: {} },
        { provide: ManageGameService, useValue: {} },
        { provide: ConsoleLogger, useValue: { log: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ManageGameController>(ManageGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
