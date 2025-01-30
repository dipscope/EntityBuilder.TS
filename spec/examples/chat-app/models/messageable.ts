import { Type, Property } from '../../../../src';
import { Message } from './message';

@Type()
export abstract class Messageable
{
    @Property(Array, [() => Message]) messages!: Message[];
}
