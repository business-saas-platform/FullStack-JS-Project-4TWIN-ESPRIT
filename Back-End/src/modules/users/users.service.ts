import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DeepPartial } from "typeorm";
import { UserEntity } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { toIso } from "../../common/api-mapper";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private repo: Repository<UserEntity>) {}

  async create(dto: CreateUserDto) {
    const entity = this.repo.create({ ...dto } as DeepPartial<UserEntity>);
    const saved = await this.repo.save(entity);
    return { ...saved, createdAt: toIso(saved.createdAt)! };
  }

  async findAll() {
    const list = await this.repo.find({ order: { createdAt: "DESC" } });
    return list.map((u) => ({ ...u, createdAt: toIso(u.createdAt)! }));
  }

  async findOne(id: string) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException("User not found");
    return { ...u, createdAt: toIso(u.createdAt)! };
  }

  async update(id: string, dto: UpdateUserDto) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException("User not found");
    Object.assign(u, dto);
    const saved = await this.repo.save(u);
    return { ...saved, createdAt: toIso(saved.createdAt)! };
  }

  async remove(id: string) {
    const res = await this.repo.delete({ id });
    if (!res.affected) throw new NotFoundException("User not found");
    return { deleted: true, id };
  }
}
