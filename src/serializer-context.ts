import isArray from 'lodash/isArray';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import merge from 'lodash/merge';
import { CustomData } from './custom-data';
import { Discriminant } from './discriminant';
import { Discriminator } from './discriminator';
import { Factory } from './factory';
import { isCtorFunction } from './functions';
import { GenericArgument } from './generic-argument';
import { GenericMetadata } from './generic-metadata';
import { Injector } from './injector';
import { Log } from './log';
import { Metadata } from './metadata';
import { NamingConvention } from './naming-convention';
import { PropertyMetadata } from './property-metadata';
import { ReferenceCallback } from './reference-callback';
import { ReferenceHandler } from './reference-handler';
import { ReferenceKey } from './reference-key';
import { ReferenceValue } from './reference-value';
import { ReferenceValueGetter } from './reference-value-getter';
import { ReferenceValueSetter } from './reference-value-setter';
import { Serializer } from './serializer';
import { SerializerContextOptions } from './serializer-context-options';
import { TypeFn } from './type-fn';
import { TypeLike } from './type-like';
import { TypeMetadata } from './type-metadata';

/**
 * Serializer context of a certain type.
 * 
 * @type {SerializerContext<TType>}
 */
export class SerializerContext<TType> extends Metadata
{
    /**
     * Serializer context root.
     * 
     * This is a value passed to the root serializer.
     * 
     * @type {any}
     */
    public readonly $: any;

    /**
     * Reference map.
     * 
     * Used to preserve object references.
     * 
     * @type {WeakMap<ReferenceKey, ReferenceValue>}
     */
    public readonly referenceMap: WeakMap<ReferenceKey, ReferenceValue>;
 
    /**
     * Reference callback map.
     * 
     * Used to assign object references in a later time due to circular dependency.
     * 
     * @type {WeakMap<ReferenceKey, Array<ReferenceCallback>>}
     */
    public readonly referenceCallbackMap: WeakMap<ReferenceKey, Array<ReferenceCallback>>;

    /**
     * Serializer context options.
     * 
     * @type {SerializerContext<TType>}
     */
    public readonly serializerContextOptions: SerializerContextOptions<TType>;

    /**
     * Parent serializer context.
     * 
     * Present when any serializer defines child context.
     * 
     * @type {SerializerContext<any>}
     */
    public readonly parentSerializerContext?: SerializerContext<any>;

    /**
     * Constructor.
     * 
     * @param {any} $ Serializer context root.
     * @param {WeakMap<ReferenceKey, ReferenceValue>} referenceMap Reference map.
     * @param {WeakMap<ReferenceKey, Array<ReferenceCallback>>} referenceCallbackMap Reference callback map.
     * @param {SerializerContextOptions<TType>} serializerContextOptions Serializer context options.
     * @param {SerializerContext<any>} parentSerializerContext Parent serializer context.
     */
    public constructor(
        $: any,
        referenceMap: WeakMap<ReferenceKey, ReferenceValue>,
        referenceCallbackMap: WeakMap<ReferenceKey, Array<ReferenceCallback>>,
        serializerContextOptions: SerializerContextOptions<TType>, 
        parentSerializerContext?: SerializerContext<any>
    )
    {
        super(serializerContextOptions.typeMetadata.typeMetadataResolver);

        this.$ = $;
        this.referenceMap = referenceMap,
        this.referenceCallbackMap = referenceCallbackMap;
        this.serializerContextOptions = serializerContextOptions;
        this.parentSerializerContext = parentSerializerContext;

        return;
    }

    /**
     * Gets json path key.
     * 
     * @returns {string|number} Json path key.
     */
    public get jsonPathKey(): any
    {
        return this.serializerContextOptions.jsonPathKey;
    }

    /**
     * Gets reference value setter.
     * 
     * @returns {ReferenceValueSetter|undefined} Reference value setter or undefined if not present.
     */
    public get referenceValueSetter(): ReferenceValueSetter | undefined
    {
        return this.serializerContextOptions.referenceValueSetter;
    }

