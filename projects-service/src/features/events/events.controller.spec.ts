/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { CollaborationsService } from '../collaborations/collaborations.service';
import { ProjectsService } from '../projects/projects.service';
import { EventController } from './events.controller';

describe('EventController', () => {
  let controller: EventController;
  let projectsService: jest.Mocked<ProjectsService>;
  let collaborationsService: jest.Mocked<CollaborationsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            handleUserChanged: jest.fn(),
          },
        },
        {
          provide: CollaborationsService,
          useValue: {
            handleUserChanged: jest.fn(),
          },
        },
      ],
      controllers: [EventController],
    }).compile();

    projectsService = moduleRef.get(ProjectsService);
    collaborationsService = moduleRef.get(CollaborationsService);
    controller = moduleRef.get(EventController);
  });

  describe('updateUser', () => {
    it('should update users correctly', async () => {
      // Arrange
      const payload = {
        id: 1,
        name: 'john',
        updatedAt: new Date().toISOString(),
      };
      projectsService.handleUserChanged.mockResolvedValue();
      collaborationsService.handleUserChanged.mockResolvedValue();

      // Action
      await controller.updateUser(payload);

      // Assert
      expect(projectsService.handleUserChanged).toHaveBeenCalledWith(payload);
      expect(collaborationsService.handleUserChanged).toHaveBeenCalledWith(
        payload,
      );
    });
  });
});
