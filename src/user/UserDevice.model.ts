import {Field, Model, ObjectType} from 'couchset';

export const userDeviceModelName = 'UserDevice';
/**
 * GraphQL Types start
 */

@ObjectType('UserDeviceType')
export class UserDeviceType {
    @Field(() => String, {nullable: true})
    id?: string = '';

    @Field(() => String, {nullable: true})
    unique?: string = '';

    // User who created this device
    @Field(() => String, {nullable: true})
    owner?: string = '';

    @Field(() => String, {nullable: true})
    countryCode?: string = '';

    @Field(() => String, {nullable: true})
    pushtoken?: string = '';

    @Field(() => String, {nullable: true})
    appversion = '';

    @Field(() => String, {nullable: true})
    imei = '';

    @Field(() => String, {nullable: true})
    osid = '';

    @Field(() => String, {nullable: true})
    osName?: string = '';

    // android, ios, web
    @Field(() => String, {nullable: true})
    clientType?: string = '';

    @Field(() => Date, {nullable: true})
    createdAt?: Date = new Date();

    @Field(() => Date, {nullable: true})
    updatedAt?: Date = new Date();
}

export const allUserDeviceModelKeys: string[] = Object.getOwnPropertyNames(new UserDeviceType());

export const UserDeviceModel: Model = new Model(userDeviceModelName);

export default UserDeviceModel;
