export type StokvelId = string & { readonly _brand: 'StokvelId' };
export type MemberId = string & { readonly _brand: 'MemberId' };

export function toStokvelId(id: string): StokvelId {
  return id as StokvelId;
}

export function toMemberId(id: string): MemberId {
  return id as MemberId;
}
