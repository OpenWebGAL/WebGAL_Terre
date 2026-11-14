import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleLogger } from '@nestjs/common';
import { ManageGameController } from './manage-game.controller';
import { ManageGameService } from './manage-game.service';
import { WebgalFsService } from '../webgal-fs/webgal-fs.service';

describe('ManageGameController', () => {
  let controller: ManageGameController;
  let manageGameMock: {
    createNewScene: jest.Mock;
    createNewAnimation: jest.Mock;
    createNewCharacter: jest.Mock;
  };

  beforeEach(async () => {
    manageGameMock = {
      createNewScene: jest.fn(),
      createNewAnimation: jest.fn(),
      createNewCharacter: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManageGameController],
      providers: [
        { provide: WebgalFsService, useValue: {} },
        { provide: ManageGameService, useValue: manageGameMock },
        { provide: ConsoleLogger, useValue: { log: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ManageGameController>(ManageGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates scene, animation, and character creation to ManageGameService', async () => {
    await controller.createNewScene({ gameName: 'demo', sceneName: 'ep2' });
    await controller.createNewAnimation({
      gameName: 'demo',
      animationName: 'shake',
    });
    await controller.createNewCharacter({
      gameName: 'demo',
      characterName: 'sae',
    });

    expect(manageGameMock.createNewScene).toHaveBeenCalledWith('demo', 'ep2');
    expect(manageGameMock.createNewAnimation).toHaveBeenCalledWith(
      'demo',
      'shake',
    );
    expect(manageGameMock.createNewCharacter).toHaveBeenCalledWith(
      'demo',
      'sae',
    );
  });
});
