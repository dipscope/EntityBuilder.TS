import isNil from 'lodash-es/isNil';

import { ReferenceHandler } from '../reference-handler';
import { ReferenceKey } from '../reference-key';
import { ReferenceValue } from '../reference-value';
import { ReferenceValueInitializer } from '../reference-value-initializer';
import { ReferenceValueResolver } from '../reference-value-resolver';
import { SerializerContext } from '../serializer-context';

/**
 * Direct reference handler which preserves references as is.
 * 
 * @type {DirectReferenceHandler}
 */
export class DirectReferenceHandler implements ReferenceHandler
{
    /**
     * Defines reference. Called during serialization.
     * 
     * @param {SerializerContext<any>} serializerContext Serializer context.
     * @param {ReferenceKey} referenceKey Reference which acts as a key. This is basically a serializing object.
     * @param {ReferenceValueInitializer} referenceValueInitializer Function to initialize a reference value when one is not yet present for a key.
     * 
     * @returns {ReferenceValue|ReferenceValueResolver} Resolved reference value or reference resolver when circular dependency is detected.
     */
    public define(serializerContext: SerializerContext<any>, referenceKey: ReferenceKey, referenceValueInitializer: ReferenceValueInitializer): ReferenceValue | ReferenceValueResolver
    {
        const referenceMap = serializerContext.referenceMap;
        const referenceValue = referenceMap.get(referenceKey);

        if (isNil(referenceValue))
        {
            referenceMap.set(referenceKey, referenceKey);

            const value = referenceValueInitializer();

            referenceMap.set(referenceKey, value);

            serializerContext.resolveReferenceCallbacks(referenceKey);

            return value;
        }

        if (referenceValue === referenceKey)
        {
            return () => referenceMap.get(referenceKey);
        }

        return referenceValue;
    }

    /**
     * Restores reference. Called during deserialization.
     * 
     * @param {SerializerContext<any>} serializerContext Serializer context.
     * @param {ReferenceKey} referenceKey Reference which acts as a key. This is basically a deserializing object.
     * @param {ReferenceValueInitializer} referenceValueInitializer Function to initialize a reference value when one is not yet present for a key.
     * 
     * @returns {ReferenceValue|ReferenceValueResolver} Resolved reference value or reference resolver when circular dependency is detected.
     */
    public restore(serializerContext: SerializerContext<any>, referenceKey: ReferenceKey, referenceValueInitializer: ReferenceValueInitializer): ReferenceValue | ReferenceValueResolver
    {
        const referenceMap = serializerContext.referenceMap;
        const referenceValue = referenceMap.get(referenceKey);

        if (isNil(referenceValue))
        {
            referenceMap.set(referenceKey, referenceKey);

            const value = referenceValueInitializer();

            referenceMap.set(referenceKey, value);

            serializerContext.resolveReferenceCallbacks(referenceKey);

            return value;
        }

        if (referenceValue === referenceKey)
        {
            return () => referenceMap.get(referenceKey);
        }

        return referenceValue;
    }
}
