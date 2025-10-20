/**
 * Get Project By Slug Use Case Tests
 *
 * Tests business logic for retrieving a project by organization + slug.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProjectBySlug } from './getProjectBySlug';
import * as projectService from '../services/project.service';
import * as organizationService from '@/features/organizations/services/organization.service';
import { TEST_UUIDS, createMockProject } from '@/test/test-fixtures';

vi.mock('../services/project.service');
vi.mock('@/features/organizations/services/organization.service');

describe('getProjectBySlug use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock organization lookup (slug -> UUID conversion)
    vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue({
      id: TEST_UUIDS.org1,
      name: 'Test Org',
      slug: 'test-org',
      invite_code: 'TESTCODE',
      created_by: TEST_UUIDS.user1,
      created_at: new Date(),
    });
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['project.read']);
  });

  it('should retrieve project by organization slug and project slug', async () => {
    const mockProject = createMockProject({ slug: 'test-project' });
    vi.mocked(projectService.getProjectBySlug).mockResolvedValue(mockProject);

    const result = await getProjectBySlug(TEST_UUIDS.user1, 'test-org', 'test-project');

    expect(organizationService.getOrganizationBySlugFromDB).toHaveBeenCalledWith('test-org');
    expect(projectService.getProjectBySlug).toHaveBeenCalledWith(TEST_UUIDS.org1, 'test-project');
    expect(result.slug).toBe('test-project');
  });

  it('should throw NOT_FOUND when project does not exist', async () => {
    vi.mocked(projectService.getProjectBySlug).mockResolvedValue(null);

    await expect(
      getProjectBySlug(TEST_UUIDS.user1, 'test-org', 'nonexistent')
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should throw NOT_FOUND when organization does not exist', async () => {
    vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue(null);

    await expect(
      getProjectBySlug(TEST_UUIDS.user1, 'nonexistent-org', 'test')
    ).rejects.toThrow('NOT_FOUND');
  });

  it('should reject when organization slug is invalid format', async () => {
    await expect(
      getProjectBySlug(TEST_UUIDS.user1, 'INVALID-SLUG!', 'test')
    ).rejects.toThrow();
  });

  it('should reject when user not member of organization', async () => {
    vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

    await expect(
      getProjectBySlug(TEST_UUIDS.user1, 'test-org', 'test')
    ).rejects.toThrow('NOT_MEMBER_OF_ORGANIZATION');
  });

  it('should reject when user lacks project.read permission', async () => {
    vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([]);

    await expect(
      getProjectBySlug(TEST_UUIDS.user1, 'test-org', 'test')
    ).rejects.toThrow('FORBIDDEN');
  });
});
