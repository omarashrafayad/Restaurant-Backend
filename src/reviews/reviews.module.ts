import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelNames } from '../common/data-accsess/model-names.enum.js';
import { Review, ReviewSchema } from './schema/review.schema.js';
import { ReviewRepository } from './repository/review.repository.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewUseCase } from './use-cases/create-review.usecase.js';
import { FindAllReviewsUseCase } from './use-cases/find-all-reviews.usecase.js';
import { FindReviewByIdUseCase } from './use-cases/find-review-by-id.usecase.js';
import { UpdateReviewUseCase } from './use-cases/update-review.usecase.js';
import { DeleteReviewUseCase } from './use-cases/delete-review.usecase.js';
import { ProductsModule } from '../products/products.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelNames.Reviews, schema: ReviewSchema }]),
    ProductsModule,
  ],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    ReviewRepository,
    CreateReviewUseCase,
    FindAllReviewsUseCase,
    FindReviewByIdUseCase,
    UpdateReviewUseCase,
    DeleteReviewUseCase,
  ],
  exports: [ReviewsService, ReviewRepository],
})
export class ReviewsModule {}
