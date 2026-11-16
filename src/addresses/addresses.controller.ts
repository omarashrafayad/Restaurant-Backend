import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { APi_TAGS } from '../common/swagger/constant.js';
import { AddressesService } from './addresses.service.js';
import { AddAddressDto, UpdateAddressDto } from './dtos/add-address.dto.js';
import { CurrentAccount, Principal } from '../auth/decorator/current-account.decorator.js';

@ApiTags(APi_TAGS.ADDRESSES)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @ApiOperation({ summary: 'Add a new delivery address' })
  @ApiResponse({ status: 200, description: 'Address added successfully' })
  @Post()
  async addAddress(
    @CurrentAccount() principal: Principal,
    @Body() body: AddAddressDto,
  ) {
    return this.addressesService.addAddress(principal.user._id, body);
  }

  @ApiOperation({ summary: 'Update a delivery address (or make it the default)' })
  @Patch(':addressId')
  async updateAddress(
    @CurrentAccount() principal: Principal,
    @Param('addressId') addressId: string,
    @Body() body: UpdateAddressDto,
  ) {
    return this.addressesService.updateAddress(principal.user._id, addressId, body);
  }

  @ApiOperation({ summary: 'Delete a delivery address' })
  @ApiResponse({ status: 204, description: 'Address removed' })
  @Delete(':addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeAddress(
    @CurrentAccount() principal: Principal,
    @Param('addressId') addressId: string,
  ) {
    return this.addressesService.removeAddress(principal.user._id, addressId);
  }

  @ApiOperation({ summary: 'Get logged in customer delivery addresses' })
  @ApiResponse({ status: 200, description: 'List of addresses' })
  @Get()
  async getLoggedUserAddresses(@CurrentAccount() principal: Principal) {
    return this.addressesService.getLoggedUserAddresses(principal.user._id);
  }
}
