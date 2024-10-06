import { IsEnum } from 'class-validator';
import { WithdrawalStatusType } from '../status-type.enum';

export class UpdateWithdrawalStatusDto {
  @IsEnum(WithdrawalStatusType)
  newStatus: WithdrawalStatusType.ACCEPTED | WithdrawalStatusType.DECLINED;
}
