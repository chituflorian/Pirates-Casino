import { BadRequestException } from '@nestjs/common';
import NodeCache from 'node-cache';

export function LockRequest(options: {
  lockService: NodeCache;
  idPath?: string;
  method: string;
}): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const id = args[0][options.idPath ?? 'id'];
      const lockId = `${options.method}::${id}`;
      if (options.lockService.get(id) !== undefined) {
        throw new BadRequestException('You already have a request in progress');
      }
      options.lockService.set(lockId, true);
      try {
        return await originalMethod.apply(this, args);
      } finally {
        options.lockService.del(lockId);
      }
    };
  };
}
