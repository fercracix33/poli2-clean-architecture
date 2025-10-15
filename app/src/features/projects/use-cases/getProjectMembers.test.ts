/**
 * Get Project Members Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectMembers } from './getProjectMembers';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('getProjectMembers use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.members.view']);
    vi.mocked(projectService.getProjectById).mockResolvedValue({ organization_id: TEST_UUIDS.org1 } as any);
  });

  it('should retrieve project members when user has permission', async () => {
    const mockMembers = [
      { id: 'member-1', user_id: TEST_UUIDS.user1 },
      { id: 'member-2', user_id: TEST_UUIDS.user2 },
    ];
    vi.mocked(projectService.getProjectMembers).mockResolvedValue(mockMembers as any);

    const result = await getProjectMembers(TEST_UUIDS.user1, TEST_UUIDS.project1);

    expect(projectService.getProjectMembers).toHaveBeenCalledWith(TEST_UUIDS.project1);
    expect(result).toHaveLength(2);
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      getProjectMembers(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when user not member of organization', async () => {
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

    await expect(
      getProjectMembers(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');
  });

  it('should reject when user lacks permission', async () => {
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      getProjectMembers(TEST_UUIDS.user1, TEST_UUIDS.project1)
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should return empty array when no members', async () => {
    vi.mocked(projectService.getProjectMembers).mockResolvedValue([]);

    const result = await getProjectMembers(TEST_UUIDS.user1, TEST_UUIDS.project1);

    expect(result).toEqual([]);
  });
});
