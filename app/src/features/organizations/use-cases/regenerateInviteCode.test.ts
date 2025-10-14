import { describe, it, expect, vi, beforeEach } from 'vitest';
import { regenerateInviteCode } from './regenerateInviteCode';
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
  invite_code: 'OLDCODE1',
  created_by: OWNER_ID,
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z'),
};

describe('regenerateInviteCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should generate new 8-character invite code when user is owner', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };
      const updatedOrg = {
        ...ownerOrg,
        invite_code: 'NEWCODE1',
        updated_at: new Date('2024-01-02T00:00:00Z'),
      };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue(updatedOrg as any);

      // Act
      const result = await regenerateInviteCode(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result.invite_code).toBeDefined();
      expect(result.invite_code).toHaveLength(8);
      expect(result.invite_code).not.toBe('OLDCODE1'); // Different from old code
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledWith(
        ORGANIZATION_ID,
        expect.objectContaining({
          invite_code: expect.any(String),
        })
      );
    });

    it('should ensure old invite code becomes invalid', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };
      const oldCode = ownerOrg.invite_code;

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue({
        ...ownerOrg,
        invite_code: 'NEWCODE2',
      } as any);

      // Act
      const result = await regenerateInviteCode(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result.invite_code).not.toBe(oldCode);
      expect(result.invite_code).toMatch(/^[A-Z0-9]{8}$/);
    });

    it('should return new invite code in response', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue({
        ...ownerOrg,
        invite_code: 'ABC12345',
      } as any);

      // Act
      const result = await regenerateInviteCode(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result).toHaveProperty('invite_code');
      expect(typeof result.invite_code).toBe('string');
      expect(result.invite_code).toBe('ABC12345');
    });
  });

  describe('Error Cases', () => {
    it('should throw ORGANIZATION_NOT_FOUND when orgId does not exist', async () => {
      // Arrange
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(null);

      // Act & Assert
      await expect(regenerateInviteCode(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'Organization not found'
      );

      expect(organizationService.updateOrganizationInDB).not.toHaveBeenCalled();
    });

    it('should throw ACCESS_DENIED when user is not owner', async () => {
      // Arrange
      const nonOwnerOrg = { ...MOCK_ORGANIZATION, created_by: OWNER_ID };
      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(nonOwnerOrg as any);

      // Act & Assert
      await expect(regenerateInviteCode(ORGANIZATION_ID, USER_ID)).rejects.toThrow(
        'Only the owner can regenerate the invite code'
      );

      expect(organizationService.updateOrganizationInDB).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should ensure new code is unique (not already in use)', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);

      // Simulate collision on first attempt, success on second
      vi.mocked(organizationService.updateOrganizationInDB)
        .mockRejectedValueOnce(new Error('Duplicate invite code'))
        .mockResolvedValueOnce({
          ...ownerOrg,
          invite_code: 'UNIQUE01',
        } as any);

      // Act
      const result = await regenerateInviteCode(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result.invite_code).toBe('UNIQUE01');
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledTimes(2); // Retry happened
    });

    it('should generate code following format (8 alphanumeric uppercase)', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue({
        ...ownerOrg,
        invite_code: 'TEST1234',
      } as any);

      // Act
      const result = await regenerateInviteCode(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(result.invite_code).toMatch(/^[A-Z0-9]{8}$/);
      expect(result.invite_code).not.toContain(' ');
      expect(result.invite_code).not.toContain('-');
      expect(result.invite_code).not.toContain('_');
    });
  });

  describe('Service Integration', () => {
    it('should call updateOrganizationInDB with new invite_code', async () => {
      // Arrange
      const ownerOrg = { ...MOCK_ORGANIZATION, created_by: USER_ID };

      vi.mocked(organizationService.getOrganizationByIdFromDB).mockResolvedValue(ownerOrg as any);
      vi.mocked(organizationService.updateOrganizationInDB).mockResolvedValue({
        ...ownerOrg,
        invite_code: 'NEWCODE3',
      } as any);

      // Act
      await regenerateInviteCode(ORGANIZATION_ID, USER_ID);

      // Assert
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledWith(
        ORGANIZATION_ID,
        expect.objectContaining({
          invite_code: expect.stringMatching(/^[A-Z0-9]{8}$/),
        })
      );
      expect(organizationService.updateOrganizationInDB).toHaveBeenCalledTimes(1);
    });
  });
});
