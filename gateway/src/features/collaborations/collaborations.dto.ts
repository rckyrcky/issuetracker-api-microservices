import { ApiProperty } from '@nestjs/swagger';
import { Email } from 'src/common/decorators';

export class NewCollaborationInputDto {
  @ApiProperty({
    description: 'collaborator email',
    example: 'john@example.com',
  })
  @Email()
  email: string;
}

export class UpdateCollaborationInputDto extends NewCollaborationInputDto {}
