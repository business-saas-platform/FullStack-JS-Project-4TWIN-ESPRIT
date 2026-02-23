import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClientEntity } from "./entities/client.entity";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { toIso } from "../../common/api-mapper";

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(ClientEntity) private repo: Repository<ClientEntity>) {}

  async create(businessId: string, dto: CreateClientDto) {
    const entity = this.repo.create({
      ...dto,
      businessId,
      status: dto.status ?? "active",
      totalRevenue: 0,
      outstandingBalance: 0,
    });
    const saved = await this.repo.save(entity);
    return this.toApi(saved);
  }

  async findAll(businessId: string) {
    const list = await this.repo.find({
      where: { businessId },
      order: { createdAt: "DESC" },
    });
    return list.map((c) => this.toApi(c));
  }

  async findOne(businessId: string, id: string) {
    const c = await this.repo.findOne({ where: { id, businessId } });
    if (!c) throw new NotFoundException("Client not found");
    return this.toApi(c);
  }

  async update(businessId: string, id: string, dto: UpdateClientDto) {
    const c = await this.repo.findOne({ where: { id, businessId } });
    if (!c) throw new NotFoundException("Client not found");
    Object.assign(c, dto);
    const saved = await this.repo.save(c);
    return this.toApi(saved);
  }

  async remove(businessId: string, id: string) {
    const res = await this.repo.delete({ id, businessId });
    if (!res.affected) throw new NotFoundException("Client not found");
    return { deleted: true, id };
  }

private toApi(c: ClientEntity) {
    return {
      id: c.id,
      businessId: c.businessId,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      postalCode: c.postalCode,
      country: c.country,
      taxId: c.taxId,
      type: c.type,
      status: c.status,
      totalRevenue: c.totalRevenue,
      outstandingBalance: c.outstandingBalance,
      createdAt: toIso(c.createdAt)!,
      lastContactDate: c.lastContactDate,
      notes: c.notes,
    };
  }
}
