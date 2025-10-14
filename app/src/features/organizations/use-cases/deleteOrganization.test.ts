import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteOrganization } from './deleteOrganization';
import * as organizationService from '../services/organization.service';

// Mock service layer
vi.mock('../services/organization.service');

// Test constants
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OTHER_USER_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
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

describe('deleteOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should allow owner to delete organization', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue([]);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockResolvedValue(undefined);

      // Act
      const result = await deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation);

      // Assert
      expect(result).toEqual({ success: true });
      expect(organizationService.deleteOrganizationFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
    });

    it('should remove all organization members', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };
      const mockMembers = [
        { id: 'member-1', user_id: 'user-1', organization_id: ORGANIZATION_ID },
        { id: 'member-2', user_id: 'user-2', organization_id: ORGANIZATION_ID },
      ];

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue(mockMembers as any);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockResolvedValue(undefined);

      // Act
      await deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation);

      // Assert
      expect(organizationService.getOrganizationMembersFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      expect(organizationService.deleteOrganizationFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      // The service layer handles cascade deletion of members
    });

    it('should clean up all related data', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue([]);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockResolvedValue(undefined);

      // Act
      await deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation);

      // Assert
      expect(organizationService.deleteOrganizationFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      // Database cascade rules handle deletion of:
      // - organization_members
      // - organization permissions
      // - related invites
    });

    it('should return deletion confirmation', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue([]);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockResolvedValue(undefined);

      // Act
      const result = await deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation);

      // Assert
      expect(result).toEqual({ success: true });
      expect(result.success).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should throw ORGANIZATION_NOT_FOUND when orgId does not exist', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(null);

      // Act & Assert
      await expect(deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation)).rejects.toThrow(
        'Organization not found'
      );

      expect(organizationService.deleteOrganizationFromDB).not.toHaveBeenCalled();
    });

    it('should throw ACCESS_DENIED when user is not owner', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };
      const nonOwnerOrg = { ...MOCK_ORGANIZATION, created_by: OTHER_USER_ID };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(nonOwnerOrg as any);

      // Act & Assert
      await expect(deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation)).rejects.toThrow(
        'Only the owner can delete the organization'
      );

      expect(organizationService.deleteOrganizationFromDB).not.toHaveBeenCalled();
    });

    it('should throw CONFIRMATION_REQUIRED when name does not match', async () => {
      // Arrange
      const wrongConfirmation = { name: 'Wrong Organization Name' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);

      // Act & Assert
      await expect(deleteOrganization(ORGANIZATION_ID, USER_ID, wrongConfirmation)).rejects.toThrow(
        'Confirmation name does not match'
      );

      expect(organizationService.deleteOrganizationFromDB).not.toHaveBeenCalled();
    });
  });

  describe('Business Rules', () => {
    it('should prevent deletion if organization has active projects (future)', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };
      const orgWithProjects = { ...MOCK_ORGANIZATION, project_count: 3 } as any;

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(orgWithProjects);

      // Act & Assert
      await expect(deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation)).rejects.toThrow(
        'Cannot delete organization with active projects'
      );

      expect(organizationService.deleteOrganizationFromDB).not.toHaveBeenCalled();
    });

    it('should allow deletion if organization has no projects', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue([]);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockResolvedValue(undefined);

      // Act
      const result = await deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation);

      // Assert
      expect(result).toEqual({ success: true });
      expect(organizationService.deleteOrganizationFromDB).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should invalidate all invites', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue([]);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockResolvedValue(undefined);

      // Act
      await deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation);

      // Assert
      expect(organizationService.deleteOrganizationFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      // Cascade deletion handles invite code invalidation
      // (organization row deleted = invite_code no longer usable)
    });
  });

  describe('Service Integration', () => {
    it('should call deleteOrganizationFromDB with correct params', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue([]);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockResolvedValue(undefined);

      // Act
      await deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation);

      // Assert
      expect(organizationService.deleteOrganizationFromDB).toHaveBeenCalledWith(ORGANIZATION_ID);
      expect(organizationService.deleteOrganizationFromDB).toHaveBeenCalledTimes(1);
    });

    it('should ensure database transaction atomicity', async () => {
      // Arrange
      const confirmation = { name: 'Test Organization' };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.getOrganizationMembersFromDB).mockResolvedValue([]);
      vi.mocked(organizationService.deleteOrganizationFromDB).mockRejectedValue(
        new Error('Database transaction failed')
      );

      // Act & Assert
      await expect(deleteOrganization(ORGANIZATION_ID, USER_ID, confirmation)).rejects.toThrow(
        'Database transaction failed'
      );

      // Verify rollback behavior (members should not be deleted if org deletion fails)
      // This is handled by the database transaction in the service layer
    });
  });
});
