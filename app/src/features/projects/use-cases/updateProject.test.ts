/**
 * Update Project Use Case Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProject } from './updateProject';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, createMockProject } from '@/test/test-fixtures';

vi.mock('../services/project.service');

describe('updateProject use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.update']);
  });

  it('should update project when user has permission', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(projectService.updateProject).mockResolvedValue({ ...mockProject, name: 'Updated Name' });

    const result = await updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, {
      name: 'Updated Name',
    });

    expect(result.name).toBe('Updated Name');
  });

  it('should reject when project not found', async () => {
    vi.mocked(projectService.getProjectById).mockResolvedValue(null);

    await expect(
      updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, { name: 'Test' })
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when user not member of organization', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

    await expect(
      updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, { name: 'Test' })
    ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');
  });

  it('should reject when user lacks project.update permission', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, { name: 'Test' })
    ).rejects.toThrow('FORBIDDEN');
  });

  it('should sanitize input data', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(projectService.updateProject).mockResolvedValue(mockProject);

    await updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, {
      name: '  Trimmed Name  ',
    });

    expect(projectService.updateProject).toHaveBeenCalledWith(
      TEST_UUIDS.project1,
      expect.objectContaining({ name: 'Trimmed Name' })
    );
  });

  it('should reject invalid projectId', async () => {
    await expect(
      updateProject(TEST_UUIDS.user1, 'invalid-uuid', { name: 'Test' })
    ).rejects.toThrow('Invalid uuid');
  });

  it('should allow partial updates', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(projectService.updateProject).mockResolvedValue(mockProject);

    await updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, {
      color: '#FF0000',
    });

    expect(projectService.updateProject).toHaveBeenCalledWith(
      TEST_UUIDS.project1,
      expect.objectContaining({ color: '#FF0000' })
    );
  });

  it('should reject attempt to update organization_id', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);

    // ProjectUpdateSchema doesn't include organization_id, so this will be ignored
    // Zod strips unknown keys by default
    await updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, {
      organization_id: TEST_UUIDS.org2,
    } as any);

    // Verify organization_id was NOT passed to service
    expect(projectService.updateProject).toHaveBeenCalledWith(
      TEST_UUIDS.project1,
      {} // Empty because organization_id is stripped by Zod
    );
  });

  it('should reject attempt to update slug', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);

    // ProjectUpdateSchema doesn't include slug, so this will be ignored
    // Zod strips unknown keys by default
    await updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, {
      slug: 'new-slug',
    } as any);

    // Verify slug was NOT passed to service
    expect(projectService.updateProject).toHaveBeenCalledWith(
      TEST_UUIDS.project1,
      {} // Empty because slug is stripped by Zod
    );
  });

  it('should handle empty update data', async () => {
    const mockProject = createMockProject();
    vi.mocked(projectService.getProjectById).mockResolvedValue(mockProject);
    vi.mocked(projectService.updateProject).mockResolvedValue(mockProject);

    const result = await updateProject(TEST_UUIDS.user1, TEST_UUIDS.project1, {});

    expect(result).toEqual(mockProject);
  });
});