    /**
     * Gets custom data.
     * 
     * @returns {CustomData} Custom data.
     */
    public get customData(): CustomData
    {
        const customData = {};
        const typeCustomData = this.typeMetadata.customData;
        const propertyCustomData = this.propertyMetadata?.customData;

        if (!isNil(typeCustomData))
        {
            merge(customData, typeCustomData);
        }

        if (!isNil(propertyCustomData))
        {
            merge(customData, propertyCustomData);
        }

        return customData;
    }

    /**
     * Gets serialized null value.
     * 
     * @returns {any|undefined} Resolved serialized null value or undefined.
     */
    public get serializedNullValue(): any | undefined
    {
        if (this.preserveNull)
        {
            return null;
        }

        return this.serializedDefaultValue;
    }

    /**
     * Gets serialized default value.
     * 
     * @returns {any|undefined} Resolved serialized default value or undefined.
     */
    public get serializedDefaultValue(): any | undefined
    {
        if (this.useDefaultValue)
        {
            return this.propertyMetadata?.serializedDefaultValue ?? this.typeMetadata.serializedDefaultValue;
        }

        return undefined;
    }
    
    /**
     * Gets deserialized null value.
     * 
     * @returns {any|undefined} Resolved deserialized null value or undefined.
     */
    public get deserializedNullValue(): any | undefined
    {
        if (this.preserveNull)
        {
            return null;
        }

        return this.deserializedDefaultValue;
    }

    /**
     * Gets deserialized default value.
     * 
     * @returns {any|undefined} Resolved deserialized default value or undefined.
     */
    public get deserializedDefaultValue(): any | undefined
    {
        if (this.useDefaultValue)
        {
            return this.propertyMetadata?.deserializedDefaultValue ?? this.typeMetadata.deserializedDefaultValue;
        }
        
        return undefined;
    }

    /**
     * Gets json path from serializer context root.
     * 
     * @returns {string} Json path.
     */
    public get jsonPath(): string
    {
        const jsonPathKey = this.jsonPathKey;
        const parentSerializerContext = this.parentSerializerContext;

        if (isNil(parentSerializerContext))
        {
            return jsonPathKey;
        }

        if (isNumber(jsonPathKey))
        {
            return `${parentSerializerContext.jsonPath}[${jsonPathKey}]`;
        }

        return `${parentSerializerContext.jsonPath}['${jsonPathKey}']`;
    }

    /**
     * Gets discriminant.
     * 
     * @returns {Discriminant} Discriminant.
     */
    public get discriminant(): Discriminant
    {
        return this.typeMetadata.discriminant;
    }

    /**
     * Gets discriminant map.
     * 
     * @returns {Map<TypeFn<any>, Discriminant>} Discriminant map.
     */
    public get discriminantMap(): Map<TypeFn<any>, Discriminant>
    {
        return this.typeMetadata.discriminantMap;
    }

    /**
     * Gets discriminator.
     * 
     * @returns {Discriminator} Discriminator.
     */
    public get discriminator(): Discriminator
    {
        return this.typeMetadata.discriminator;
    }

    /**
     * Gets factory.
     * 
     * @returns {Factory} Factory.
     */
    public get factory(): Factory
    {
        return this.typeMetadata.factory;
    }

    /**
     * Gets generic arguments.
     * 
     * @returns {Array<GenericArgument<any>>|undefined} Generic arguments or undefined.
     */
    public get genericArguments(): Array<GenericArgument<any>> | undefined
    {
        return this.serializerContextOptions.genericArguments ?? this.propertyMetadata?.genericArguments ?? this.typeMetadata.genericArguments;
    }

