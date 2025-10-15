/**
 * Archive Project Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { archiveProject } from './archiveProject';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, createMockProject } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('archiveProject use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.update']);
  });

  it('should archive project when user has permission', async () => {
    const mockProject = createMockProject({ status: 'active' });
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(projectService.archiveProject).mockResolvedValue({
      ...mockProject,
      status: 'archived',
      archived_at: new Date(),
    });

    const result = await archiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1);

    expect(projectService.archiveProject).toHaveBeenCalledWith(TEST_UUIDS.project1);
    expect(result.status).toBe('archived');
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      archiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when project already archived', async () => {
    const archivedProject = createMockProject({
      status: 'archived',
      archived_at: new Date(),
    });
    vi.mocked(projectService.getProjectById).mockResolvedValue(archivedProject);

    await expect(
      archiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('ALREADY_ARCHIVED');
  });

  it('should reject when user not member of organization', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

    await expect(
      archiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');
  });

  it('should reject when user lacks project.update permission', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      archiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should reject invalid projectId', async () => {
    await expect(
      archiveProject(TEST_UUIDS.user1, 'invalid-uuid')
    ).rejects.toThrow('Invalid uuid');
  });
});
