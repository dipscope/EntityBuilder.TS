import { Fn } from './core/fn';
import { Type } from './type';
import { Property } from './property';
import { TypeOptions } from './core/type-options';
import { PropertyOptions } from './core/property-options';

/**
 * Type and property decorator.
 * 
 * Used to define custom options for type and property.
 * 
 * @param {TypeOptions&PropertyOptions} x Type and property options.
 * 
 * @returns {ClassDecorator&PropertyDecorator} Class and property decorator.
 */
export function TypeAndProperty<TType>(x: TypeOptions<TType> & PropertyOptions<TType>): ClassDecorator & PropertyDecorator
{
    return function (target: any, propertyName?: string | symbol): any
    {
        const usedOnClass = Fn.isNil(propertyName);

        if (usedOnClass)
        {
            return Type(x)(target);
        }

        return Property(x)(target, propertyName!);
    }
}
