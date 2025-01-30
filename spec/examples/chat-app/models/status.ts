import { Type, Property } from '../../../../src';


@Type()
export class Status
{
    @Property(String) status: string;

    public constructor(status: string)
    {
        this.status = status;

        return;
    }
}
