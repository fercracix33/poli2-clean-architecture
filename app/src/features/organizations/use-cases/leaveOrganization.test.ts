import { describe, it, expect, vi, beforeEach } from 'vitest';
import { leaveOrganization } from './leaveOrganization';
import * as organizationService from '../services/organization.service';

// Mock service layer
vi.mock('../services/organization.service');

// Test constants
const USER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const OWNER_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const ORGANIZATION_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

const MOCK_ORGANIZATION = {
  id: ORGANIZATION_ID,
  name: 'Test Organization',
  slug: 'test-organization',
  description: 'Test description',
  invite_code: 'TESTCODE',
  created_by: OWNER_ID,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
};

const MOCK_ADMIN_ROLE = {
  id: 'role-admin-id',
  name: 'organization_admin',
};

const MOCK_MEMBER_ROLE = {
  id: 'role-member-id',
  name: 'organization_member',
};

describe('leaveOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should allow member to leave organization', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_MEMBER_ROLE as any);
      vi.mocked(organizationService.removeUserFromOrganizationInDB).mockResolvedValue(undefined);

      // Act
      const result = await leaveOrganization(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result).toEqual({ success: true });
      expect(organizationService.removeUserFromOrganizationInDB).toHaveBeenCalledWith(
        ORGANIZATION_ID,
        USER_ID
      );
    });

    it('should remove user from organization_members table', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_MEMBER_ROLE as any);
      vi.mocked(organizationService.removeUserFromOrganizationInDB).mockResolvedValue(undefined);

      // Act
      await leaveOrganization(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(organizationService.removeUserFromOrganizationInDB).toHaveBeenCalledWith(
        ORGANIZATION_ID,
        USER_ID
      );
      expect(organizationService.removeUserFromOrganizationInDB).toHaveBeenCalledTimes(1);
    });

    it('should return success confirmation', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_MEMBER_ROLE as any);
      vi.mocked(organizationService.removeUserFromOrganizationInDB).mockResolvedValue(undefined);

      // Act
      const result = await leaveOrganization(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result).toEqual({ success: true });
      expect(result.success).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should throw ORGANIZATION_NOT_FOUND when orgId does not exist', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(null);

      // Act & Assert
      await expect(leaveOrganization(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'Organization not found'
      );

      expect(organizationService.removeUserFromOrganizationInDB).not.toHaveBeenCalled();
    });

    it('should throw NOT_A_MEMBER when user is not member', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(leaveOrganization(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'You are not a member of this organization'
      );

      expect(organizationService.removeUserFromOrganizationInDB).not.toHaveBeenCalled();
    });

    it('should throw OWNER_CANNOT_LEAVE when user is owner', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);

      // Act & Assert
      await expect(leaveOrganization(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'The owner cannot leave the organization'
      );

      expect(organizationService.removeUserFromOrganizationInDB).not.toHaveBeenCalled();
    });
  });

  describe('Business Rules', () => {
    it('should require owner to transfer ownership or delete org before leaving', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);

      // Act & Assert
      await expect(leaveOrganization(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        /transfer ownership|delete the organization/i
      );
    });

    it('should prevent last admin from leaving if no other admins exist', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_ADMIN_ROLE as any);
      vi.mocked(organizationService.countOrganizationAdminsFromDB).mockResolvedValue(1); // Only 1 admin

      // Act & Assert
      await expect(leaveOrganization(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'Cannot leave: you are the last administrator'
      );

      expect(organizationService.removeUserFromOrganizationInDB).not.toHaveBeenCalled();
    });

    it('should allow admin to leave if other admins exist', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_ADMIN_ROLE as any);
      vi.mocked(organizationService.countOrganizationAdminsFromDB).mockResolvedValue(2); // Multiple admins
      vi.mocked(organizationService.removeUserFromOrganizationInDB).mockResolvedValue(undefined);

      // Act
      const result = await leaveOrganization(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result).toEqual({ success: true });
      expect(organizationService.removeUserFromOrganizationInDB).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should ensure user permissions are revoked after leaving', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_MEMBER_ROLE as any);
      vi.mocked(organizationService.removeUserFromOrganizationInDB).mockResolvedValue(undefined);

      // Act
      await leaveOrganization(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(organizationService.removeUserFromOrganizationInDB).toHaveBeenCalledWith(
        ORGANIZATION_ID,
        USER_ID
      );
      // The service function handles cascade deletion of permissions
    });
  });

  describe('Service Integration', () => {
    it('should call removeUserFromOrganizationInDB with correct params', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_MEMBER_ROLE as any);
      vi.mocked(organizationService.removeUserFromOrganizationInDB).mockResolvedValue(undefined);

      // Act
      await leaveOrganization(ORGANIZATION_ID, USER_ID);

      // Assert
      const mockFn = vi.mocked(organizationService.removeUserFromOrganizationInDB);
      expect(mockFn).toHaveBeenCalledWith(ORGANIZATION_ID, USER_ID);
      expect(mockFn.mock.calls[0][0]).toBe(ORGANIZATION_ID);
      expect(mockFn.mock.calls[0][1]).toBe(USER_ID);
    });
  });
});
