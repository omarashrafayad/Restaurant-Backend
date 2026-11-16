import {
  AggregateOptions,
  HydratedDocument,
  Model,
  PipelineStage,
  QueryOptions,
  UpdateQuery,
  ClientSession,
} from 'mongoose';

export interface CreateOptions {
  session?: ClientSession;
}

export interface FindPaginatedOptions extends QueryOptions {
  page?: number;
  limit?: number;
  ignoreLimit?: boolean;
  sort?: string;
  fields?: string;
  populate?: any;
}

export interface PaginatedAggregationOptions {
  page?: number;
  limit?: number;
  ignoreLimit?: boolean;
  session?: ClientSession;
}

export interface UpdateManyOptions {
  session?: ClientSession;
}

export interface FindByIdAndDeleteOptions {
  session?: ClientSession;
}

export interface DeleteManyOptions {
  session?: ClientSession;
}

export interface FindOneOptions {
  session?: ClientSession;
  populate?: any;
}

export interface FindOneAndDeleteOptions {
  session?: ClientSession;
}

export class PaginatedResult<T> {
  data: Array<T>;
  totalCount: number;
  page: number | undefined;
  limit: number | undefined;
  pageCount: number;

  constructor(
    data: Array<T>,
    totalCount: number,
    page?: number,
    limit?: number,
  ) {
    this.data = data;
    this.totalCount = totalCount;
    this.page = page;
    this.limit = limit;
    this.pageCount = Math.ceil(totalCount / (limit || 10)) || 0;
  }
}

export class BaseRepository<T> {
  constructor(public readonly model: Model<T>) {}

  async create(
    body: Partial<T> | any,
    options?: CreateOptions,
  ): Promise<HydratedDocument<T>> {
    const document = new this.model(body);

    await document.save({
      session: options?.session,
    });

    return document;
  }

  async findById(id: string | number, options: QueryOptions = { lean: true }) {
    let query = this.model.findById(id, undefined, options);
    if (options.populate) {
      query = query.populate(options.populate as any);
    }
    const document = await query;
    return document;
  }

  async find(
    filterQuery: Record<string, unknown> = {},
    options: QueryOptions = {},
  ) {
    let query = this.model.find(filterQuery, undefined, options);
    if (options.populate) {
      query = query.populate(options.populate as any);
    }
    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    const documents = await query;
    return documents;
  }

  async findOne(
    filterQuery: Record<string, unknown> = {},
    options?: FindOneOptions,
  ) {
    let query = this.model.findOne(filterQuery, undefined, {
      session: options?.session,
      lean: true,
    });
    if (options?.populate) {
      query = query.populate(options.populate);
    }
    const document = await query;
    return document;
  }

  async findByIdAndUpdate(
    id: string | number,
    updateQuery: UpdateQuery<HydratedDocument<T>>,
    options: QueryOptions = {},
  ) {
    const document = await this.model.findByIdAndUpdate(id, updateQuery, {
      returnDocument: 'after',
      runValidators: true,
      ...options,
    });
    return document;
  }

  async findOneAndUpdate(
    filterQuery: Record<string, unknown>,
    updateQuery: UpdateQuery<HydratedDocument<T>>,
    options: QueryOptions = {},
  ) {
    const document = await this.model.findOneAndUpdate(
      filterQuery,
      updateQuery,
      {
        returnDocument: 'after',
        runValidators: true,
        ...options,
      },
    );
    return document;
  }

  async findByIdAndDelete(
    id: string | number,
    options?: FindByIdAndDeleteOptions,
  ) {
    const document = await this.model.findByIdAndDelete(id, {
      session: options?.session,
    });
    return document;
  }

  async aggregate<Response = any>(
    pipeline: PipelineStage[],
    options: AggregateOptions = {},
  ) {
    const result = await this.model.aggregate<Response>(pipeline, options);
    return result;
  }

  async count(filterQuery: Record<string, unknown> = {}) {
    const count = await this.model.countDocuments(filterQuery);
    return count;
  }

  async findPaginated(
    filterQuery: Record<string, unknown> = {},
    options?: FindPaginatedOptions,
  ): Promise<PaginatedResult<T>> {
    options = options || {};
    const page = options.page || 1;
    let limit = options.limit || 10;

    let mongooseQuery = this.model.find(filterQuery);

    if (options.populate) {
      mongooseQuery = mongooseQuery.populate(options.populate);
    }

    if (options.fields) {
      const selectFields = options.fields.split(',').join(' ');
      mongooseQuery = mongooseQuery.select(selectFields);
    } else {
      mongooseQuery = mongooseQuery.select('-__v');
    }

    if (options.sort) {
      const sortBy = options.sort.split(',').join(' ');
      mongooseQuery = mongooseQuery.sort(`${sortBy} -_id`);
    } else {
      mongooseQuery = mongooseQuery.sort('-createdAt -_id');
    }

    const totalCount = await this.model.countDocuments(filterQuery);

    if (!options.ignoreLimit) {
      const skip = (page - 1) * limit;
      mongooseQuery = mongooseQuery.skip(skip).limit(limit);
    }

    const data = await mongooseQuery.lean();

    return new PaginatedResult<T>(
      data as T[],
      totalCount,
      page,
      options.ignoreLimit ? totalCount : limit,
    );
  }

  async findOneAndDelete(
    filterQuery: Record<string, unknown> = {},
    options?: FindOneAndDeleteOptions,
  ) {
    const document = await this.model.findOneAndDelete(filterQuery, {
      session: options?.session,
    });
    return document;
  }

  async updateMany(
    filterQuery: Record<string, unknown>,
    updateQuery: UpdateQuery<HydratedDocument<T>>,
    options?: UpdateManyOptions,
  ) {
    const result = await this.model.updateMany(filterQuery, updateQuery, {
      session: options?.session,
      runValidators: true,
    });
    return result;
  }

  async deleteMany(
    filterQuery: Record<string, unknown>,
    options?: DeleteManyOptions,
  ): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany(filterQuery, {
      session: options?.session,
    });
    return result;
  }

  async bulkWrite(ops: any[], options?: any) {
    return this.model.bulkWrite(ops, options);
  }

  async paginatedAggregation<Response = any>(
    pipeline: PipelineStage[],
    options?: PaginatedAggregationOptions,
  ): Promise<PaginatedResult<Response>> {
    if (options?.ignoreLimit && options?.limit) {
      const optionsWithoutLimit = { ...options };
      delete optionsWithoutLimit.limit;
      options = optionsWithoutLimit;
    }

    const skip = options?.ignoreLimit
      ? undefined
      : options?.page && options?.limit
        ? (options.page - 1) * options.limit
        : undefined;

    const limit = options?.ignoreLimit ? undefined : options?.limit;

    const paginatedPipeline = [
      ...pipeline,
      ...(skip ? [{ $skip: skip }] : []),
      ...(limit ? [{ $limit: limit }] : []),
    ];

    const counterPipeline = [
      ...pipeline,
      { $group: { _id: null, count: { $sum: 1 } } },
    ];

    const [documents, counter] = await Promise.all([
      this.aggregate<Response>(paginatedPipeline, {
        session: options?.session,
      }),
      this.aggregate<{ _id: null; count: number }>(counterPipeline, {
        session: options?.session,
      }),
    ]);

    const totalCount = counter[0] ? counter[0].count : 0;

    return new PaginatedResult<Response>(
      documents,
      totalCount,
      options?.page,
      options?.limit,
    );
  }
}
