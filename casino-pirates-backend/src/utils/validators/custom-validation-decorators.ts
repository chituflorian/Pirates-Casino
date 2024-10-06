/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export function IsNoLeadingOrTrailingWhitespace(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isNoLeadingOrTrailingWhitespace',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            typeof value === 'string' &&
            !value.startsWith(' ') &&
            !value.endsWith(' ')
          );
        },
      },
    });
  };
}
@ValidatorConstraint({ name: 'isDifferent', async: false })
export class IsDifferent implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const relatedPropertyName = args.constraints[0];
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value !== relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Values should be different';
  }
}
