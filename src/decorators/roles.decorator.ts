import { SWAGGER_API_OPERATION } from "src/libs/utils/consts";
import { UserRole } from "src/modules/user/user.entity";

export const ROLES_KEY = 'roles';

export function Roles(...roles: UserRole[]): MethodDecorator {
  return (target: object, key: string | symbol, descriptor: PropertyDescriptor) => {
    const prevValue = Reflect.getMetadata(SWAGGER_API_OPERATION, descriptor.value) || {};

    prevValue.summary = `${roles.reduce((prev, curr) => `${prev} [${curr}]`, '')}${prevValue.summary ? ` | ${prevValue.summary}` : ''}`;

    Reflect.defineMetadata(SWAGGER_API_OPERATION, prevValue, descriptor.value);
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor.value);
    return descriptor;
  };
}
