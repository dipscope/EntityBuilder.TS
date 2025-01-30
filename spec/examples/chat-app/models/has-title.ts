import { Type, Property } from '../../../../src';


@Type()
export abstract class HasTitle
{
    @Property(String) title!: string;
}
