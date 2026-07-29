/**
 * shipping — the adapter BOUNDARY (Tier-2 #11).
 *
 * Use when: any fulfilment flow (rates, labels, tracking). Call sites depend on
 * this interface, never on a courier SDK — so Shiprocket → Delhivery → EasyPost
 * is a new adapter, not a rewrite.
 */

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Parcel {
  weightGrams: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface ShippingRate {
  courier: string;
  serviceCode: string;
  amount: number; // smallest unit (paise)
  etaDays: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  labelUrl?: string;
  status: 'created' | 'in_transit' | 'delivered' | 'failed';
}

export interface ShippingAdapter {
  readonly provider: string;
  getRates(from: Address, to: Address, parcel: Parcel): Promise<ShippingRate[]>;
  createShipment(from: Address, to: Address, parcel: Parcel, serviceCode: string): Promise<Shipment>;
  track(trackingNumber: string): Promise<Shipment>;
}

export async function getShipping(): Promise<ShippingAdapter> {
  const provider = process.env.SHIPPING_PROVIDER?.trim() || 'shiprocket';
  switch (provider) {
    case 'shiprocket': {
      const { ShiprocketAdapter } = await import('./shiprocket');
      return new ShiprocketAdapter();
    }
    default:
      throw new Error(`unknown SHIPPING_PROVIDER "${provider}" — add an adapter in lib/integrations/shipping/`);
  }
}
