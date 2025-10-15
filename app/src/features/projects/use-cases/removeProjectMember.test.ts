/**
 * Remove Project Member Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { removeProjectMember } from './removeProjectMember';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('removeProjectMember use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.members.remove']);
    vi.mocked(projectService.getProjectById).mockResolvedValue({ organization_id: TEST_UUIDS.org1 } as any);
    vi.mocked(projectService.isProjectMember).mockResolvedValue(true);
  });

  it('should remove member when user has permission', async () => {
    vi.mocked(projectService.removeProjectMember).mockResolvedValue(undefined);

    await removeProjectMember(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user2);

    expect(projectService.removeProjectMember).toHaveBeenCalledWith(
      TEST_UUIDS.project1,
      TEST_UUIDS.user2
    );
  });

  it('should allow user to remove themselves', async () => {
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);
    vi.mocked(projectService.removeProjectMember).mockResolvedValue(undefined);

    await removeProjectMember(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user1);

    expect(projectService.removeProjectMember).toHaveBeenCalled();
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      removeProjectMember(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user2)
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when target user not a member', async () => {
    vi.mocked(projectService.isProjectMember).mockResolvedValue(false);

    await expect(
      removeProjectMember(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user3)
    ).rejects.toThrow('USER_NOT_MEMBER');
  });

  it('should reject when user lacks permission and not removing self', async () => {
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      removeProjectMember(TEST_UUIDS.user1, TEST_UUIDS.project1, TEST_UUIDS.user2)
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should reject invalid project ID', async () => {
    await expect(
      removeProjectMember(TEST_UUIDS.user1, 'invalid-uuid', TEST_UUIDS.user2)
    ).rejects.toThrow('Invalid uuid');
  });

  it('should reject invalid member ID', async () => {
    await expect(
      removeProjectMember(TEST_UUIDS.user1, TEST_UUIDS.project1, 'invalid-uuid')
    ).rejects.toThrow('Invalid uuid');
  });
});
