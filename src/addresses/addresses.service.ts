import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/repository/user.repository.js';
import { AddAddressDto } from './dtos/add-address.dto.js';
import { NotFoundException } from '../common/error-handling/custom-excepction/not-found.exception.js';
import { BadRequestException } from '../common/error-handling/custom-excepction/bad-request.exceprions.js';

@Injectable()
export class AddressesService {
  constructor(private readonly userRepository: UserRepository) {}

  async addAddress(userId: string, dto: AddAddressDto) {
    const user = await this.userRepository.findById(userId, { lean: false });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const addresses = (user as any).addresses || [];
    const exists = addresses.some(
      (addr: any) =>
        addr.details?.trim().toLowerCase() === dto.details.trim().toLowerCase() &&
        addr.city?.trim().toLowerCase() === dto.city.trim().toLowerCase(),
    );

    if (exists) {
      throw new BadRequestException('Address already exists');
    }

    addresses.push(dto);
    await (user as any).save();

    const createdAddress = addresses[addresses.length - 1];

    return {
      status: 'success',
      message: 'Address added successfully.',
      data: createdAddress,
    };
  }

  async removeAddress(userId: string, addressId: string) {
    const user = await this.userRepository.findByIdAndUpdate(
      userId,
      {
        $pull: { addresses: { _id: addressId } },
      },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async getLoggedUserAddresses(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const addresses = (user as any).addresses || [];

    return {
      status: 'success',
      results: addresses.length,
      data: addresses,
    };
  }
}
