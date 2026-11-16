import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/repository/user.repository.js';
import { DeliveryZoneRepository } from '../delivery-zones/repository/delivery-zone.repository.js';
import { AddressDto, UpdateAddressDto } from '../users/dto/address.dto.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../common/error-handling/custom-excepction/bad-request.exceprions.js';

export const MAX_ADDRESSES = 10;

@Injectable()
export class AddressesService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly zoneRepository: DeliveryZoneRepository,
  ) {}

  /** Validates the zone and returns the normalised address to store. */
  async buildAddress<T extends Partial<AddressDto>>(dto: T): Promise<T & { city?: string }> {
    if (!dto.zone) return dto;
    const zone = await this.zoneRepository.findOne({ _id: dto.zone as any, isActive: true });
    if (!zone) {
      throw new BadRequestException('Sorry, we do not deliver to this area yet');
    }
    return { ...dto, city: zone.name };
  }

  private async getUser(userId: string) {
    const user = await this.userRepository.model.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async addAddress(userId: string, dto: AddressDto) {
    const user = await this.getUser(userId);
    if (user.addresses.length >= MAX_ADDRESSES) {
      throw new BadRequestException(`You can save up to ${MAX_ADDRESSES} addresses`);
    }

    const address = await this.buildAddress(dto);
    const makeDefault = address.isDefault || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push({ ...address, isDefault: makeDefault } as any);
    await user.save();

    return {
      status: 'success',
      message: 'Address added successfully.',
      data: user.addresses[user.addresses.length - 1],
    };
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const user = await this.getUser(userId);
    const address = user.addresses.find((a) => a._id?.toString() === addressId);
    if (!address) throw new NotFoundException('Address not found');

    const patch = await this.buildAddress(dto);
    if (patch.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(address, patch);
    await user.save();

    return { status: 'success', data: address };
  }

  async removeAddress(userId: string, addressId: string) {
    const user = await this.getUser(userId);
    const index = user.addresses.findIndex((a) => a._id?.toString() === addressId);
    if (index === -1) throw new NotFoundException('Address not found');

    const [removed] = user.addresses.splice(index, 1);
    if (removed.isDefault && user.addresses.length) user.addresses[0].isDefault = true;
    await user.save();
  }

  async getLoggedUserAddresses(userId: string) {
    const user = await this.userRepository.model
      .findById(userId)
      .populate('addresses.zone', 'name nameAr deliveryFee minOrderAmount estimatedDeliveryMinutes isActive')
      .lean();
    if (!user) throw new NotFoundException('User not found');

    return {
      status: 'success',
      results: user.addresses.length,
      data: user.addresses,
    };
  }
}
