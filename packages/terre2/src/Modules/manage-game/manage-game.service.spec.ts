import { Test, TestingModule } from '@nestjs/testing';
import { ManageGameService } from './manage-game.service';

describe('ManageGameService', () => {
  let service: ManageGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ManageGameService],
    }).compile();

    service = module.get<ManageGameService>(ManageGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
