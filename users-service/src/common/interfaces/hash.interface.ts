export interface IHashService {
  hash(text: string): Promise<string>;
  verify(text: string, hashedText: string): Promise<boolean>;
}
