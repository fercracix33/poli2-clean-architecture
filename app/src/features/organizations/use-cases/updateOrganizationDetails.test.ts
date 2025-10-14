import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { updateOrganizationDetails } from './updateOrganizationDetails';
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

describe('updateOrganizationDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should update name and description when user has org.manage permission', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Organization',
        description: 'Updated description',
      };

      const updatedOrg = {
        ...MOCK_ORGANIZATION,
        ...updateData,
        updated_at: new Date('2024-01-02T00:00:00Z'),
      };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue(updatedOrg as any);

      // Act
      const result = await updateOrganizationDetails(ORGANIZATION_ID, USER_ID, updateData);

      // Assert
      expect(result).toEqual(updatedOrg);
      expect(organizationService.userHasPermissionInOrganization).toHaveBeenCalledWith(
        USER_ID,
        ORGANIZATION_ID,
        'organization.update'
      );
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, updateData);
    });

    it('should allow partial update (only name)', async () => {
      // Arrange
      const updateData = {
        name: 'New Name Only',
      };

      const updatedOrg = {
        ...MOCK_ORGANIZATION,
        name: 'New Name Only',
        updated_at: new Date('2024-01-02T00:00:00Z'),
      };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue(updatedOrg as any);

      // Act
      const result = await updateOrganizationDetails(ORGANIZATION_ID, USER_ID, updateData);

      // Assert
      expect(result.name).toBe('New Name Only');
      expect(result.description).toBe(MOCK_ORGANIZATION.description); // Unchanged
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, {
        name: 'New Name Only',
      });
    });

    it('should allow partial update (only description)', async () => {
      // Arrange
      const updateData = {
        description: 'New Description Only',
      };

      const updatedOrg = {
        ...MOCK_ORGANIZATION,
        description: 'New Description Only',
        updated_at: new Date('2024-01-02T00:00:00Z'),
      };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue(updatedOrg as any);

      // Act
      const result = await updateOrganizationDetails(ORGANIZATION_ID, USER_ID, updateData);

      // Assert
      expect(result.description).toBe('New Description Only');
      expect(result.name).toBe(MOCK_ORGANIZATION.name); // Unchanged
    });
  });

  describe('Error Cases', () => {
    it('should throw ORGANIZATION_NOT_FOUND when orgId does not exist', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(null);

      // Act & Assert
      await expect(
        updateOrganizationDetails(ORGANIZATION_ID, USER_ID, { name: 'Test' })
      ).rejects.toThrow('Organization not found');

      expect(organizationService.userHasPermissionInOrganization).not.toHaveBeenCalled();
      expect(organizationService.updateOrganizationInDB).not.toHaveBeenCalled();
    });

    it('should throw ACCESS_DENIED when user lacks org.manage permission', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(false);

      // Act & Assert
      await expect(
        updateOrganizationDetails(ORGANIZATION_ID, USER_ID, { name: 'Test' })
      ).rejects.toThrow('Insufficient permissions');

      expect(organizationService.updateOrganizationInDB).not.toHaveBeenCalled();
    });

    it('should throw SLUG_IMMUTABLE if trying to update slug', async () => {
      // Arrange
      const updateData = {
        slug: 'new-slug',
      } as any;

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);

      // Act & Assert
      await expect(
        updateOrganizationDetails(ORGANIZATION_ID, USER_ID, updateData)
      ).rejects.toThrow('Slug cannot be modified');

      expect(organizationService.updateOrganizationInDB).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should reject name shorter than 2 characters', async () => {
      // Arrange
      const invalidData = {
        name: 'A', // Too short
      };

      // Act & Assert
      await expect(
        updateOrganizationDetails(ORGANIZATION_ID, USER_ID, invalidData)
      ).rejects.toThrow(ZodError);
    });

    it('should reject name longer than 100 characters', async () => {
      // Arrange
      const invalidData = {
        name: 'x'.repeat(101), // Too long
      };

      // Act & Assert
      await expect(
        updateOrganizationDetails(ORGANIZATION_ID, USER_ID, invalidData)
      ).rejects.toThrow(ZodError);
    });

    it('should reject description longer than 500 characters', async () => {
      // Arrange
      const invalidData = {
        description: 'x'.repeat(501), // Too long
      };

      // Act & Assert
      await expect(
        updateOrganizationDetails(ORGANIZATION_ID, USER_ID, invalidData)
      ).rejects.toThrow(ZodError);
    });
  });

  describe('Service Integration', () => {
    it('should call updateOrganizationInDB with correct params', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(MOCK_ORGANIZATION as any);
      vi.mocked(organizationService.userHasPermissionInOrganization).mockResolvedValue(true);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue({
        ...MOCK_ORGANIZATION,
        ...updateData,
      } as any);

      // Act
      await updateOrganizationDetails(ORGANIZATION_ID, USER_ID, updateData);

      // Assert
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledWith(ORGANIZATION_ID, updateData);
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledTimes(1);
    });

    it('should check permissions before updating', async () => {
      // Arrange
      const callOrder: string[] = [];

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockImplementation(async () => {
        callOrder.push('getOrganization');
        return MOCK_ORGANIZATION as any;
      });

      vi.mocked(organizationService.userHasPermissionInOrganization).mockImplementation(async () => {
        callOrder.push('checkPermission');
        return true;
      });

      vi.mocked(organizationService.updateOrganizationInDB).mockImplementation(async () => {
        callOrder.push('updateOrganization');
        return MOCK_ORGANIZATION as any;
      });

      // Act
      await updateOrganizationDetails(ORGANIZATION_ID, USER_ID, { name: 'Test' });

      // Assert
      expect(callOrder).toEqual(['getOrganization', 'checkPermission', 'updateOrganization']);
    });
  });
});
