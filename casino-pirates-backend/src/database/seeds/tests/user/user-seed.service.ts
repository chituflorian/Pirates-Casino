import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEnum } from '../../../../roles/roles.enum';
// import { StatusEnum } from '../../../../statuses/statuses.enum';
import { User } from '../../../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { StatusEnum } from '../../../../statuses/statuses.enum';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async run() {
    // const countAdmin = await this.repository.count({
    //   where: {
    //     roleId: RoleEnum.admin,
    //   },
    // });

    // if (!countAdmin) {
    //   await this.repository.save(
    //     this.repository.create({
    //       id: 1,
    //       username: 'super_admin_user',
    //       role: {
    //         id: RoleEnum.admin,
    //         name: 'Admin',
    //       },
    //       statusId: StatusEnum.active,
    //       balance: 1000,
    //     }),
    //   );
    // }

    const countUser = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.user,
        },
      },
    });

    if (!countUser) {
      await this.repository.save(
        this.repository.create({
          id: 2,
          balance: 1000,
          photo: null,
          role: {
            id: RoleEnum.user,
            name: 'User',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
          referralCode: 'REF',
          referredBy: null,
          bonus_balance: 0,
          username: 'username',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          level: 1,
        }),
      );
    }
  }
}
