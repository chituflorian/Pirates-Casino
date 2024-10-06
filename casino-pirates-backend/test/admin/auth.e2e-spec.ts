import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ethers } from 'ethers';
import { Repository } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { APP_URL, PRIVATE_KEYS } from '../utils/constants';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userData: { bearerToken: string; userId: number; refreshToken: string };
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    const response = await request(APP_URL)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${userData.bearerToken}`);

    expect(response.status).toBe(204); // OK
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should successfully login with correct address and signature  /api/auth/login-or-register', async () => {
    const wallet = new ethers.Wallet(PRIVATE_KEYS[0].privateKey);
    const message = await getMessageToSign(wallet.address);
    const signature = await wallet.signMessage(message);

    const response = await request(APP_URL)
      .post('/api/auth/login-or-register')
      .send({
        address: wallet.address,
        signature: signature,
        chainTypeId: 1,
      })
      .expect(200);

    expect(response.body.status).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.tokenExpires).toBeDefined();
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.referralCode).toBeDefined();
    userData = {
      bearerToken: response.body.data.token,
      refreshToken: response.body.data.refreshToken,
      userId: response.body.data.user.id,
    };
  });

  it('should fail login with incorrect signature /api/auth/login-or-register', async () => {
    const wallet = new ethers.Wallet(PRIVATE_KEYS[0].privateKey);
    await getMessageToSign(wallet.address); //make the request for message but ignore it
    const signature = await wallet.signMessage('Incorrect message');

    const response = await request(APP_URL)
      .post('/api/auth/login-or-register')
      .send({
        address: wallet.address,
        signature: signature,
        chainTypeId: 1,
      });

    expect(response.body).toEqual({
      status: false,
      message: 'Invalid signature',
      data: null,
    });
  });

  it('should fail if the chain id contains an invalid value on  /api/auth/link', async () => {
    // Assuming we have a valid token and user setup
    const wallet = new ethers.Wallet(PRIVATE_KEYS[0].privateKey);
    const message = await getMessageToSign(wallet.address);
    const signature = await wallet.signMessage(message);

    const response = await request(APP_URL)
      .patch('/api/auth/link')
      .set('Authorization', `Bearer ${userData.bearerToken}`)
      .send({
        address: wallet.address,
        signature,
        chainTypeId: 'invalid', // Invalid chainTypeId
      });

    expect(response.body.status).toBe(false); // Bad Request
    expect(response.body.data).toBe(null);
  });

  it('should fail if the chain id does not exist', async () => {
    // Assuming we have a valid token and user setup
    const wallet = new ethers.Wallet(PRIVATE_KEYS[0].privateKey);
    const message = await getMessageToSign(wallet.address);
    const signature = await wallet.signMessage(message);

    const response = await request(APP_URL)
      .patch('/api/auth/link')
      .set('Authorization', `Bearer ${userData.bearerToken}`)
      .send({
        address: wallet.address,
        signature,
        chainTypeId: 9999, // Non-existent chainTypeId
      });

    expect(response.body.status).toBe(false); // Not Found
    expect(response.body.data).toBe(null);
  });

  it('should create successful entry on /api/auth/link', async () => {
    // Assuming we have a valid token and user setup
    const wallet = new ethers.Wallet(PRIVATE_KEYS[1].privateKey);
    const message = await getMessageToSign(wallet.address);
    const signature = await wallet.signMessage(message);

    const response = await request(APP_URL)
      .patch('/api/auth/link')
      .set('Authorization', `Bearer ${userData.bearerToken}`)
      .send({
        address: wallet.address,
        signature: signature,
        chainTypeId: 1,
      });

    expect(response.status).toBe(200); // OK

    // Fetch the user again to check if the new wallet was linked
    const updatedUser = await userRepository.findOne({
      where: { id: userData.userId },
      relations: ['wallets'],
    });
    expect(updatedUser).toBeDefined();
    if (!updatedUser) throw new Error('User not found');
    expect(updatedUser.wallets).toContainEqual(
      expect.objectContaining({ address: wallet.address }),
    );
    expect(updatedUser.wallets).toHaveLength(2);
  });

  it('should successfully login with linked wallet on /api/auth/login-or-register', async () => {
    const wallet = new ethers.Wallet(PRIVATE_KEYS[1].privateKey);
    const message = await getMessageToSign(wallet.address);
    const signature = await wallet.signMessage(message);

    const response = await request(APP_URL)
      .post('/api/auth/login-or-register')
      .send({
        address: wallet.address,
        signature: signature,
        chainTypeId: 1,
      })
      .expect(200);

    expect(response.body.status).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
    expect(response.body.data.tokenExpires).toBeDefined();
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.referralCode).toBeDefined();
    expect(response.body.data.user.id).toBe(userData.userId);
  });

  it('should fail login if 30 seconds have passed  /api/auth/login-or-register', async () => {
    const wallet = new ethers.Wallet(PRIVATE_KEYS[0].privateKey);

    const message = await getMessageToSign(wallet.address);
    const signature = await wallet.signMessage(message);

    await new Promise((resolve) => setTimeout(resolve, 51000)); // Wait 51 seconds

    const response = await request(APP_URL)
      .post('/api/auth/login-or-register')
      .send({
        address: wallet.address,
        signature: signature,
        chainTypeId: 1,
      });

    expect(response.body).toEqual({
      status: false,
      message: 'No message found for this wallet address',
      data: null,
    });
  }, 70000);

  const getMessageToSign = async (address: string) => {
    const messageResponse = await request(APP_URL)
      .post('/api/auth/message')
      .send({ walletAddress: address });

    expect(messageResponse.body).toBeDefined();
    expect(messageResponse.body.status).toBe(true);
    expect(messageResponse.body.data).toBeDefined();
    return messageResponse.body.data;
  };
});
