import 'server-only';
import type {
  ShippingAdapter,
  Address,
  Parcel,
  ShippingRate,
  Shipment,
} from './index';

/**
 * Shiprocket adapter — STUB. Shows the boundary; the methods need the Shiprocket
 * API + credentials to do real work.
 *
 * To finish: get a Shiprocket account, auth for a token (SHIPROCKET_EMAIL /
 * SHIPROCKET_PASSWORD or an API token in env, server only), and implement the
 * three calls. Keep all HTTP inside this file — call sites only see the interface.
 */
export class ShiprocketAdapter implements ShippingAdapter {
  readonly provider = 'shiprocket';

  async getRates(_from: Address, _to: Address, _parcel: Parcel): Promise<ShippingRate[]> {
    throw new Error('ShiprocketAdapter.getRates is a stub — implement the serviceability/rate API call.');
  }

  async createShipment(
    _from: Address,
    _to: Address,
    _parcel: Parcel,
    _serviceCode: string
  ): Promise<Shipment> {
    throw new Error('ShiprocketAdapter.createShipment is a stub — implement the create-order + AWB call.');
  }

  async track(_trackingNumber: string): Promise<Shipment> {
    throw new Error('ShiprocketAdapter.track is a stub — implement the tracking API call.');
  }
}