    /**
     * Gets generic metadatas.
     * 
     * @returns {Array<GenericMetadata<any>>|undefined} Generic metadatas.
     */
    public get genericMetadatas(): Array<GenericMetadata<any>> | undefined
    {
        const genericArguments = this.genericArguments;

        if (isNil(genericArguments))
        {
            return undefined;
        }

        return this.defineGenericMetadatas(genericArguments);
    }

    /**
     * Gets injector.
     * 
     * @returns {Injector} Injector
     */
    public get injector(): Injector
    {
        return this.typeMetadata.injector;
    }

    /**
     * Gets log.
     * 
     * @returns {Log} Log instance.
     */
    public get log(): Log
    {
        return this.typeMetadata.log;
    }

    /**
     * Gets context name.
     * 
     * @returns {string} Context name.
     */
    public get name(): string
    {
        if (isNil(this.propertyMetadata))
        {
            return this.typeMetadata.typeName;
        }

        return `${this.propertyMetadata.declaringTypeMetadata.typeName}.${this.propertyMetadata.propertyName}`;
    }

    /**
     * Gets naming convention.
     * 
     * @returns {NamingConvention|undefined} Naming convention or undefined.
     */
    public get namingConvention(): NamingConvention | undefined
    {
        return this.propertyMetadata?.namingConvention ?? this.typeMetadata.namingConvention;
    }

    /**
     * Gets indicator if context is polymorphic.
     * 
     * @returns {boolean} True when context is polymorphic. False otherwise.
     */
    public get polymorphic(): boolean
    {
        return this.typeMetadata.polymorphic;
    }

    /**
     * Gets property metadata.
     * 
     * @returns {PropertyMetadata<any, TType>|undefined} Property metadata or undefined.
     */
    public get propertyMetadata(): PropertyMetadata<any, TType> | undefined
    {
        return this.serializerContextOptions.propertyMetadata;
    }

    /**
     * Gets indicator if discriminator should be preserved.
     * 
     * @returns {boolean} True when discriminator should be preserved. False otherwise.
     */
    public get preserveDiscriminator(): boolean 
    {
        return this.typeMetadata.preserveDiscriminator;
    }

    /**
     * Gets reference handler.
     * 
     * @returns {ReferenceHandler} Reference handler.
     */
    public get referenceHandler(): ReferenceHandler
    {
        return this.propertyMetadata?.referenceHandler ?? this.typeMetadata.referenceHandler;
    }

    /**
     * Gets serializer.
     * 
     * @returns {Serializer<TType>} Serializer.
     */
    public get serializer(): Serializer<TType>
    {
        return this.propertyMetadata?.serializer ?? this.typeMetadata.serializer;
    }

    /**
     * Gets type metadata.
     * 
     * @returns {TypeMetadata<TType>} Type metadata.
     */
    public get typeMetadata(): TypeMetadata<TType>
    {
        return this.serializerContextOptions.typeMetadata;
    }

    /**
     * Gets indicator if null value should be preserved.
     * 
     * @returns {boolean} True when null value should be preserved. False otherwise.
     */
    public get preserveNull(): boolean
    {
        return this.propertyMetadata?.preserveNull ?? this.typeMetadata.preserveNull;
    }

    /**
     * Gets indicator if default value should be used.
     * 
     * @returns {boolean} True when type should use default value. False otherwise.
     */
    public get useDefaultValue(): boolean
    {
        return this.propertyMetadata?.useDefaultValue ?? this.typeMetadata.useDefaultValue;
    }

    /**
     * Gets indicator if implicit conversion should be used.
     * 
     * @returns {boolean} True when type should use implicit conversion. False otherwise.
     */
    public get useImplicitConversion(): boolean
    {
        return this.propertyMetadata?.useImplicitConversion ?? this.typeMetadata.useImplicitConversion;
    }

    /**
     * Serializes provided value using context.
     * 
     * @param {TypeLike<TType>} x Some value.
     * 
     * @returns {TypeLike<any>} Value serialized by context.
     */
    public serialize(x: TypeLike<TType>): TypeLike<any>
    {
        return this.serializer.serialize(x, this);
    }

