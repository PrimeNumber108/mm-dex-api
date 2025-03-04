import { BaseEntity } from 'src/libs/base/base-entity';
import { TypeormTransformers } from 'src/libs/utils/transformers';
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
    apiSecretHash: string;

    @Column({ nullable: false, enum: UserRole })
    role: UserRole;
}