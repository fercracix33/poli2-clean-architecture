import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOrganizationDetails } from './getOrganizationDetails';
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

const MOCK_MEMBER_ROLE = {
  id: 'role-member-id',
  name: 'organization_member',
};

const MOCK_ADMIN_ROLE = {
  id: 'role-admin-id',
  name: 'organization_admin',
};

describe('getOrganizationDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return organization with details when user is member', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_MEMBER_ROLE as any);
      vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue(['organization.view']);

      const expectedResult = {
        organization: MOCK_ORGANIZATION,
        userRole: 'organization_member',
        isOwner: false,
        isAdmin: false,
        canManageMembers: false,
        canEditSettings: false,
      };

      // Act
      const result = await getOrganizationDetails('test-organization', USER_ID);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(organizationService.getOrganizationBySlugFromDB).toHaveBeenCalledWith('test-organization');
      expect(organizationService.isUserMemberOfOrganization).toHaveBeenCalledWith(USER_ID, ORGANIZATION_ID);
      expect(organizationService.getUserRoleInOrganization).toHaveBeenCalledWith(USER_ID, ORGANIZATION_ID);
    });

    it('should return isOwner=true when user is creator', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };
      vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue({
        id: 'owner-role-id',
        name: 'organization_owner',
      } as any);
      vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
        'organization.view',
        'organization.update',
        'organization.delete',
        'user.manage',
      ]);

      // Act
      const result = await getOrganizationDetails('test-organization', USER_ID);

      // Assert
      expect(result.isOwner).toBe(true);
      expect(result.isAdmin).toBe(true);
      expect(result.canManageMembers).toBe(true);
      expect(result.canEditSettings).toBe(true);
    });

    it('should return isAdmin=true for admin role', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.getUserRoleInOrganization).mockResolvedValue(MOCK_ADMIN_ROLE as any);
      vi.mocked(organizationService.getUserPermissionsInOrganization).mockResolvedValue([
        'organization.view',
        'organization.update',
        'user.manage',
      ]);

      // Act
      const result = await getOrganizationDetails('test-organization', USER_ID);

      // Assert
      expect(result.isAdmin).toBe(true);
      expect(result.canManageMembers).toBe(true);
      expect(result.canEditSettings).toBe(true);
    });
  });

  describe('Error Cases', () => {
    it('should throw ORGANIZATION_NOT_FOUND when slug does not exist', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue(null);

      // Act & Assert
      await expect(getOrganizationDetails('non-existent-org', USER_ID)).rejects.toThrow(
        'Organization not found'
      );

      expect(organizationService.isUserMemberOfOrganization).not.toHaveBeenCalled();
    });

    it('should throw ACCESS_DENIED when user is not member', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(getOrganizationDetails('test-organization', USER_ID)).rejects.toThrow(
        'You are not a member of this organization'
      );

      expect(organizationService.getUserRoleInOrganization).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should reject empty slug', async () => {
      // Act & Assert
      await expect(getOrganizationDetails('', USER_ID)).rejects.toThrow('Slug cannot be empty');

      expect(organizationService.getOrganizationBySlugFromDB).not.toHaveBeenCalled();
    });

    it('should reject slug with uppercase characters', async () => {
      // Act & Assert
      await expect(getOrganizationDetails('MyOrg', USER_ID)).rejects.toThrow(
        'Slug must be lowercase'
      );

      expect(organizationService.getOrganizationBySlugFromDB).not.toHaveBeenCalled();
    });

    it('should reject invalid userId format', async () => {
      // Act & Assert
      await expect(getOrganizationDetails('test-organization', 'not-a-uuid')).rejects.toThrow(
        'Invalid User ID format'
      );

      expect(organizationService.getOrganizationBySlugFromDB).not.toHaveBeenCalled();
    });
  });

  describe('Authorization', () => {
    it('should prevent non-member from viewing organization', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationBySlugFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.isUserMemberOfOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(getOrganizationDetails('test-organization', USER_ID)).rejects.toThrow(
        'not a member'
      );
    });

    it('should call service functions in correct order', async () => {
      // Arrange
      const callOrder: string[] = [];

      vi.mocked(organizationService.getOrganizationBySlugFromDB).mockImplementation(async () => {
        callOrder.push('getOrganizationBySlug');
        return MOCK_ORGANIZATION as any;
      });

      vi.mocked(organizationService.isUserMemberOfOrganization).mockImplementation(async () => {
        callOrder.push('isUserMember');
        return true;
      });

      vi.mocked(organizationService.getUserRoleInOrganization).mockImplementation(async () => {
        callOrder.push('getUserRole');
        return MOCK_MEMBER_ROLE as any;
      });

      vi.mocked(organizationService.getUserPermissionsInOrganization).mockImplementation(async () => {
        callOrder.push('getUserPermissions');
        return ['organization.view'];
      });

      // Act
      await getOrganizationDetails('test-organization', USER_ID);

      // Assert
      expect(callOrder).toEqual([
        'getOrganizationBySlug',
        'isUserMember',
        'getUserRole',
        'getUserPermissions',
      ]);
    });
  });
});