    /**
     * Deserializes provided value using context.
     * 
     * @param {TypeLike<any>} x Some value.
     * 
     * @returns {TypeLike<TType>} Value deserialized by context.
     */
    public deserialize(x: TypeLike<any>): TypeLike<TType>
    {
        return this.serializer.deserialize(x, this);
    }

    /**
     * Defines reference. 
     * 
     * May be called during serialization to define reference.
     * 
     * @param {ReferenceKey} referenceKey Reference key.
     * @param {ReferenceValueGetter} referenceValueGetter Reference value getter.
     * 
     * @returns {ReferenceValue} Reference value.
     */
    public defineReference(referenceKey: ReferenceKey, referenceValueGetter: ReferenceValueGetter): ReferenceValue
    {
        return this.referenceHandler.define(this, referenceKey, referenceValueGetter);
    }

    /**
     * Restores reference.
     * 
     * May be called during deserialization to restore reference.
     * 
     * @param {ReferenceKey} referenceKey Reference key.
     * @param {ReferenceValueGetter} referenceValueGetter Reference value getter.
     * 
     * @returns {ReferenceValue} Reference value.
     */
    public restoreReference(referenceKey: ReferenceKey, referenceValueGetter: ReferenceValueGetter): ReferenceValue
    {
        return this.referenceHandler.restore(this, referenceKey, referenceValueGetter);
    }

    /**
     * Registers callback for provided reference key.
     * 
     * May be called by reference handlers to register a callback resolver for a circular reference.
     * 
     * @param {ReferenceKey} referenceKey Reference key.
     * 
     * @returns {void}
     */
    public registerReferenceCallback(referenceKey: ReferenceKey): void
    {
        const referenceValueSetter = this.referenceValueSetter;

        if (isNil(referenceValueSetter))
        {
            return;
        }

        this.pushReferenceCallback(referenceKey, () =>
        {
            const referenceValue = this.referenceMap.get(referenceKey);

            referenceValueSetter(referenceValue);
        });

        return;
    }

    /**
     * Pushes callback for provided reference key.
     * 
     * Called by reference handlers during handling of circular references.
     * 
     * @param {ReferenceKey} referenceKey Reference key.
     * @param {ReferenceCallback} referenceCallback Reference callback.
     * 
     * @returns {void}
     */
    public pushReferenceCallback(referenceKey: ReferenceKey, referenceCallback: ReferenceCallback): void
    {
        let referenceCallbacks = this.referenceCallbackMap.get(referenceKey);

        if (isNil(referenceCallbacks))
        {
            referenceCallbacks = [];

            this.referenceCallbackMap.set(referenceKey, referenceCallbacks);
        }

        referenceCallbacks.push(referenceCallback);

        return;
    }

    /**
     * Resolves callbacks for provided reference key.
     * 
     * May be called by reference handlers when circular references can be resolved.
     * 
     * @param {ReferenceKey} referenceKey Reference key.
     * 
     * @returns {void}
     */
    public resolveReferenceCallbacks(referenceKey: ReferenceKey): void
    {
        const referenceCallbacks = this.referenceCallbackMap.get(referenceKey);

        if (isNil(referenceCallbacks))
        {
            return;
        }

        for (const referenceCallback of referenceCallbacks)
        {
            referenceCallback();
        }

        return;
    }

    /**
     * Defines child serializer context.
     * 
     * Called by serializers on drill down.
     * 
     * @param {SerializerContextOptions<any>} serializerContextOptions Child serializer context options.
     * 
     * @returns {SerializerContext<any>} Child serializer context.
     */
    public defineChildSerializerContext(serializerContextOptions: SerializerContextOptions<any>): SerializerContext<any>
    {
        return new SerializerContext(this.$, this.referenceMap, this.referenceCallbackMap, serializerContextOptions, this);
    }

