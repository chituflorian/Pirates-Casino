import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

export const MAX_MESSAGE_COUNT = 5000;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}
  async getMessageById(messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOneBy({ id: messageId });
    if (!message) {
      throw new NotFoundException(`Message with id ${messageId} not found`);
    }
    return message;
  }
  async getMessages(limit = 20): Promise<Message[]> {
    return await this.messageRepository.find({
      take: limit,
    });
  }
  async saveMessage(
    userId: number,
    messageText: string,
    originalMessageId?: string,
  ): Promise<Message> {
    try {
      // Save the message entity to the database
      const savedMessage = await this.messageRepository.save({
        message: messageText,
        userId,
        repliedTo: originalMessageId,
      });

      return savedMessage;
    } catch (error) {
      // Handle or log the error appropriately
      console.error('Error saving message:', error);
      throw error;
    }
  }
  async likeMessage(messageId: string, userId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });
    if (message) {
      // Check if the user already liked the message to avoid duplicates
      if (!message.likedBy.includes(userId)) {
        message.likedBy.push(userId);
        await this.messageRepository.save(message);
      }
    }
  }
  async removeLikeFromMessage(
    messageId: string,
    userId: number,
  ): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });
    if (message) {
      // Remove the userId from the likedBy array
      message.likedBy = message.likedBy.filter((id) => id !== userId);
      await this.messageRepository.save(message);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteOldMessages(): Promise<string> {
    this.logger.log('Deleting old messages...');
    const currentMessageCount = await this.messageRepository.count();
    if (currentMessageCount < MAX_MESSAGE_COUNT) {
      this.logger.log('No messages to delete.');
      return 'No messages to delete.';
    }
    const messagesToDelete = await this.messageRepository.find({
      order: {
        createdAt: 'ASC',
      },
      take: currentMessageCount - MAX_MESSAGE_COUNT,
    });
    for (const message of messagesToDelete) {
      await this.messageRepository.remove(message);
    }
    this.logger.log(`Deleted ${messagesToDelete.length} messages.`);
    return `Deleted ${messagesToDelete.length} messages.`;
  }
}
