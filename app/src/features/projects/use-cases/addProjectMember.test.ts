/**
 * Add Project Member Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addProjectMember } from './addProjectMember';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('addProjectMember use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.members.add']);
    vi.mocked(projectService.getProjectById).mockResolvedValue({ organization_id: TEST_UUIDS.org1 } as any);
    vi.mocked(projectService.isProjectMember).mockResolvedValue(false);
  });

  it('should add member when user has permission', async () => {
    vi.mocked(projectService.addProjectMember).mockResolvedValue({} as any);

    await addProjectMember(TEST_UUIDS.user1, {
      project_id: TEST_UUIDS.project1,
      user_id: TEST_UUIDS.user2,
      role_id: TEST_UUIDS.memberRole,
    });

    expect(projectService.addProjectMember).toHaveBeenCalled();
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      addProjectMember(TEST_UUIDS.user1, {
        project_id: TEST_UUIDS.project1,
        user_id: TEST_UUIDS.user2,
        role_id: TEST_UUIDS.memberRole,
      })
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when new member not in organization', async () => {
    vi.mocked(organizationService.isUserMemberOfOrganization)
      .mockResolvedValueOnce(true) // Current user is member
      .mockResolvedValueOnce(false); // New user is not member

    await expect(
      addProjectMember(TEST_UUIDS.user1, {
        project_id: TEST_UUIDS.project1,
        user_id: TEST_UUIDS.user3,
        role_id: TEST_UUIDS.memberRole,
      })
    ).rejects.toThrow('USER_NOT_IN_ORGANIZATION');
  });

  it('should reject when user already a member', async () => {
    vi.mocked(projectService.isProjectMember).mockResolvedValue(true);

    await expect(
      addProjectMember(TEST_UUIDS.user1, {
        project_id: TEST_UUIDS.project1,
        user_id: TEST_UUIDS.user2,
        role_id: TEST_UUIDS.memberRole,
      })
    ).rejects.toThrow('ALREADY_MEMBER');
  });

  it('should reject when requesting user lacks permission', async () => {
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      addProjectMember(TEST_UUIDS.user1, {
        project_id: TEST_UUIDS.project1,
        user_id: TEST_UUIDS.user2,
        role_id: TEST_UUIDS.memberRole,
      })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should set invited_by to requesting user', async () => {
    vi.mocked(projectService.addProjectMember).mockResolvedValue({} as any);

    await addProjectMember(TEST_UUIDS.user1, {
      project_id: TEST_UUIDS.project1,
      user_id: TEST_UUIDS.user2,
      role_id: TEST_UUIDS.memberRole,
    });

    expect(projectService.addProjectMember).toHaveBeenCalledWith(
      expect.objectContaining({
        invited_by: TEST_UUIDS.user1,
      })
    );
  });

  it('should reject invalid data', async () => {
    await expect(
      addProjectMember(TEST_UUIDS.user1, {
        project_id: 'invalid-uuid',
        user_id: TEST_UUIDS.user2,
        role_id: TEST_UUIDS.memberRole,
      })
    ).rejects.toThrow('Invalid uuid');
  });

  it('should reject when requesting user not in organization', async () => {
    vi.mocked(organizationService.isUserMemberOfOrganization)
      .mockResolvedValueOnce(false); // Requesting user not member

    await expect(
      addProjectMember(TEST_UUIDS.user1, {
        project_id: TEST_UUIDS.project1,
        user_id: TEST_UUIDS.user2,
        role_id: TEST_UUIDS.memberRole,
      })
    ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');
  });
});
