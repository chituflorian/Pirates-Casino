import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from '../utils/types/entity-condition.type';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';
import { Wallet } from '../blockchain/entities/wallet.entity';
import { LoginDTO } from '../auth/dto/login.dto';
import { StatusEnum } from '../statuses/statuses.enum';
import { RoleEnum } from '../roles/roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  async create(loginDto: LoginDTO): Promise<User> {
    // Create a new user instance
    const user = await this.usersRepository.create({
      statusId: StatusEnum.active,
      roleId: RoleEnum.user,
    });
    // Save the user to get the generated ID

    await this.usersRepository.save(user);

    // Create a new wallet instance and set it as primary
    const wallet = await this.walletsRepository.create({
      address: loginDto.address,
      chainTypeId: loginDto.chainTypeId,
      isPrimary: true,
      user: user,
    });

    // Save the wallet
    await this.walletsRepository.save(wallet);
    // Return the created user
    return user;
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<User[]> {
    return this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
    });
  }

  async findOneByWallet(address: string): Promise<User | undefined> {
    const wallet = await this.walletsRepository.findOne({
      where: {
        address,
      },
      relations: ['user'],
    });
    return wallet?.user;
  }

  update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async linkWallet(user: User, loginDto: LoginDTO): Promise<void> {
    const checkExisting = await this.walletsRepository.findOne({
      where: {
        address: loginDto.address,
      },
    });
    if (checkExisting) {
      throw new BadRequestException('Wallet already linked');
    }
    // Create and save the new wallet
    const wallet = await this.walletsRepository.create({
      address: loginDto.address,
      chainTypeId: loginDto.chainTypeId,
      isPrimary: false,
      user: user,
    });

    await this.walletsRepository.save(wallet);
  }
}
