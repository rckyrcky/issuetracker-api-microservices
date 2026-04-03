import { IHashService } from 'src/common/interfaces/hash.interface';
import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService implements IHashService {
  async hash(text: string): Promise<string> {
    return await bcrypt.hash(text, 12);
  }

  async verify(text: string, hashedText: string): Promise<boolean> {
    return await bcrypt.compare(text, hashedText);
  }
}
