import {
  Column,
  CreateDateColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryColumn()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: false })
  deleted: boolean;

  @Column({ nullable: true })
  deletedBy: string;

  @Column({ nullable: true })
  deletedAt: Date;
}
