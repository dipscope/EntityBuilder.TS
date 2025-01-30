import { Type, Property } from '../../../../src';
import { Status } from './status';


@Type()
export abstract class Statusable
{
    @Property(Array, [() => Status]) statuses!: Status[];
}
