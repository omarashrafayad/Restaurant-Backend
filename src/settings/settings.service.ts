import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const SETTINGS_STATUS_CHANGED = 'settings.status_changed';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Settings, SettingsDocument, OpeningHours } from './schema/settings.schema.js';
import { UpdateSettingsDto, ToggleOrdersDto } from './dtos/update-settings.dto.js';
import { BadRequestException } from '../common/error-handling/custom-excepction/bad-request.exceprions.js';
import { hhmmToMinutes, zonedParts } from '../common/utils/time.util.js';

const CACHE_TTL_MS = 15_000;

export interface RestaurantContact {
  name: string;
  nameAr: string;
  phone: string;
  secondaryPhone?: string;
  whatsapp?: string;
}

@Injectable()
export class SettingsService {
  private cache?: { value: Settings; at: number };

  constructor(
    @InjectModel(ModelNames.Settings) private readonly settingsModel: Model<SettingsDocument>,
    private readonly events: EventEmitter2,
  ) {}

  /** Returns the singleton settings document (created with defaults on first use). */
  async get(fresh = false): Promise<Settings> {
    if (!fresh && this.cache && Date.now() - this.cache.at < CACHE_TTL_MS) return this.cache.value;
    const value = await this.settingsModel
      .findOneAndUpdate(
        { key: 'restaurant' },
        { $setOnInsert: { key: 'restaurant' } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      )
      .lean<Settings>();
    this.cache = { value: value!, at: Date.now() };
    return value!;
  }

  async update(dto: UpdateSettingsDto): Promise<Settings> {
    const value = await this.settingsModel
      .findOneAndUpdate(
        { key: 'restaurant' },
        { $set: dto },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true },
      )
      .lean<Settings>();
    this.cache = { value: value!, at: Date.now() };
    return value!;
  }

  async toggleOrders(dto: ToggleOrdersDto) {
    const value = await this.update(dto);
    this.events.emit(SETTINGS_STATUS_CHANGED, await this.getStatus());
    return value;
  }

  /** True when `now` falls inside one of the opening-hour slots (supports after-midnight closing). */
  isWithinOpeningHours(hours: OpeningHours[], now: Date = new Date()): boolean {
    if (!hours?.length) return true;
    const { weekday, minuteOfDay } = zonedParts(now);
    const yesterday = (weekday + 6) % 7;

    return hours.some((slot) => {
      if (slot.closed) return false;
      const open = hhmmToMinutes(slot.open);
      const close = hhmmToMinutes(slot.close);
      const overnight = close <= open;
      if (slot.day === weekday) {
        return overnight ? minuteOfDay >= open : minuteOfDay >= open && minuteOfDay < close;
      }
      // Tail of yesterday's after-midnight slot.
      return slot.day === yesterday && overnight && minuteOfDay < close;
    });
  }

  /** Public status shown in the apps (open/closed banner). */
  async getStatus(now: Date = new Date(), fresh = false) {
    const s = await this.get(fresh);
    const withinHours = this.isWithinOpeningHours(s.openingHours, now);
    const isOpen = s.acceptingOrders && withinHours;
    return {
      isOpen,
      acceptingOrders: s.acceptingOrders,
      withinOpeningHours: withinHours,
      message: isOpen
        ? undefined
        : !s.acceptingOrders
          ? s.pausedMessage || 'The restaurant is not accepting orders right now'
          : 'The restaurant is closed now, please check our opening hours',
    };
  }

  /** Throws a customer-friendly error when orders cannot be placed now. */
  async assertCanAcceptOrders(): Promise<void> {
    const status = await this.getStatus();
    if (!status.isOpen) throw new BadRequestException(status.message!);
  }

  async getContact(): Promise<RestaurantContact> {
    const s = await this.get();
    return {
      name: s.name,
      nameAr: s.nameAr,
      phone: s.phone,
      secondaryPhone: s.secondaryPhone,
      whatsapp: s.whatsapp,
    };
  }

  /** Everything the customer app needs at start-up. */
  async getPublic() {
    const s = await this.get();
    return {
      name: s.name,
      nameAr: s.nameAr,
      logo: s.logo,
      phone: s.phone,
      secondaryPhone: s.secondaryPhone,
      whatsapp: s.whatsapp,
      address: s.address,
      currency: s.currency,
      openingHours: s.openingHours,
      taxPercentage: s.taxPercentage,
      allowCustomerCancelWhilePending: s.allowCustomerCancelWhilePending,
      ...(await this.getStatus()),
    };
  }
}
