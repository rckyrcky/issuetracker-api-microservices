/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { IssuesService } from 'src/features/issues/issues.service';
import { CustomSuccessMessages } from 'src/common/messages';
import { AuthRequest } from 'src/common/types/request.type';
import {
  IssueOutput,
  IssueOutputPagination,
} from 'src/features/issues/issues.type';
import {
  NewIssueInputDto,
  UpdateIssueInputDto,
} from 'src/features/issues/issues.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { IssuesController } from './issues.controller';

describe('IssuesController', () => {
  let controller: IssuesController;
  let issuesServiceMock: jest.Mocked<IssuesService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssuesController],
      providers: [
        {
          provide: IssuesService,
          useValue: {
            handleGetIssueById: jest.fn(),
            handlePatchIssue: jest.fn(),
            handlePostIssue: jest.fn(),
            handleGetAllIssues: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(IssuesController);
    issuesServiceMock = module.get(IssuesService);
  });

  describe('detail', () => {
    it('should return fetch message and issue data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { issue_id: 7 };

      const data = { id: 7, project_id: 99, title: 'Issue A' } as IssueOutput;
      issuesServiceMock.handleGetIssueById.mockResolvedValue(data);

      // Action
      const result = await controller.detail(params, req);

      // Assert
      expect(issuesServiceMock.handleGetIssueById).toHaveBeenCalledWith(7, 10);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });

  describe('update', () => {
    it('should return patch message and id', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { issue_id: 7 };
      const payload = { title: 'New' } as UpdateIssueInputDto;

      issuesServiceMock.handlePatchIssue.mockResolvedValue(777);

      // Action
      const result = await controller.update(params, req, payload);

      // Assert
      expect(issuesServiceMock.handlePatchIssue).toHaveBeenCalledWith(
        7,
        10,
        payload,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.issues.patch,
        data: { id: 777 },
      });
    });
  });

  describe('create', () => {
    it('should call handlePostIssue with payload + default status + project_id + user_id and return post message', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };
      const payload = { title: 'Issue A', priority: 'low' } as NewIssueInputDto;

      issuesServiceMock.handlePostIssue.mockResolvedValue(123);

      // Action
      const result = await controller.create(payload, params, req);

      // Assert
      expect(issuesServiceMock.handlePostIssue).toHaveBeenCalledWith(
        payload,
        99,
        10,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.issues.post,
        data: { id: 123 },
      });
    });
  });

  describe('all', () => {
    it('should return fetch message and issues data (with filters)', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };
      const query = { page: 2, status: 'open', priority: 'high' } as QueryDto;

      const data = {
        data: [{ id: 1 }],
        pagination: {
          total: 1,
          page: 2,
          totalPages: 1,
          hasMorePage: false,
          nextPage: null,
          limit: 10,
        },
      } as IssueOutputPagination;

      issuesServiceMock.handleGetAllIssues.mockResolvedValue(data);

      // Action
      const result = await controller.all(query, params, req);

      // Assert
      expect(issuesServiceMock.handleGetAllIssues).toHaveBeenCalledWith(
        99,
        10,
        2,
        'open',
        'high',
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });

    it('should pass undefined page/status/priority when not provided', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };
      const query = {};

      const data = {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          totalPages: 0,
          hasMorePage: false,
          nextPage: null,
          limit: 10,
        },
      };

      issuesServiceMock.handleGetAllIssues.mockResolvedValue(data);

      // Action
      const result = await controller.all(query, params, req);

      // Assert
      expect(issuesServiceMock.handleGetAllIssues).toHaveBeenCalledWith(
        99,
        10,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });
});