    /**
     * Defines generic serializer context.
     * 
     * Called by serializers which work with generics.
     * 
     * @param {number} genericIndex Generic index.
     * 
     * @returns {SerializerContext<any>} Generic serializer context.
     */
    public defineGenericSerializerContext(genericIndex: number): SerializerContext<any>
    {
        const genericArguments = this.genericArguments;

        if (isNil(genericArguments))
        {
            throw new Error(`${this.jsonPath}: cannot define generic arguments. This is usually caused by invalid configuration.`);
        }

        const genericArgument = genericArguments[genericIndex];

        if (isNil(genericArgument))
        {
            throw new Error(`${this.jsonPath}: cannot define generic argument for index ${genericIndex}. This is usually caused by invalid configuration.`);
        }

        const genericTypeArgument = isArray(genericArgument) ? genericArgument[0] : genericArgument;
        const genericGenericArguments = isArray(genericArgument) ? genericArgument[1] : undefined;
        const typeMetadata = this.defineTypeMetadata(genericTypeArgument);
        const serializerContextOptions = Object.assign({}, this.serializerContextOptions);

        serializerContextOptions.typeMetadata = typeMetadata;
        serializerContextOptions.genericArguments = genericGenericArguments;
        serializerContextOptions.propertyMetadata = undefined;

        return new SerializerContext(this.$, this.referenceMap, this.referenceCallbackMap, serializerContextOptions, this.parentSerializerContext);
    }

    /**
     * Defines polymorphic serializer context.
     * 
     * Called by serializers which work with polymorphic types.
     * 
     * @param {TypeFn<any>|Record<string, any>} x Type function or record.
     * 
     * @returns {SerializerContext<any>} Polymorphic serializer context.
     */
    public definePolymorphicSerializerContext(x: TypeFn<any> | Record<string, any>): SerializerContext<any>
    {
        return isCtorFunction(x) ? this.definePolymorphicSerializerContextByTypeFn(x) : this.definePolymorphicSerializerContextByDiscriminant(x);
    }

    /**
     * Defines polymorphic serializer context by type function.
     * 
     * @param {TypeFn<any>} typeFn Type function.
     * 
     * @returns {SerializerContext<any>} Polymorphic serializer context.
     */
    private definePolymorphicSerializerContextByTypeFn(typeFn: TypeFn<any>): SerializerContext<any>
    {
        const discriminant = this.discriminantMap.get(typeFn);

        if (isNil(discriminant))
        {
            throw new Error(`${this.jsonPath}: cannot define discriminant of polymorphic type. This is usually caused by invalid configuration.`);
        }

        const typeMetadata = this.defineTypeMetadata(typeFn);
        const serializerContextOptions = Object.assign({}, this.serializerContextOptions);

        serializerContextOptions.typeMetadata = typeMetadata;

        return new SerializerContext(this.$, this.referenceMap, this.referenceCallbackMap, serializerContextOptions, this.parentSerializerContext);
    }

    /**
     * Defines polymorphic serializer context by discriminant.
     * 
     * @param {Record<string, any>} record Some record.
     * 
     * @returns {SerializerContext<any>} Polymorphic serializer context.
     */
    private definePolymorphicSerializerContextByDiscriminant(record: Record<string, any>): SerializerContext<any>
    {
        for (const [typeCtor, discriminant] of this.discriminantMap)
        {
            const typeMetadata = this.defineTypeMetadata(typeCtor);

            if (record[typeMetadata.discriminator] === discriminant)
            {
                const serializerContextOptions = Object.assign({}, this.serializerContextOptions);

                serializerContextOptions.typeMetadata = typeMetadata;

                return new SerializerContext(this.$, this.referenceMap, this.referenceCallbackMap, serializerContextOptions, this.parentSerializerContext);
            }
        }
        
        throw new Error(`${this.jsonPath}: cannot define discriminant of polymorphic type. This is usually caused by invalid configuration.`);
    }
}
