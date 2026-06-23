import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ _id: id, isDeleted: false } as FilterQuery<T>);
  }

  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne({ ...query, isDeleted: false });
  }

  async find(query: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find({ ...query, isDeleted: false });
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id, isDeleted: false } as FilterQuery<T>, 
      data, 
      { new: true }
    );
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id } as FilterQuery<T>,
      { isDeleted: true, deletedAt: new Date() } as UpdateQuery<T>,
      { new: true }
    );
  }
}
