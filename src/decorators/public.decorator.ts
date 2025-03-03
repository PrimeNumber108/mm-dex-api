import { SWAGGER_API_OPERATION } from 'src/libs/utils/consts';

export const IS_PUBLIC_KEY = 'isPublic';

export function Public(): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const prevValue =
      Reflect.getMetadata(SWAGGER_API_OPERATION, descriptor.value) || {};

    prevValue.summary = `[public] ${prevValue.summary ? ` | ${prevValue.summary}` : ''}`;

    Reflect.defineMetadata(SWAGGER_API_OPERATION, prevValue, descriptor.value);
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, descriptor.value);
    return descriptor;
  };
}
