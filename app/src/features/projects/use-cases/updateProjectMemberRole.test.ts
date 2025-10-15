/**
 * Update Project Member Role Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProjectMemberRole } from './updateProjectMemberRole';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('updateProjectMemberRole use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.members.update']);
    vi.mocked(projectService.getProjectById).mockResolvedValue({ organization_id: TEST_UUIDS.org1 } as any);
    vi.mocked(projectService.isProjectMember).mockResolvedValue(true);
  });

  it('should update member role when user has permission', async () => {
    vi.mocked(projectService.updateProjectMemberRole).mockResolvedValue(undefined);

    await updateProjectMemberRole(
      TEST_UUIDS.user1,
      TEST_UUIDS.project1,
      TEST_UUIDS.user2,
      TEST_UUIDS.adminRole
    );

    expect(projectService.updateProjectMemberRole).toHaveBeenCalledWith(
      TEST_UUIDS.project1,
      TEST_UUIDS.user2,
      TEST_UUIDS.adminRole
    );
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      updateProjectMemberRole(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user2, TEST_UUIDS.adminRole)
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when target user not a member', async () => {
    vi.mocked(projectService.isProjectMember).mockResolvedValue(false);

    await expect(
      updateProjectMemberRole(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user3, TEST_UUIDS.adminRole)
    ).rejects.toThrow('USER_NOT_MEMBER');
  });

  it('should reject when requesting user lacks permission', async () => {
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      updateProjectMemberRole(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user2, TEST_UUIDS.adminRole)
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should reject invalid project ID', async () => {
    await expect(
      updateProjectMemberRole(TEST_UUIDS.user1, 'invalid-uuid', TEST_UUIDS.user2, TEST_UUIDS.adminRole)
    ).rejects.toThrow('Invalid uuid');
  });

  it('should reject invalid role ID', async () => {
    await expect(
      updateProjectMemberRole(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user2, 'invalid-uuid')
    ).rejects.toThrow('Invalid uuid');
  });
});
