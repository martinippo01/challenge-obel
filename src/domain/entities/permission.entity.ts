export class Permission {
  id: string;
  symbol: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    symbol: string,
    description: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.symbol = symbol;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

