import { Type, Property } from '../../../../src';
import { Messageable } from './messageable'

@Type({ parentTypeArguments: [() => Messageable]})
export class Message extends Messageable
{
    @Property(() => Messageable) public sender: Messageable;
    @Property(() => Messageable) public reciever: Messageable;
    @Property(String) public content: string;

    public constructor(content: string, sender: Messageable, reciever: Messageable)
    {
        super();
        this.content = content;
        this.sender = sender;
        this.reciever = reciever;

        return;
    }
}
