import { Test, TestingModule } from '@nestjs/testing';
import { WebgalFsService } from './webgal-fs.service';

describe('WebgalFsService', () => {
  let service: WebgalFsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebgalFsService],
    }).compile();

    service = module.get<WebgalFsService>(WebgalFsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
