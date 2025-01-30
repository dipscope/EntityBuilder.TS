import { Type, Property } from '../../../../src';
import { Chat } from './chat';
import { HasTitle } from './has-title';
import { Message } from './message';
import { Messageable } from './messageable';
import { Statusable } from './statusable';


@Type({
    discriminant: 'User',
    parentTypeArguments: [() => Messageable, () => HasTitle]
})
export class User extends Statusable implements Messageable, HasTitle
{
    @Property(String) title: string;
    @Property(Array, [() => Message]) messages!: Message[];
    @Property(Array, [() => Chat]) chats!: Chat[];

    public constructor(title: string)
    {
        super();

        this.title = title;

        return;
    }
}
