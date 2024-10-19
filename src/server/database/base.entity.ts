import { ApiProperty } from '@nestjs/swagger';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

export abstract class BaseEntity {
  @ApiProperty({ type: String })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ type: Date })
  @CreateDateColumn({
    type: 'timestamp without time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  createdBy: string;

  @ApiProperty({ type: Date })
  @UpdateDateColumn({
    type: 'timestamp without time zone',
    name: 'updated_at',
  })
  updatedAt: Date;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  updatedBy: string;

  @ApiProperty({ type: Boolean })
  @Column({ default: false })
  deleted: boolean;

  @ApiProperty({ type: String })
  @Column({ nullable: true })
  deletedBy: string;

  @ApiProperty({ type: Date })
  @Column({ nullable: true })
  deletedAt: Date;
}
