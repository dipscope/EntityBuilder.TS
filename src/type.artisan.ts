import { Fn } from './utils';
import { StringSerializer, NumberSerializer, BooleanSerializer, DateSerializer, ObjectSerializer } from './serializers';
import { TypeCtor } from './type.ctor';
import { TypeDeclaration } from './type.declaration';
import { TypeMetadata } from './type.metadata';
import { TypeOptions } from './type.options';
import { TypeSerializer } from './type.serializer';

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
    public static readonly typeMetadataKey: string = '__TBTypeMetadata__';
    
    /**
     * Type options map for explicitly defined types.
     * 
     * @type {Map<TypeCtor, TypeOptions>}
     */
    public static readonly typeOptionsMap: Map<TypeCtor, TypeOptions> = new Map<TypeCtor, TypeOptions>([
        [String,  { alias: 'String',  typeSerializer: new StringSerializer(),  defaultValue: null       }],
        [Number,  { alias: 'Number',  typeSerializer: new NumberSerializer(),  defaultValue: 0          }],
        [Boolean, { alias: 'Boolean', typeSerializer: new BooleanSerializer(), defaultValue: false      }],
        [Date,    { alias: 'Date',    typeSerializer: new DateSerializer(),    defaultValue: new Date() }]
    ]);

    /**
     * Type constructor map for types with aliases.
     * 
     * @type {Map<string, TypeCtor>}
     */
    public static readonly typeCtorMap: Map<string, TypeCtor> = new Map<string, TypeCtor>();
    
    /**
     * Creates type serializer for provided type constructor.
     * 
     * @param {TypeCtor} typeCtor Type constructor function.
     * 
     * @returns {TypeSerializer<any, any>} Type serializer.
     */
    public static createTypeSerializer(typeCtor: TypeCtor): TypeSerializer<any, any>
    {
        const typeOptions = this.typeOptionsMap.get(typeCtor);

        if (!Fn.isNil(typeOptions) && !Fn.isNil(typeOptions.typeSerializer))
        {
            return typeOptions.typeSerializer;
        }

        return new ObjectSerializer(typeCtor, this.extractTypeMetadata.bind(this));
    }

    /**
     * Injects type metadata into the type proptotype.
     * 
     * @param {TypeCtor} typeCtor Type constructor function.
     * @param {TypeOptions} typeOptions Type options.
     * @param {TypeDeclaration} typeDeclaration Type declaration.
     * 
     * @returns {TypeMetadata} Type metadata for provided type constructor.
     */
    public static injectTypeMetadata(typeCtor: TypeCtor, typeOptions: TypeOptions, typeDeclaration: TypeDeclaration): TypeMetadata
    {
        const prototype        = typeCtor.prototype;
        const metadataKey      = this.typeMetadataKey;
        const metadataInjected = prototype.hasOwnProperty(metadataKey);
        const typeMetadata     = metadataInjected ? prototype[metadataKey] as TypeMetadata : new TypeMetadata(typeCtor, typeDeclaration, this.createTypeSerializer(typeCtor));

        if (!metadataInjected)
        {
            const typeMetadataParent = prototype[metadataKey] as TypeMetadata;

            if (typeMetadataParent)
            {
                typeMetadataParent.propertyMetadataMap.forEach((propertyMetadata, propertyName) =>
                {
                    typeMetadata.propertyMetadataMap.set(propertyName, propertyMetadata);
                });
            }
    
            Object.defineProperty(prototype, metadataKey, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: typeMetadata
            });
        }
        
        if (!typeMetadata.declaredExplicitly)
        {
            typeMetadata.typeDeclaration = typeDeclaration;
        }

        if (!Fn.isNil(typeOptions.alias)) 
        {
            this.typeCtorMap.set(typeOptions.alias, typeMetadata.typeCtor);
        }

        return typeMetadata.configure(typeOptions);
    }

    /**
     * Injects type metadata implicitly based on current configuration.
     * 
     * @param {TypeCtor} typeCtor Type constructor function. 
     * 
     * @returns {TypeMetadata} Type metadata for provided type constructor.
     */
    public static declareTypeMetadata(typeCtor: TypeCtor): TypeMetadata
    {
        const typeOptions     = this.typeOptionsMap.get(typeCtor);
        const typeDeclaration = typeOptions ? TypeDeclaration.Explicit : TypeDeclaration.Implicit;
        const typeMetadata    = this.injectTypeMetadata(typeCtor, typeOptions ?? {}, typeDeclaration);

        return typeMetadata;
    }

    /**
     * Extracts type metadata from provided type constructor.
     * 
     * @param {TypeCtor} typeCtor Type constructor function.
     * 
     * @returns {TypeMetadata} Type metadata for provided type constructor.
     */
    public static extractTypeMetadata(typeCtor: TypeCtor): TypeMetadata
    {
        const prototype        = typeCtor.prototype;
        const metadataKey      = this.typeMetadataKey;
        const metadataInjected = prototype.hasOwnProperty(metadataKey);
        const typeMetadata     = metadataInjected ? prototype[metadataKey] as TypeMetadata : this.declareTypeMetadata(typeCtor);

        return typeMetadata;
    }
}
