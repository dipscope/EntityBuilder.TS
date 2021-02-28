import { TypeArgument } from './core';
import { Alias } from './core/alias';
import { Fn } from './core/fn';
import { Log } from './core/log';
import { LogLevel } from './core/log-level';
import { TypeCtor } from './core/type-ctor';
import { TypeMetadata } from './core/type-metadata';
import { TypeOptions } from './core/type-options';
import { TypeOptionsBase } from './core/type-options-base';
import { ObjectFactory } from './factories/object.factory';
import { SingletonInjector } from './injectors/singleton.injector';
import { BooleanSerializer } from './serializers/boolean.serializer';
import { DateSerializer } from './serializers/date.serializer';
import { NumberSerializer } from './serializers/number.serializer';
import { ObjectSerializer } from './serializers/object.serializer';
import { StringSerializer } from './serializers/string.serializer';

/**
 * Type artisan class to encapsulate type manipulating functions.
 * 
 * @type {TypeArtisan}
 */
export class TypeArtisan
{
    /**
     * Type metadata key which is used to store data in prototypes.
     * 
     * @type {string}
     */
    public static readonly typeMetadataKey: string = '__TMTypeMetadata__';
    
    /**
     * Global options of any type.
     * 
     * @type {TypeOptionsBase<any>}
     */
    public static readonly typeOptionsBase: TypeOptionsBase<any> = {
        customData:            {},
        defaultValue:          undefined,
        factory:               new ObjectFactory(),
        injector:              new SingletonInjector(),
        log:                   new Log(LogLevel.Error),
        serializer:            new ObjectSerializer(),
        useDefaultValue:       false,
        useImplicitConversion: false
    };

    /**
     * Type options per type. 
     * 
     * Overrides global type options.
     * 
     * @type {Map<TypeCtor<any>, TypeOptions<any>>}
     */
    public static readonly typeOptionsMap: Map<TypeCtor<any>, TypeOptions<any>> = new Map<TypeCtor<any>, TypeOptions<any>>([
        [String,  { serializer: new StringSerializer(),  defaultValue: null             }],
        [Number,  { serializer: new NumberSerializer(),  defaultValue: 0                }],
        [Boolean, { serializer: new BooleanSerializer(), defaultValue: false            }],
        [Date,    { serializer: new DateSerializer(),    defaultValue: () => new Date() }]
    ]);

    /**
     * Type constructor map for types with aliases.
     * 
     * @type {Map<Alias, TypeCtor<any>>}
     */
    public static readonly typeCtorMap: Map<Alias, TypeCtor<any>> = new Map<Alias, TypeCtor<any>>();
    
    /**
     * Configures global type options.
     * 
     * @param {Partial<TypeOptionsBase<TType>>} typeOptionsBase Type options base.
     * 
     * @returns {void}
     */
    public static configureTypeOptionsBase<TType>(typeOptionsBase: Partial<TypeOptionsBase<TType>>): void
    {
        Fn.assign(this.typeOptionsBase, typeOptionsBase);

        return;
    }

    /**
     * Configures type options.
     * 
     * @param {TypeCtor<TType>} typeCtor Type constructor function.
     * @param {TypeOptions<TType>} typeOptions Type options.
     * 
     * @returns {void}
     */
    public static configureTypeOptions<TType>(typeCtor: TypeCtor<TType>, typeOptions: TypeOptions<TType>): void
    {
        let definedTypeOptions = this.typeOptionsMap.get(typeCtor);

        if (Fn.isNil(definedTypeOptions))
        {
            definedTypeOptions = {};

            this.typeOptionsMap.set(typeCtor, definedTypeOptions);
        }

        Fn.assign(definedTypeOptions, typeOptions);

        this.defineTypeMetadata(typeCtor, typeOptions);

        return;
    }

    /**
     * Configures type options per type.
     * 
     * @param {Map<TypeCtor<TType>, TypeOptions<TType>>} typeOptionsMap Type options map.
     * 
     * @returns {void}
     */
    public static configureTypeOptionsMap<TType>(typeOptionsMap: Map<TypeCtor<TType>, TypeOptions<TType>>): void
    {
        typeOptionsMap.forEach((typeOptions, typeCtor) => 
        {
            this.configureTypeOptions(typeCtor, typeOptions);
        });

        return;
    }

