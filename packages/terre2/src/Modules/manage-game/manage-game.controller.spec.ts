import { Test, TestingModule } from '@nestjs/testing';
import { ManageGameController } from './manage-game.controller';

describe('ManageGameController', () => {
  let controller: ManageGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManageGameController],
    }).compile();

    controller = module.get<ManageGameController>(ManageGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
