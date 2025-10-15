/**
 * Unarchive Project Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { unarchiveProject } from './unarchiveProject';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, createMockProject } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('unarchiveProject use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.update']);
  });

  it('should unarchive project when user has permission', async () => {
    const archivedProject = createMockProject({
      status: 'archived',
      archived_at: new Date(),
    });
    vi.mocked(projectService.getProjectById).mockResolvedValue(archivedProject);
    vi.mocked(projectService.unarchiveProject).mockResolvedValue({
      ...archivedProject,
      status: 'active',
      archived_at: null,
    });

    const result = await unarchiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1);

    expect(projectService.unarchiveProject).toHaveBeenCalledWith(TEST_UUIDS.project1);
    expect(result.status).toBe('active');
    expect(result.archived_at).toBeNull();
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      unarchiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when project not archived', async () => {
    const activeProject = createMockProject({ status: 'active' });
    vi.mocked(projectService.getProjectById).mockResolvedValue(activeProject);

    await expect(
      unarchiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_ARCHIVED');
  });

  it('should reject when user not member of organization', async () => {
    const archivedProject = createMockProject({ status: 'archived', archived_at: new Date() });
    vi.mocked(projectService.getProjectById).mockResolvedValue(archivedProject);
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

    await expect(
      unarchiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');
  });

  it('should reject when user lacks project.update permission', async () => {
    const archivedProject = createMockProject({ status: 'archived', archived_at: new Date() });
    vi.mocked(projectService.getProjectById).mockResolvedValue(archivedProject);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      unarchiveProject(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should reject invalid projectId', async () => {
    await expect(
      unarchiveProject(TEST_UUIDS.user1, 'invalid-uuid')
    ).rejects.toThrow('Invalid uuid');
  });
});
