import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config, OptionType } from './entities/platformconfig.entity';

type ConfigItemValue = string | number | null | boolean;

@Injectable()
export class PlatformConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  private config: Map<string, ConfigItemValue> = new Map();

  async onModuleInit() {
    const configItems = await this.configRepository.find();

    for (const option of configItems) {
      const value = this.castValue(option.option_value, option.option_type);
      this.config.set(option.option_key, value);
    }
  }

  public async get(key: string): Promise<ConfigItemValue> {
    const value = this.config.get(key);
    if (value !== undefined) {
      return value;
    }
    const configItem = await this.configRepository.findOne({
      where: { option_key: key },
    });
    if (configItem) {
      return this.castValue(configItem.option_value, configItem.option_type);
    }
    return null;
  }

  public getAll(): Record<string, ConfigItemValue> {
    const configObject: Record<string, ConfigItemValue> = {};
    this.config.forEach((value, key) => {
      configObject[key] = value;
    });
    return configObject;
  }

  public async set(key: string, value: ConfigItemValue): Promise<void> {
    this.config.set(key, value);
    await this.configRepository.update(
      { option_key: key },
      { option_value: value as string },
    );
  }

  private castValue(value: any, type: OptionType): ConfigItemValue {
    switch (type) {
      case 'string':
        return value.toString();
      case 'number':
        return Number(value);
      case 'boolean':
        return !!value;
      default:
        return value.toString();
    }
  }
}
