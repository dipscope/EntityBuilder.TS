import { LogLevel } from './utils';
import { TypeCtor } from './type.ctor';
import { TypeOptions } from './type.options';

/**
 * Type manager options.
 * 
 * @type {TypeManagerOptions}
 */
export interface TypeManagerOptions
{
    /**
     * Log level.
     * 
     * @type {LogLevel}
     */
    logLevel?: LogLevel;

    /**
     * Global type options shared among all types.
     * 
     * @type {TypeOptions}
     */
    typeOptions?: TypeOptions;

    /**
     * Type options per type. 
     * 
     * Overrides global type options.
     * 
     * @type {Map<TypeCtor, TypeOptions>}
     */
    typeOptionsMap?: Map<TypeCtor, TypeOptions>;
}