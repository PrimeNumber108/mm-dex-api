import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isAddress } from 'ethers';

// Validator Constraint for evm Address
@ValidatorConstraint({ async: false })
export class IsAddress implements ValidatorConstraintInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(address: string, args: ValidationArguments) {
    try {
      // Basic example to validate a Evm address (modify based on actual Evm address format)
      return isAddress(address);
    } catch (err) {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return 'Invalid evm address format!';
  }
}

// Custom decorator
export function IsValidAddress(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAddress,
    });
  };
}
