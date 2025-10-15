/**
 * Delete Project Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteProject } from './deleteProject';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, createMockProject } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('deleteProject use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.delete']);
  });

  it('should delete project when user has permission', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(projectService.deleteProject).mockResolvedValue(undefined);

    await deleteProject(TEST_UUIDS.user1, TEST_UUIDS.project1);

    expect(projectService.deleteProject).toHaveBeenCalledWith(TEST_UUIDS.project1);
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      deleteProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when user not member of organization', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

    await expect(
      deleteProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');
  });

  it('should reject when user lacks project.delete permission', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      deleteProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should reject invalid projectId', async () => {
    await expect(
      deleteProject(TEST_UUIDS.user1, 'invalid-uuid')
    ).rejects.toThrow('Invalid uuid');
  });
});