    /**
     * Declares type metadata for provided type constructor based on general configuration.
     * 
     * @param {TypeCtor<TType>} typeCtor Type constructor function.
     * 
     * @returns {TypeMetadata<TType>} Type metadata.
     */
    public static declareTypeMetadata<TType>(typeCtor: TypeCtor<TType>): TypeMetadata<TType>
    {
        const typeOptionsBase      = this.typeOptionsBase;
        const typeOptions          = this.typeOptionsMap.get(typeCtor);
        const typeMetadataResolver = this.resolveTypeMetadata.bind(this);
        const typeMetadata         = new TypeMetadata(typeMetadataResolver, typeCtor, typeOptionsBase, typeOptions ?? {});

        if (!Fn.isNil(typeMetadata.alias))
        {
            this.typeCtorMap.set(typeMetadata.alias, typeMetadata.typeCtor);
        }

        return typeMetadata;
    }

    /**
     * Defines type metadata for the type prototype.
     * 
     * @param {TypeCtor<TType>} typeCtor Type constructor function.
     * @param {TypeOptions<TType>} typeOptions Type options.
     * 
     * @returns {TypeMetadata<TType>} Type metadata for provided type constructor.
     */
    public static defineTypeMetadata<TType>(typeCtor: TypeCtor<TType>, typeOptions: TypeOptions<TType> = {}): TypeMetadata<TType>
    {
        const prototype       = typeCtor.prototype;
        const metadataKey     = this.typeMetadataKey;
        const metadataDefined = prototype.hasOwnProperty(metadataKey);
        const typeMetadata    = metadataDefined ? prototype[metadataKey] as TypeMetadata<TType> : this.declareTypeMetadata(typeCtor);

        if (!metadataDefined)
        {
            const typeMetadataParent = prototype[metadataKey] as TypeMetadata<any>;

            if (typeMetadataParent)
            {
                for (const propertyMetadata of typeMetadataParent.propertyMetadataMap.values())
                {
                    typeMetadata.propertyMetadataMap.set(propertyMetadata.name, propertyMetadata);
                }
            }
    
            Object.defineProperty(prototype, metadataKey, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: typeMetadata
            });
        }
        
        if (!Fn.isNil(typeOptions.alias))
        {
            this.typeCtorMap.set(typeOptions.alias, typeMetadata.typeCtor);
        }

        return typeMetadata.configure(typeOptions);
    }

    /**
     * Extracts type metadata from provided type constructor.
     * 
     * @param {TypeCtor<TType>} typeCtor Type constructor function.
     * 
     * @returns {TypeMetadata<TType>} Type metadata for provided type constructor.
     */
    public static extractTypeMetadata<TType>(typeCtor: TypeCtor<TType>): TypeMetadata<TType>
    {
        const prototype       = typeCtor.prototype;
        const metadataKey     = this.typeMetadataKey;
        const metadataDefined = prototype.hasOwnProperty(metadataKey);
        const typeMetadata    = metadataDefined ? prototype[metadataKey] as TypeMetadata<TType> : this.defineTypeMetadata(typeCtor);

        return typeMetadata;
    }

    /**
     * Resolves type metadata by provided type argument.
     * 
     * @type {TypeMetadata<any>} Type metadata for provided type argument.
     */
    public static resolveTypeMetadata<TType>(typeArgument: TypeArgument<TType>): TypeMetadata<TType>
    {
        const typeCtor = Fn.isString(typeArgument) ? this.typeCtorMap.get(typeArgument) : (Fn.isCtor(typeArgument) ? typeArgument : typeArgument());

        if (Fn.isNil(typeCtor))
        {
            throw new Error(`Cannot resolve type metadata for provided type argument: ${JSON.stringify(typeArgument)}! Looks like your configuration is invalid!`);
        }

        return this.extractTypeMetadata(typeCtor);
    }
}
