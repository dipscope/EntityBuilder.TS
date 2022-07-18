import { Alias } from './alias';
import { DefaultValue } from './default-value';
import { Discriminant } from './discriminant';
import { GenericArgument } from './generic-argument';
import { InjectIndex } from './inject-index';
import { InjectOptions } from './inject-options';
import { PropertyName } from './property-name';
import { PropertyOptions } from './property-options';
import { TypeOptionsBase } from './type-options-base';

/**
 * Type options interface.
 * 
 * @type {TypeOptions<TType>}
 */
export type TypeOptions<TType> = Partial<TypeOptionsBase<TType>> &
{
    /**
     * Type alias. 
     * 
     * Can be used to resolve a type at runtime instead of type resolver function.
     * 
     * @type {Alias}
     */
    alias?: Alias;

    /**
     * Default value for undefined ones.
     * 
     * Used to set both serialized and deserialized default values and 
     * only when use default value option is true.
     * 
     * @type {DefaultValue}
     */
    defaultValue?: DefaultValue;

    /**
     * Serialized default value for undefined ones.
     * 
     * Used only when use default value option is true.
     * 
     * @type {DefaultValue}
     */
    serializedDefaultValue?: DefaultValue;

    /**
     * Deserialized default value for undefined ones.
     * 
     * Used only when use default value option is true.
     * 
     * @type {DefaultValue}
     */
    deserializedDefaultValue?: DefaultValue;

    /**
     * Discriminant.
     * 
     * @type {Discriminant}
     */
    discriminant?: Discriminant;

    /**
     * Generic arguments.
     * 
     * @type {Array<GenericArgument<any>>}
     */
    genericArguments?: Array<GenericArgument<any>>;

    /**
     * Injectable type?
     * 
     * @type {boolean}
     */
    injectable?: boolean;

    /**
     * Inject options related to this type.
     * 
     * @type {Map<InjectIndex, InjectOptions<any>>}
     */
    injectOptionsMap?: Map<InjectIndex, InjectOptions<any>>;

    /**
     * Property options related to this type. Map key is a property name.
     * 
     * @type {Map<PropertyName, PropertyOptions<any>>}
     */
    propertyOptionsMap?: Map<PropertyName, PropertyOptions<any>>;
}
