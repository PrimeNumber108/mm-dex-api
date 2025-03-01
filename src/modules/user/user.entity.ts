import { BaseEntity } from 'src/utils/base/base-entity';
import { Column, Entity, Index } from 'typeorm';

export enum UserRole {
    OPERATOR = 'OPERATOR',
    ADMIN = 'ADMIN'
}
@Entity()
@Index(['username'], { unique: true })
export class User extends BaseEntity {
    @Column({ nullable: false })
    username: string;

    @Column({ nullable: false })
    apiSecret: string;

    @Column({ nullable: false, enum: UserRole })
    role: UserRole;
}