/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { PROJECT_MS } from 'src/common/constants';
import { of } from 'rxjs';
import { CollaborationsService } from './collaborations.service';
import { CollaborationProjectPaginationOutput } from './collaborations.type';

describe('CollaborationsService', () => {
  let service: CollaborationsService;
  let projectsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaborationsService,
        {
          provide: PROJECT_MS,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(CollaborationsService);
    projectsClient = module.get(PROJECT_MS);
  });

  describe('handlePostCollaboration', () => {
    it('should add collabroation correctly)', async () => {
      // Arrange
      const projectId = 999;
      const email = 'alice@gmail.com';
      const userId = 2;

      const expected = 2;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handlePostCollaboration(projectId, email, userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetAllColaborationProjects', () => {
    it('should return all collaborations project correctly', async () => {
      // Arrange
      const userId = 10;

      const expected = {} as CollaborationProjectPaginationOutput;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetAllColaborationProjects(userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handleDeleteCollaboration', () => {
    it('should delete collaboration', async () => {
      // Arrange
      const projectId = 999;
      const email = 'alice@gmail.com';
      const userId = 2;

      const expected = 9;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleDeleteCollaboration(projectId, email, userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });
});
