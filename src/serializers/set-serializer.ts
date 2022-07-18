import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import isSet from 'lodash/isSet';
import isUndefined from 'lodash/isUndefined';
import { Serializer } from '../serializer';
import { SerializerContext } from '../serializer-context';
import { TypeLike } from '../type-like';

/**
 * Set serializer.
 * 
 * @type {SetSerializer}
 */
export class SetSerializer implements Serializer<Set<any>>
{
    /**
     * Serializes provided value.
     * 
     * @param {TypeLike<Set<any>>} x Some value.
     * @param {SerializerContext<Set<any>>} serializerContext Serializer context.
     * 
     * @returns {TypeLike<any>} Serialized value or undefined.
     */
    public serialize(x: TypeLike<Set<any>>, serializerContext: SerializerContext<Set<any>>): TypeLike<any>
    {
        if (isUndefined(x))
        {
            return serializerContext.serializedDefaultValue;
        }

        if (isNull(x))
        {
            return serializerContext.serializedNullValue;
        }

        if (isSet(x))
        {
            return serializerContext.defineReference(x, () =>
            {
                const set = x;
                const array = new Array<any>();
                const genericSerializerContext = serializerContext.defineGenericSerializerContext(0);

                let i = -1;
                
                for (const v of set)
                {
                    i++;

                    const valueSerializerContext = genericSerializerContext.defineChildSerializerContext({
                        jsonPathKey: i,
                        typeMetadata: genericSerializerContext.typeMetadata,
                        referenceValueSetter: v => array[i] = v
                    });

                    array[i] = valueSerializerContext.serialize(v);
                }

                return array;
            });
        }

        if (serializerContext.log.errorEnabled) 
        {
            serializerContext.log.error(`${serializerContext.jsonPath}: cannot serialize value as set.`, x);
        }

        return undefined;
    }

    /**
     * Deserializes provided value.
     * 
     * @param {TypeLike<any>} x Some value.
     * @param {SerializerContext<Set<any>>} serializerContext Serializer context.
     * 
     * @returns {TypeLike<Set<any>>} Deserialized value.
     */
    public deserialize(x: TypeLike<any>, serializerContext: SerializerContext<Set<any>>): TypeLike<Set<any>>
    {
        if (isUndefined(x))
        {
            return serializerContext.deserializedDefaultValue;
        }

        if (isNull(x))
        {
            return serializerContext.deserializedNullValue;
        }

        if (isArray(x))
        {
            return serializerContext.restoreReference(x, () =>
            {
                const array = x;
                const set = new Set<any>();
                const genericSerializerContext = serializerContext.defineGenericSerializerContext(0);

                for (let i = 0; i < array.length; i++)
                {
                    const valueSerializerContext = genericSerializerContext.defineChildSerializerContext({
                        jsonPathKey: i,
                        typeMetadata: genericSerializerContext.typeMetadata,
                        referenceValueSetter: v => set.add(v)
                    });

                    set.add(valueSerializerContext.deserialize(array[i]));
                }

                return set;
            });
        }

        if (serializerContext.log.errorEnabled) 
        {
            serializerContext.log.error(`${serializerContext.jsonPath}: cannot deserialize value as set.`, x);
        }

        return undefined;
    }
}
