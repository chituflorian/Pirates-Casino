import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsDifficulty(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isDifficulty',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return ['EASY', 'MEDIUM', 'HARD', 'EXTREME', 'NIGHTMARE'].includes(
            value,
          );
        },
      },
    });
  };
}
