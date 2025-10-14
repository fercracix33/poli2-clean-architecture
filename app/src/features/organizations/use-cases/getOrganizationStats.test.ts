import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrganizationStats } from './getOrganizationStats';
import * as organizationService from '../services/organization.service';

// Mock service layer
vi.mock('../services/organization.service');

// Test constants
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ORGANIZATION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const MOCK_ORGANIZATION = {
  id: ORGANIZATION_ID,
  name: 'Test Organization',
  slug: 'test-organization',
  description: 'Test description',
  invite_code: 'TESTCODE',
  created_by: USER_ID,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
};

describe('getOrganizationStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return member count when user has org.view permission', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.countOrganizationMembersFromDB).mockResolvedValue(5);

      // Act
      const result = await getOrganizationStats(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result.member_count).toBe(5);
      expect(organizationService.countOrganizationMembersFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      expect(organizationService.userHasPermissionInOrganization).toHaveBeenCalledWith(
        USER_ID,
        ORGANIZATION_ID,
        'organization.view'
      );
    });

    it('should return project count (0 for now - projects not implemented)', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.countOrganizationMembersFromDB).mockResolvedValue(5);

      // Act
      const result = await getOrganizationStats(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result.project_count).toBe(0); // Placeholder until projects feature exists
    });

    it('should return active members count', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.countOrganizationMembersFromDB).mockResolvedValue(5);

      // Act
      const result = await getOrganizationStats(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result.active_members_count).toBeDefined();
      expect(typeof result.active_members_count).toBe('number');
      // For now, active_members_count should equal member_count
      // In the future, it might filter by "last_active" timestamp
      expect(result.active_members_count).toBe(5);
    });
  });

  describe('Error Cases', () => {
    it('should throw ORGANIZATION_NOT_FOUND when orgId does not exist', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(null);

      // Act & Assert
      await expect(getOrganizationStats(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'Organization not found'
      );

      expect(organizationService.countOrganizationMembersFromDB).not.toHaveBeenCalled();
    });

    it('should throw ACCESS_DENIED when user lacks org.view permission', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(getOrganizationStats(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'Insufficient permissions'
      );

      expect(organizationService.countOrganizationMembersFromDB).not.toHaveBeenCalled();
    });
  });

  describe('Authorization', () => {
    it('should prevent non-member from viewing stats', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(getOrganizationStats(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'not a member'
      );

      expect(organizationService.countOrganizationMembersFromDB).not.toHaveBeenCalled();
    });

    it('should allow member with org.view to view stats', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.countOrganizationMembersFromDB).mockResolvedValue(3);

      // Act
      const result = await getOrganizationStats(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result).toBeDefined();
      expect(result.member_count).toBe(3);
    });
  });

  describe('Service Integration', () => {
    it('should call multiple DB queries correctly', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.countOrganizationMembersFromDB).mockResolvedValue(5);

      // Act
      const result = await getOrganizationStats(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(organizationService.getOrganizationByIdFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      expect(organizationService.isUserMemberOfOrganization).toHaveBeenCalledWith(USER_ID, ORGANIZATION_ID);
      expect(organizationService.countOrganizationMembersFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      expect(result).toEqual({
        member_count: 5,
        project_count: 0,
        active_members_count: 5,
      });
    });
  });
});
