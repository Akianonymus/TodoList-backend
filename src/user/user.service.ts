import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ReqUser } from '../auth/interfaces';
import { FindUserDto } from './dto/find-user.dto';
import { APIConstants } from '../consts';
import CustomResponse, {
  HandleExceptionResponse,
} from '../utils/custom-response';
import { CustomJwtService } from '../utils/custom-jwt/custom-jwt.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto/reset-password.dto';
import { generateOTP } from '../utils';
import {
  ForgotPassword,
  ForgotPasswordDocument,
  ForgotPasswordOtpStatus,
} from './schemas/forgot-password.schema';
import { CommunicationService } from '../services/communication/communication.service';
import { getSecret } from '../secrets';
import SecretKeys from '../secrets/keys';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(ForgotPassword.name)
    private readonly forgotPasswordModel: Model<ForgotPasswordDocument>,
    public jwtService: CustomJwtService,
    private readonly communication: CommunicationService,
  ) {}

  async findActiveUser(findUserDto: FindUserDto) {
    try {
      const existingUser = await this.userModel.countDocuments(
        { email: findUserDto.email, status: UserStatus.ACTIVE },
        { _id: 1 },
      );

      if (existingUser) {
        return CustomResponse(
          'Valid User',
          APIConstants.Status.Success,
          APIConstants.StatusCode.Ok,
        );
      } else {
        throw Error('Invalid User');
      }
    } catch (err) {
      return HandleExceptionResponse(
        'Fetching user failed',
        err,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userModel.countDocuments({
        email: createUserDto.email,
      });

      if (existingUser) {
        return CustomResponse(
          'User with this email already exists',
          APIConstants.Status.Warning,
          APIConstants.StatusCode.ExistingData,
        );
      }

      const hashedPass = await this.jwtService.createHashedText(
        createUserDto.password,
      );

      const createdUser = await new this.userModel({
        ...createUserDto,
        password: hashedPass,
      }).save();

      return CustomResponse(
        'User created successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
        { _id: createdUser._id, email: createdUser.email },
      );
    } catch (err) {
      return HandleExceptionResponse(
        'User creation failed',
        err,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userModel.findOne(
        { email: forgotPasswordDto.email, status: UserStatus.ACTIVE },
        { _id: 1 },
      );

      if (!user) {
        throw Error('Invalid email');
      }

      const otp = generateOTP();

      await this.communication.sendEmailOtp(
        forgotPasswordDto.email,
        +getSecret(
          SecretKeys.VENDOR_MAILJET_SEND_FORGOT_PASSWORD_OTP_TEMPLATE_ID,
        ),
        { otp: otp },
      );

      const resetRequest = await new this.forgotPasswordModel({
        userId: user._id,
        otp: otp,
      }).save();

      return CustomResponse(
        'Forgot password successfully initiated. OTP sent to email',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
        { resetId: resetRequest._id },
      );
    } catch (error) {
      return HandleExceptionResponse(
        'Forgot password request failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    try {
      const forgotPassword = await this.forgotPasswordModel
        .findOne(
          {
            _id: verifyOtpDto.resetID,
            expireAt: { $lt: new Date() },
            status: ForgotPasswordOtpStatus.CREATED,
          },
          { _id: 0 },
        )
        .lean();

      if (!forgotPassword) {
        throw Error('Invalid OTP');
      }

      return CustomResponse(
        'OTP verification successful',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
      );
    } catch (error) {
      return HandleExceptionResponse(
        'Verify OTP failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const forgotPassword = await this.forgotPasswordModel
        .findOne(
          {
            _id: resetPasswordDto.resetId,
            expireAt: { $lt: new Date() },
            status: ForgotPasswordOtpStatus.CREATED,
          },
          { _id: 0 },
        )
        .lean();

      if (!forgotPassword) {
        throw Error('Invalid OTP');
      }

      const hashedPass = await this.jwtService.createHashedText(
        resetPasswordDto.password,
      );

      await this.userModel.updateOne(
        { _id: forgotPassword.userId },
        { password: hashedPass },
      );

      return CustomResponse(
        'Password successfully changed',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
      );
    } catch (error) {
      return HandleExceptionResponse(
        'Reset Password failed',
        error,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  async disableUser(reqUser: ReqUser) {
    try {
      await this.userModel
        .findByIdAndUpdate(
          reqUser.userId,
          { status: UserStatus.INACTIVE },
          { new: true, lean: true },
        )
        .select('_id');

      return CustomResponse(
        'User disabled successfully',
        APIConstants.Status.Success,
        APIConstants.StatusCode.Ok,
      );
    } catch (err) {
      return HandleExceptionResponse(
        'User disable failed',
        err,
        APIConstants.StatusCode.BadRequest,
      );
    }
  }

  // ==========================
  // utility functions
  // ==========================
  async getUserInfo(
    filter: FilterQuery<UserDocument>,
    projection?: ProjectionType<UserDocument>,
    options?: QueryOptions<UserDocument>,
  ) {
    try {
      return await this.userModel.findOne(filter, projection, options).lean();
    } catch (err) {
      throw err;
    }
  }

  async validUser(filter: FilterQuery<UserDocument>) {
    try {
      return await this.userModel.countDocuments(filter);
    } catch (err) {
      throw err;
    }
  }

  // start a session and return the session
  async getDBSession(): Promise<ClientSession> {
    try {
      return await this.userModel.startSession();
    } catch (err) {
      throw err;
    }
  }

  async updateUserInfo(
    filter: FilterQuery<UserDocument>,
    updateDoc: UpdateQuery<UserDocument>,
    options: QueryOptions<UserDocument>,
  ) {
    try {
      return await this.userModel.findOneAndUpdate(filter, updateDoc, options);
    } catch (err) {
      throw err;
    }
  }
}
